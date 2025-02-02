use std::sync::Arc;

use apalis::sqlite::SqliteStorage;
use async_graphql::{Error, Result};
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts, StatusCode},
    Extension, RequestPartsExt,
};
use chrono::{NaiveDate, Utc};
use http_types::headers::HeaderName;
use itertools::Itertools;
use openidconnect::{
    core::{CoreClient, CoreProviderMetadata},
    reqwest::async_http_client,
    ClientId, ClientSecret, IssuerUrl, RedirectUrl,
};
use rs_utils::PROJECT_NAME;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait,
    PartialModelTrait, QueryFilter,
};
use surf::{
    http::headers::{ToHeaderValues, USER_AGENT},
    Client, Config, Url,
};

use crate::{
    background::{ApplicationJob, CoreApplicationJob},
    entities::{
        collection, collection_to_entity,
        prelude::{Collection, CollectionToEntity, User, UserToEntity},
        user, user_to_entity,
    },
    exporter::ExporterService,
    file_storage::FileStorageService,
    fitness::resolver::ExerciseService,
    importer::ImporterService,
    jwt,
    miscellaneous::resolver::MiscellaneousService,
    models::{ChangeCollectionToEntityInput, StoredUrl},
};

pub static BASE_DIR: &str = env!("CARGO_MANIFEST_DIR");
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const AUTHOR: &str = "ignisda";
pub const AUTHOR_EMAIL: &str = "ignisda2001@gmail.com";
pub const USER_AGENT_STR: &str = const_str::concat!(
    AUTHOR,
    "/",
    PROJECT_NAME,
    "-v",
    VERSION,
    " (",
    AUTHOR_EMAIL,
    ")"
);
pub const AVATAR_URL: &str =
    "https://raw.githubusercontent.com/IgnisDa/ryot/main/libs/assets/icon-512x512.png";
pub const TEMP_DIR: &str = "tmp";

const FRONTEND_OAUTH_ENDPOINT: &str = "/api/auth";

/// All the services that are used by the app
pub struct AppServices {
    pub config: Arc<config::AppConfig>,
    pub media_service: Arc<MiscellaneousService>,
    pub importer_service: Arc<ImporterService>,
    pub exporter_service: Arc<ExporterService>,
    pub file_storage_service: Arc<FileStorageService>,
    pub exercise_service: Arc<ExerciseService>,
}

async fn create_oidc_client(config: &config::AppConfig) -> Option<CoreClient> {
    match RedirectUrl::new(config.frontend.url.clone() + FRONTEND_OAUTH_ENDPOINT) {
        Ok(redirect_url) => match IssuerUrl::new(config.server.oidc.issuer_url.clone()) {
            Ok(issuer_url) => CoreProviderMetadata::discover_async(issuer_url, &async_http_client)
                .await
                .ok()
                .map(|provider| {
                    CoreClient::from_provider_metadata(
                        provider,
                        ClientId::new(config.server.oidc.client_id.clone()),
                        Some(ClientSecret::new(config.server.oidc.client_secret.clone())),
                    )
                    .set_redirect_uri(redirect_url)
                }),
            _ => None,
        },
        _ => None,
    }
}

#[allow(clippy::too_many_arguments)]
pub async fn create_app_services(
    db: DatabaseConnection,
    s3_client: aws_sdk_s3::Client,
    config: Arc<config::AppConfig>,
    perform_application_job: &SqliteStorage<ApplicationJob>,
    perform_core_application_job: &SqliteStorage<CoreApplicationJob>,
    timezone: chrono_tz::Tz,
) -> AppServices {
    let timezone = Arc::new(timezone);
    let file_storage_service = Arc::new(FileStorageService::new(
        s3_client,
        config.file_storage.s3_bucket_name.clone(),
    ));
    let exercise_service = Arc::new(ExerciseService::new(
        &db,
        config.clone(),
        file_storage_service.clone(),
        perform_application_job,
    ));
    let oidc_client = Arc::new(create_oidc_client(&config).await);

    let media_service = Arc::new(
        MiscellaneousService::new(
            &db,
            config.clone(),
            file_storage_service.clone(),
            perform_application_job,
            perform_core_application_job,
            timezone.clone(),
            oidc_client.clone(),
        )
        .await,
    );
    let importer_service = Arc::new(ImporterService::new(
        media_service.clone(),
        exercise_service.clone(),
        timezone.clone(),
    ));
    let exporter_service = Arc::new(ExporterService::new(
        config.clone(),
        file_storage_service.clone(),
        media_service.clone(),
        exercise_service.clone(),
    ));
    AppServices {
        config,
        media_service,
        importer_service,
        exporter_service,
        file_storage_service,
        exercise_service,
    }
}

