// Drizzle schema over expo-sqlite — ARCHITECTURE.md §9.2 (illustrative
// there for cachedSessions/syncState only; expanded here to the full table
// set IMPLEMENTATION_PLAN.md task 4.2 asks for). Each table's comment
// points at its Postgres counterpart in ARCHITECTURE.md §9.1. Local models
// intentionally omit raw transcript text and embeddings, same as the
// original design — full transcripts sync up but are never required to
// sync back down for the cache to be useful.
//
// Every enum-shaped field gets both a Drizzle `enum` (TypeScript-level
// narrowing only) and an explicit SQL `check` constraint (real, runtime
// enforcement) — mirroring the Postgres schema's own `check (... in (...))`
// constraints in §9.1, not just their TypeScript types.
import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Postgres counterpart: `sessions` (§9.1). transcript_storage_path,
// summary_embedding, and updated_at are server-only fields, not cached.
export const cachedSessions = sqliteTable(
  "cached_sessions",
  {
    localId: text("local_id").primaryKey(),
    remoteId: text("remote_id"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    mode: text("mode", { enum: ["text", "voice"] }).notNull(),
    category: text("category", { enum: ["business", "daily"] }).notNull(),
    topic: text("topic"),
    summary: text("summary"), // transcript itself is NOT cached locally, by design
    syncStatus: text("sync_status", {
      enum: ["synced", "pendingUpload", "pendingExtraction"],
    }).notNull(),
  },
  (table) => [
    check("cached_sessions_mode_check", sql`${table.mode} in ('text', 'voice')`),
    check(
      "cached_sessions_category_check",
      sql`${table.category} in ('business', 'daily')`,
    ),
    check(
      "cached_sessions_sync_status_check",
      sql`${table.syncStatus} in ('synced', 'pendingUpload', 'pendingExtraction')`,
    ),
  ],
);

// Postgres counterpart: `vocabulary_items` (§9.1).
export const cachedVocabularyItems = sqliteTable(
  "cached_vocabulary_items",
  {
    localId: text("local_id").primaryKey(),
    remoteId: text("remote_id"),
    term: text("term").notNull(),
    definition: text("definition"),
    firstSeenSessionLocalId: text("first_seen_session_local_id"),
    timesUsed: integer("times_used").notNull().default(0),
    masteryLevel: text("mastery_level", {
      enum: ["introduced", "practicing", "mastered"],
    }).notNull(),
    lastPracticedAt: integer("last_practiced_at", { mode: "timestamp" }),
    syncStatus: text("sync_status", {
      enum: ["synced", "pendingUpload"],
    }).notNull(),
  },
  (table) => [
    check(
      "cached_vocabulary_items_mastery_level_check",
      sql`${table.masteryLevel} in ('introduced', 'practicing', 'mastered')`,
    ),
    check(
      "cached_vocabulary_items_sync_status_check",
      sql`${table.syncStatus} in ('synced', 'pendingUpload')`,
    ),
  ],
);

// Postgres counterpart: `mistakes` (§9.1).
export const cachedMistakes = sqliteTable(
  "cached_mistakes",
  {
    localId: text("local_id").primaryKey(),
    remoteId: text("remote_id"),
    type: text("type", {
      enum: ["grammar", "pronunciation", "vocabulary", "fluency"],
    }).notNull(),
    description: text("description").notNull(),
    example: text("example"),
    correction: text("correction"),
    occurrences: integer("occurrences").notNull().default(1),
    lastSeenSessionLocalId: text("last_seen_session_local_id"),
    resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
    syncStatus: text("sync_status", {
      enum: ["synced", "pendingUpload"],
    }).notNull(),
  },
  (table) => [
    check(
      "cached_mistakes_type_check",
      sql`${table.type} in ('grammar', 'pronunciation', 'vocabulary', 'fluency')`,
    ),
    check(
      "cached_mistakes_sync_status_check",
      sql`${table.syncStatus} in ('synced', 'pendingUpload')`,
    ),
  ],
);

// Postgres counterpart: `topics` (§9.1).
export const cachedTopics = sqliteTable(
  "cached_topics",
  {
    localId: text("local_id").primaryKey(),
    remoteId: text("remote_id"),
    name: text("name").notNull(),
    category: text("category", { enum: ["business", "daily"] }).notNull(),
    status: text("status", {
      enum: ["not_started", "introduced", "practicing", "mastered"],
    }).notNull(),
    lastCoveredSessionLocalId: text("last_covered_session_local_id"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pendingUpload"],
    }).notNull(),
  },
  (table) => [
    check(
      "cached_topics_category_check",
      sql`${table.category} in ('business', 'daily')`,
    ),
    check(
      "cached_topics_status_check",
      sql`${table.status} in ('not_started', 'introduced', 'practicing', 'mastered')`,
    ),
    check(
      "cached_topics_sync_status_check",
      sql`${table.syncStatus} in ('synced', 'pendingUpload')`,
    ),
  ],
);

// Postgres counterpart: `goals` (§9.1).
export const cachedGoals = sqliteTable(
  "cached_goals",
  {
    localId: text("local_id").primaryKey(),
    remoteId: text("remote_id"),
    description: text("description").notNull(),
    targetDate: integer("target_date", { mode: "timestamp" }),
    achieved: integer("achieved", { mode: "boolean" }).notNull().default(false),
    syncStatus: text("sync_status", {
      enum: ["synced", "pendingUpload"],
    }).notNull(),
  },
  (table) => [
    check(
      "cached_goals_sync_status_check",
      sql`${table.syncStatus} in ('synced', 'pendingUpload')`,
    ),
  ],
);

// Postgres counterpart: `device_sync_state` (§9.1) — this table is the
// local, single-device half of that; singleton row (id fixed at 1).
export const syncState = sqliteTable("sync_state", {
  id: integer("id").primaryKey(), // singleton row
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
  deviceId: text("device_id").notNull(),
});
