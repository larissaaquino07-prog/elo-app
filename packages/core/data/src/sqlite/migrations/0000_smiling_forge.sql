CREATE TABLE `cached_goals` (
	`local_id` text PRIMARY KEY NOT NULL,
	`remote_id` text,
	`description` text NOT NULL,
	`target_date` integer,
	`achieved` integer DEFAULT false NOT NULL,
	`sync_status` text NOT NULL,
	CONSTRAINT "cached_goals_sync_status_check" CHECK("cached_goals"."sync_status" in ('synced', 'pendingUpload'))
);
--> statement-breakpoint
CREATE TABLE `cached_mistakes` (
	`local_id` text PRIMARY KEY NOT NULL,
	`remote_id` text,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`example` text,
	`correction` text,
	`occurrences` integer DEFAULT 1 NOT NULL,
	`last_seen_session_local_id` text,
	`resolved` integer DEFAULT false NOT NULL,
	`sync_status` text NOT NULL,
	CONSTRAINT "cached_mistakes_type_check" CHECK("cached_mistakes"."type" in ('grammar', 'pronunciation', 'vocabulary', 'fluency')),
	CONSTRAINT "cached_mistakes_sync_status_check" CHECK("cached_mistakes"."sync_status" in ('synced', 'pendingUpload'))
);
--> statement-breakpoint
CREATE TABLE `cached_sessions` (
	`local_id` text PRIMARY KEY NOT NULL,
	`remote_id` text,
	`started_at` integer NOT NULL,
	`mode` text NOT NULL,
	`category` text NOT NULL,
	`topic` text,
	`summary` text,
	`sync_status` text NOT NULL,
	CONSTRAINT "cached_sessions_mode_check" CHECK("cached_sessions"."mode" in ('text', 'voice')),
	CONSTRAINT "cached_sessions_category_check" CHECK("cached_sessions"."category" in ('business', 'daily')),
	CONSTRAINT "cached_sessions_sync_status_check" CHECK("cached_sessions"."sync_status" in ('synced', 'pendingUpload', 'pendingExtraction'))
);
--> statement-breakpoint
CREATE TABLE `cached_topics` (
	`local_id` text PRIMARY KEY NOT NULL,
	`remote_id` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`last_covered_session_local_id` text,
	`sync_status` text NOT NULL,
	CONSTRAINT "cached_topics_category_check" CHECK("cached_topics"."category" in ('business', 'daily')),
	CONSTRAINT "cached_topics_status_check" CHECK("cached_topics"."status" in ('not_started', 'introduced', 'practicing', 'mastered')),
	CONSTRAINT "cached_topics_sync_status_check" CHECK("cached_topics"."sync_status" in ('synced', 'pendingUpload'))
);
--> statement-breakpoint
CREATE TABLE `cached_vocabulary_items` (
	`local_id` text PRIMARY KEY NOT NULL,
	`remote_id` text,
	`term` text NOT NULL,
	`definition` text,
	`first_seen_session_local_id` text,
	`times_used` integer DEFAULT 0 NOT NULL,
	`mastery_level` text NOT NULL,
	`last_practiced_at` integer,
	`sync_status` text NOT NULL,
	CONSTRAINT "cached_vocabulary_items_mastery_level_check" CHECK("cached_vocabulary_items"."mastery_level" in ('introduced', 'practicing', 'mastered')),
	CONSTRAINT "cached_vocabulary_items_sync_status_check" CHECK("cached_vocabulary_items"."sync_status" in ('synced', 'pendingUpload'))
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_synced_at` integer,
	`device_id` text NOT NULL
);