pub async fn get_user_to_entity_association<C>(
    user_id: &i32,
    metadata_id: Option<i32>,
    person_id: Option<i32>,
    exercise_id: Option<String>,
    metadata_group_id: Option<i32>,
    db: &C,
) -> Option<user_to_entity::Model>
where
    C: ConnectionTrait,
{
    UserToEntity::find()
        .filter(user_to_entity::Column::UserId.eq(user_id.to_owned()))
        .filter(
            user_to_entity::Column::MetadataId
                .eq(metadata_id.to_owned())
                .or(user_to_entity::Column::PersonId
                    .eq(person_id.to_owned())
                    .or(user_to_entity::Column::ExerciseId.eq(exercise_id.to_owned()))
                    .or(user_to_entity::Column::MetadataGroupId.eq(metadata_group_id.to_owned()))),
        )
        .one(db)
        .await
        .ok()
        .flatten()
}

pub async fn associate_user_with_entity<C>(
    user_id: &i32,
    metadata_id: Option<i32>,
    person_id: Option<i32>,
    exercise_id: Option<String>,
    metadata_group_id: Option<i32>,
    db: &C,
) -> Result<user_to_entity::Model>
where
    C: ConnectionTrait,
{
    let user_to_meta = get_user_to_entity_association(
        user_id,
        metadata_id,
        person_id,
        exercise_id.clone(),
        metadata_group_id,
        db,
    )
    .await;
    Ok(match user_to_meta {
        None => {
            let user_to_meta = user_to_entity::ActiveModel {
                user_id: ActiveValue::Set(*user_id),
                metadata_id: ActiveValue::Set(metadata_id),
                person_id: ActiveValue::Set(person_id),
                exercise_id: ActiveValue::Set(exercise_id),
                metadata_group_id: ActiveValue::Set(metadata_group_id),
                last_updated_on: ActiveValue::Set(Utc::now()),
                needs_to_be_updated: ActiveValue::Set(Some(true)),
                ..Default::default()
            };
            user_to_meta.insert(db).await.unwrap()
        }
        Some(u) => {
            let mut to_update: user_to_entity::ActiveModel = u.into();
            to_update.last_updated_on = ActiveValue::Set(Utc::now());
            to_update.needs_to_be_updated = ActiveValue::Set(Some(true));
            to_update.update(db).await.unwrap()
        }
    })
}

pub fn user_id_from_token(token: &str, jwt_secret: &str) -> Result<i32> {
    jwt::verify(token, jwt_secret)
        .map(|c| c.sub.parse().unwrap())
        .map_err(|e| Error::new(format!("Encountered error: {:?}", e)))
}

pub fn get_base_http_client(
    url: &str,
    headers: Vec<(impl Into<HeaderName>, impl ToHeaderValues)>,
) -> Client {
    let mut config = Config::new()
        .add_header(USER_AGENT, USER_AGENT_STR)
        .unwrap();
    for (header, value) in headers.into_iter() {
        config = config.add_header(header, value).unwrap();
    }
    config
        .set_base_url(Url::parse(url).unwrap())
        .try_into()
        .unwrap()
}

pub async fn get_stored_asset(
    url: StoredUrl,
    file_storage_service: &Arc<FileStorageService>,
) -> String {
    match url {
        StoredUrl::Url(u) => u,
        StoredUrl::S3(u) => file_storage_service.get_presigned_url(u).await,
    }
}

type CteCol = collection_to_entity::Column;

