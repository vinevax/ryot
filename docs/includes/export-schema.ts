// Automatically generated by schematic. DO NOT MODIFY!

/* eslint-disable */

export interface UserMeasurementStats {
	abdominalSkinfold: string | null;
	basalMetabolicRate: string | null;
	bicepsCircumference: string | null;
	bodyFat: string | null;
	bodyFatCaliper: string | null;
	bodyMassIndex: string | null;
	boneMass: string | null;
	calories: string | null;
	chestCircumference: string | null;
	chestSkinfold: string | null;
	custom: Record<string, string> | null;
	hipCircumference: string | null;
	leanBodyMass: string | null;
	muscle: string | null;
	neckCircumference: string | null;
	thighCircumference: string | null;
	thighSkinfold: string | null;
	totalBodyWater: string | null;
	totalDailyEnergyExpenditure: string | null;
	visceralFat: string | null;
	waistCircumference: string | null;
	waistToHeightRatio: string | null;
	waistToHipRatio: string | null;
	weight: string | null;
}

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

export type MetadataLot = 'audio-book' | 'anime' | 'book' | 'podcast' | 'manga' | 'movie' | 'show' | 'video-game' | 'visual-novel';

export interface ReviewCommentUser {
	id: number;
	name: string;
}

export interface ImportOrExportItemReviewComment {
	createdOn: string;
	id: string;
	/** The user ids of all those who liked it. */
	likedBy: number[];
	text: string;
	user: ReviewCommentUser;
}

export interface ImportOrExportItemReview {
	/** The date the review was posted. */
	date: string | null;
	/** Whether to mark the review as a spoiler. Defaults to false. */
	spoiler: boolean | null;
	/** Actual text for the review. */
	text: string | null;
}

export interface ImportOrExportItemRating {
	/** The comments attached to this review. */
	comments: ImportOrExportItemReviewComment[] | null;
	/** If for a podcast, the episode for which this review was for. */
	podcastEpisodeNumber: number | null;
	/** The score of the review. */
	rating: string | null;
	/** Data about the review. */
	review: ImportOrExportItemReview | null;
	/** If for a show, the episode for which this review was for. */
	showEpisodeNumber: number | null;
	/** If for a show, the season for which this review was for. */
	showSeasonNumber: number | null;
}

export interface ImportOrExportMediaItemSeen {
	/** The timestamp when finished watching. */
	endedOn: string | null;
	/** If for a podcast, the episode which was seen. */
	podcastEpisodeNumber: number | null;
	/** The progress of media done. If none, it is considered as done. */
	progress: number | null;
	/** If for a show, the episode which was seen. */
	showEpisodeNumber: number | null;
	/** If for a show, the season which was seen. */
	showSeasonNumber: number | null;
	/** The timestamp when started watching. */
	startedOn: string | null;
}

export type MetadataSource = 'anilist' | 'audible' | 'custom' | 'google-books' | 'igdb' | 'itunes' | 'listennotes' | 'manga-updates' | 'mal' | 'openlibrary' | 'tmdb' | 'vndb';

export interface ImportOrExportMediaItem {
	/** The collections this entity was added to. */
	collections: string[];
	/** The provider identifier. For eg: TMDB-ID, Openlibrary ID and so on. */
	identifier: string;
	/** The type of media. */
	lot: MetadataLot;
	/** The review history for the user. */
	reviews: ImportOrExportItemRating[];
	/** The seen history for the user. */
	seenHistory: ImportOrExportMediaItemSeen[];
	/** The source of media. */
	source: MetadataSource;
	/** An string to help identify it in the original source. */
	sourceId: string;
}

export interface ImportOrExportPersonItem {
	/** The collections this entity was added to. */
	collections: string[];
	/** The name of the creator. */
	name: string;
	/** The review history for the user. */
	reviews: ImportOrExportItemRating[];
}

export interface EntityAssets {
	/** The keys of the S3 images. */
	images: string[];
	/** The keys of the S3 videos. */
	videos: string[];
}

export type ExerciseLot = 'duration' | 'distance-and-duration' | 'reps-and-weight';

export type SetLot = 'normal' | 'warm-up' | 'drop' | 'failure';

export type WorkoutSetPersonalBest = 'weight' | 'one-rm' | 'volume' | 'time' | 'pace' | 'reps';

export interface WorkoutSetStatistic {
	distance: string | null;
	duration: string | null;
	reps: number | null;
	weight: string | null;
}

export interface WorkoutSetRecord {
	lot: SetLot;
	personalBests: WorkoutSetPersonalBest[];
	statistic: WorkoutSetStatistic;
}

export interface WorkoutTotalMeasurement {
	distance: string;
	duration: string;
	/** The number of personal bests achieved. */
	personalBestsAchieved: number;
	reps: number;
	weight: string;
}

export interface ProcessedExercise {
	assets: EntityAssets;
	id: number;
	lot: ExerciseLot;
	name: string;
	notes: string[];
	restTime: number | null;
	sets: WorkoutSetRecord[];
	total: WorkoutTotalMeasurement;
}

export interface WorkoutInformation {
	assets: EntityAssets;
	exercises: ProcessedExercise[];
	/**
	 * Each grouped superset of exercises will be in a vector. They will contain
	 * the `exercise.idx`.
	 */
	supersets: number[][];
}

export interface WorkoutSummaryExercise {
	bestSet: WorkoutSetRecord;
	lot: ExerciseLot;
	name: string;
	numSets: number;
}

export interface WorkoutSummary {
	exercises: WorkoutSummaryExercise[];
	total: WorkoutTotalMeasurement;
}

export interface Workout {
	comment: string | null;
	endTime: string;
	id: string;
	information: WorkoutInformation;
	name: string;
	startTime: string;
	summary: WorkoutSummary;
}

export interface ExportAllResponse {
	/** Data about user's measurements. */
	measurements: UserMeasurement[];
	/** Data about user's media. */
	media: ImportOrExportMediaItem[];
	/** Data about user's people. */
	people: ImportOrExportPersonItem[];
	/** Data about user's workouts. */
	workouts: Workout[];
}
