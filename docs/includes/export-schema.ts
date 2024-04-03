// Automatically generated by schematic. DO NOT MODIFY!

/* eslint-disable */

/** The actual statistics that were logged in a user measurement. */
export interface UserMeasurementStats {
	abdominal_skinfold: string | null;
	basal_metabolic_rate: string | null;
	biceps_circumference: string | null;
	body_fat: string | null;
	body_fat_caliper: string | null;
	body_mass_index: string | null;
	bone_mass: string | null;
	calories: string | null;
	chest_circumference: string | null;
	chest_skinfold: string | null;
	custom: Record<string, string> | null;
	hip_circumference: string | null;
	lean_body_mass: string | null;
	muscle: string | null;
	neck_circumference: string | null;
	thigh_circumference: string | null;
	thigh_skinfold: string | null;
	total_body_water: string | null;
	total_daily_energy_expenditure: string | null;
	visceral_fat: string | null;
	waist_circumference: string | null;
	waist_to_height_ratio: string | null;
	waist_to_hip_ratio: string | null;
	weight: string | null;
}

/** An export of a measurement taken at a point in time. */
export interface UserMeasurement {
	/** Any comment associated entered by the user. */
	comment: string | null;
	/** The name given to this measurement by the user. */
	name: string | null;
	/** The contents of the actual measurement. */
	stats: UserMeasurementStats;
	/** The date and time this measurement was made. */
	timestamp: string;
}

export type MediaLot = 'AudioBook' | 'Anime' | 'Book' | 'Podcast' | 'Manga' | 'Movie' | 'Show' | 'VideoGame' | 'VisualNovel';

export interface IdAndNamedObject {
	id: number;
	name: string;
}

/** Comments left in replies to posted reviews. */
export interface ImportOrExportItemReviewComment {
	created_on: string;
	id: string;
	/** The user ids of all those who liked it. */
	liked_by: number[];
	text: string;
	user: IdAndNamedObject;
}

export type Visibility = 'public' | 'private';

/** Review data associated to a rating. */
export interface ImportOrExportItemReview {
	/** The date the review was posted. */
	date: string | null;
	/** Whether to mark the review as a spoiler. Defaults to false. */
	spoiler: boolean | null;
	/** Actual text for the review. */
	text: string | null;
	/**
	 * The visibility set by the user.
	 *
	 * @default 'public'
	 */
	visibility: Visibility | null;
}

/** A rating given to an entity. */
export interface ImportOrExportItemRating {
	/** If for an anime, the episode for which this review was for. */
	anime_episode_number: number | null;
	/** The comments attached to this review. */
	comments: ImportOrExportItemReviewComment[] | null;
	/** If for a manga, the chapter for which this review was for. */
	manga_chapter_number: number | null;
	/** If for a podcast, the episode for which this review was for. */
	podcast_episode_number: number | null;
	/** The score of the review. */
	rating: string | null;
	/** Data about the review. */
	review: ImportOrExportItemReview | null;
	/** If for a show, the episode for which this review was for. */
	show_episode_number: number | null;
	/** If for a show, the season for which this review was for. */
	show_season_number: number | null;
}

/** A specific instance when an entity was seen. */
export interface ImportOrExportMediaItemSeen {
	/** If for an anime, the episode which was seen. */
	anime_episode_number: number | null;
	/** The timestamp when finished watching. */
	ended_on: string | null;
	/** If for a manga, the chapter which was seen. */
	manga_chapter_number: number | null;
	/** If for a podcast, the episode which was seen. */
	podcast_episode_number: number | null;
	/** The progress of media done. If none, it is considered as done. */
	progress: string | null;
	/** The provider this item was watched on. */
	provider_watched_on: string | null;
	/** If for a show, the episode which was seen. */
	show_episode_number: number | null;
	/** If for a show, the season which was seen. */
	show_season_number: number | null;
	/** The timestamp when started watching. */
	started_on: string | null;
}

export type MediaSource = 'Anilist' | 'Audible' | 'Custom' | 'GoogleBooks' | 'Igdb' | 'Itunes' | 'Listennotes' | 'MangaUpdates' | 'Mal' | 'Openlibrary' | 'Tmdb' | 'Vndb';