pub async fn entity_in_collections(
    db: &DatabaseConnection,
    user_id: i32,
    metadata_id: Option<i32>,
    person_id: Option<i32>,
    media_group_id: Option<i32>,
    exercise_id: Option<String>,
) -> Result<Vec<collection::Model>> {
    let user_collections = Collection::find()
        .filter(collection::Column::UserId.eq(user_id))
        .all(db)
        .await
        .unwrap();
    let mtc = CollectionToEntity::find()
        .filter(
            CteCol::CollectionId.is_in(user_collections.into_iter().map(|c| c.id).collect_vec()),
        )
        .filter(
            CteCol::MetadataId
                .eq(metadata_id)
                .or(CteCol::PersonId.eq(person_id))
                .or(CteCol::MetadataGroupId.eq(media_group_id))
                .or(CteCol::ExerciseId.eq(exercise_id)),
        )
        .find_also_related(Collection)
        .all(db)
        .await
        .unwrap();
    let resp = mtc.into_iter().flat_map(|(_, b)| b).collect_vec();
    Ok(resp)
}

pub async fn add_entity_to_collection(
    db: &DatabaseConnection,
    user_id: i32,
    input: ChangeCollectionToEntityInput,
) -> Result<bool> {
    let collection = Collection::find()
        .filter(collection::Column::UserId.eq(user_id.to_owned()))
        .filter(collection::Column::Name.eq(input.collection_name))
        .one(db)
        .await
        .unwrap()
        .unwrap();
    let mut updated: collection::ActiveModel = collection.into();
    updated.last_updated_on = ActiveValue::Set(Utc::now());
    let collection = updated.update(db).await.unwrap();
    let resp = if let Some(etc) = CollectionToEntity::find()
        .filter(CteCol::CollectionId.eq(collection.id))
        .filter(
            CteCol::MetadataId
                .eq(input.metadata_id)
                .or(CteCol::PersonId.eq(input.person_id))
                .or(CteCol::MetadataGroupId.eq(input.metadata_group_id))
                .or(CteCol::ExerciseId.eq(input.exercise_id.clone())),
        )
        .one(db)
        .await?
    {
        let mut to_update: collection_to_entity::ActiveModel = etc.into();
        to_update.last_updated_on = ActiveValue::Set(Utc::now());
        to_update.update(db).await.is_ok()
    } else {
        let mut created_collection = collection_to_entity::ActiveModel {
            collection_id: ActiveValue::Set(collection.id),
            ..Default::default()
        };
        created_collection.metadata_id = ActiveValue::Set(input.metadata_id);
        created_collection.person_id = ActiveValue::Set(input.person_id);
        created_collection.metadata_group_id = ActiveValue::Set(input.metadata_group_id);
        created_collection.exercise_id = ActiveValue::Set(input.exercise_id);
        created_collection.insert(db).await.is_ok()
    };
    Ok(resp)
}

pub fn get_current_date(timezone: &chrono_tz::Tz) -> NaiveDate {
    Utc::now().with_timezone(timezone).date_naive()
}

pub async fn user_by_id(db: &DatabaseConnection, user_id: i32) -> Result<user::Model> {
    User::find_by_id(user_id)
        .one(db)
        .await
        .unwrap()
        .ok_or_else(|| Error::new("No user found"))
}

// DEV: Use this wherever possible since this results in less memory consumption.
pub async fn partial_user_by_id<T>(db: &DatabaseConnection, user_id: i32) -> Result<T>
where
    T: PartialModelTrait,
{
    User::find_by_id(user_id)
        .into_partial_model::<T>()
        .one(db)
        .await
        .unwrap_or_default()
        .ok_or_else(|| Error::new("No user found"))
}

#[derive(Debug, Default)]
pub struct AuthContext {
    pub auth_token: Option<String>,
    pub user_id: Option<i32>,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthContext
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let mut ctx = AuthContext {
            ..Default::default()
        };
        if let Some(h) = parts.headers.get(AUTHORIZATION) {
            ctx.auth_token = h.to_str().map(|s| s.replace("Bearer ", "")).ok();
        } else if let Some(h) = parts.headers.get("x-auth-token") {
            ctx.auth_token = h.to_str().map(String::from).ok();
        }
        if let Some(auth_token) = ctx.auth_token.as_ref() {
            let Extension(config) = parts
                .extract::<Extension<Arc<config::AppConfig>>>()
                .await
                .unwrap();
            if let Ok(user_id) = user_id_from_token(auth_token, &config.users.jwt_secret) {
                ctx.user_id = Some(user_id);
            }
        }
        Ok(ctx)
    }
}

pub fn ilike_sql(value: &str) -> String {
    format!("%{value}%")
}