/** Details about a specific media item that needs to be imported or exported. */
export interface ImportOrExportMediaItem {
	/** The collections this entity was added to. */
	collections: string[];
	/** The provider identifier. For eg: TMDB-ID, Openlibrary ID and so on. */
	identifier: string;
	/**
	 * The type of media.
	 *
	 * @default 'Book'
	 */
	lot: MediaLot;
	/** The review history for the user. */
	reviews: ImportOrExportItemRating[];
	/** The seen history for the user. */
	seen_history: ImportOrExportMediaItemSeen[];
	/**
	 * The source of media.
	 *
	 * @default 'Audible'
	 */
	source: MediaSource;
	/** An string to help identify it in the original source. */
	source_id: string;
}

export interface PersonSourceSpecifics {
	is_anilist_studio: boolean | null;
	is_tmdb_company: boolean | null;
}

/** Details about a specific creator item that needs to be exported. */
export interface ImportOrExportPersonItem {
	/** The collections this entity was added to. */
	collections: string[];
	/** The provider identifier. */
	identifier: string;
	/** The name of the creator. */
	name: string;
	/** The review history for the user. */
	reviews: ImportOrExportItemRating[];
	/**
	 * The source of data.
	 *
	 * @default 'Audible'
	 */
	source: MediaSource;
	/** The source specific data. */
	source_specifics: PersonSourceSpecifics | null;
}

/** The assets that were uploaded for an entity. */
export interface EntityAssets {
	/** The keys of the S3 images. */
	images: string[];
	/** The keys of the S3 videos. */
	videos: string[];
}

export type ExerciseLot = 'Duration' | 'DistanceAndDuration' | 'Reps' | 'RepsAndWeight';

export type SetLot = 'Normal' | 'WarmUp' | 'Drop' | 'Failure';

export type WorkoutSetPersonalBest = 'Weight' | 'OneRm' | 'Volume' | 'Time' | 'Pace' | 'Reps';

/** Details about the statistics of the set performed. */
export interface WorkoutSetStatistic {
	distance: string | null;
	duration: string | null;
	one_rm: string | null;
	pace: string | null;
	reps: number | null;
	volume: string | null;
	weight: string | null;
}

export interface WorkoutSetTotals {
	weight: string | null;
}

/** Details about the set performed. */
export interface WorkoutSetRecord {
	actual_rest_time: number | null;
	confirmed_at: string | null;
	lot: SetLot;
	personal_bests: WorkoutSetPersonalBest[];
	statistic: WorkoutSetStatistic;
	totals: WorkoutSetTotals;
}

/** The totals of a workout and the different bests achieved. */
export interface WorkoutOrExerciseTotals {
	distance: string;
	duration: string;
	/** The number of personal bests achieved. */
	personal_bests_achieved: number;
	reps: number;
	/** The total seconds that were logged in the rest timer. */
	rest_time: number;
	weight: string;
}

/** An exercise that has been processed and committed to the database. */
export interface ProcessedExercise {
	assets: EntityAssets;
	lot: ExerciseLot;
	name: string;
	notes: string[];
	rest_time: number | null;
	sets: WorkoutSetRecord[];
	/** The indices of the exercises with which this has been superset with. */
	superset_with: number[];
	total: WorkoutOrExerciseTotals;
}

/** Information about a workout done. */
export interface WorkoutInformation {
	assets: EntityAssets;
	exercises: ProcessedExercise[];
}

/** The summary about an exercise done in a workout. */
export interface WorkoutSummaryExercise {
	best_set: WorkoutSetRecord;
	id: string;
	lot: ExerciseLot;
	num_sets: number;
}

export interface WorkoutSummary {
	exercises: WorkoutSummaryExercise[];
	total: WorkoutOrExerciseTotals;
}

/** A workout that was completed by the user. */
export interface Workout {
	comment: string | null;
	end_time: string;
	id: string;
	information: WorkoutInformation;
	name: string;
	repeated_from: string | null;
	start_time: string;
	summary: WorkoutSummary;
}

/** Complete export of the user. */
export interface CompleteExport {
	/** Data about user's measurements. */
	measurements: UserMeasurement[] | null;
	/** Data about user's media. */
	media: ImportOrExportMediaItem[] | null;
	/** Data about user's people. */
	people: ImportOrExportPersonItem[] | null;
	/** Data about user's workouts. */
	workouts: Workout[] | null;
}
