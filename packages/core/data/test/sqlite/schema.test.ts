// Schema smoke + constraint tests — IMPLEMENTATION_PLAN.md tasks 4.1/4.2/4.5.
//
// Runs against `better-sqlite3` (a real, native, in-process SQLite engine),
// not `expo-sqlite` — expo-sqlite's native module only exists inside the
// Expo/React Native runtime, unavailable in a plain Node test process. SQL
// semantics are the same engine either way; only the JS binding differs, and
// schema.ts itself (drizzle-orm/sqlite-core) never touches the binding.
//
// Table creation goes through `createTestDb` (dbFactory.ts), which applies
// the real drizzle-kit-generated migration (task 4.4) — not hand-written
// DDL. This file originally used hand-written DDL before 4.4 existed; now
// that it does, this test exercises the exact same migration SQL that ships
// to production, closing that gap rather than leaving two sources of truth.
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../src/sqlite/dbFactory";
import * as schema from "../../src/sqlite/schema";

describe("cached_sessions", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  // 4.1's own smoke test ("open a database, run one query") + 4.2's
  // ("creates, inserts, and fetches a row").
  it("creates, inserts, and fetches a row", async () => {
    await db.insert(schema.cachedSessions).values({
      localId: "session-1",
      startedAt: new Date("2026-08-10T10:00:00Z"),
      mode: "text",
      category: "business",
      syncStatus: "pendingUpload",
    });

    const rows = await db.select().from(schema.cachedSessions);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.localId).toBe("session-1");
    expect(rows[0]?.mode).toBe("text");
  });

  // 4.5: localId uniqueness (primary key).
  it("rejects a duplicate localId", async () => {
    const row = {
      localId: "session-dup",
      startedAt: new Date(),
      mode: "text" as const,
      category: "business" as const,
      syncStatus: "pendingUpload" as const,
    };
    await db.insert(schema.cachedSessions).values(row);
    await expect(db.insert(schema.cachedSessions).values(row)).rejects.toThrow();
  });

  // 4.5: syncStatus enum values — the SQL CHECK constraint, not just the
  // TypeScript type, so an invalid value can't reach the database even via
  // a bypass of the type system (e.g. data crossing a JSON boundary).
  it("rejects a syncStatus value outside the enum at the SQL level", async () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_sessions (local_id, started_at, mode, category, sync_status)
           values ('bad', 0, 'text', 'business', 'not_a_real_status')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });

  it("rejects a mode value outside the enum at the SQL level", async () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_sessions (local_id, started_at, mode, category, sync_status)
           values ('bad', 0, 'not_a_real_mode', 'business', 'synced')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});

describe("cached_vocabulary_items", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates, inserts, and fetches a row", async () => {
    await db.insert(schema.cachedVocabularyItems).values({
      localId: "vocab-1",
      term: "leverage",
      masteryLevel: "introduced",
      syncStatus: "pendingUpload",
    });
    const rows = await db.select().from(schema.cachedVocabularyItems);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.term).toBe("leverage");
  });

  it("rejects a duplicate localId", async () => {
    const row = {
      localId: "vocab-dup",
      term: "synergy",
      masteryLevel: "introduced" as const,
      syncStatus: "pendingUpload" as const,
    };
    await db.insert(schema.cachedVocabularyItems).values(row);
    await expect(
      db.insert(schema.cachedVocabularyItems).values(row),
    ).rejects.toThrow();
  });

  it("rejects a masteryLevel value outside the enum at the SQL level", () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_vocabulary_items (local_id, term, mastery_level, sync_status)
           values ('bad', 'x', 'not_a_real_level', 'pendingUpload')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});

describe("cached_mistakes", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates, inserts, and fetches a row", async () => {
    await db.insert(schema.cachedMistakes).values({
      localId: "mistake-1",
      type: "grammar",
      description: "subject-verb agreement",
      syncStatus: "pendingUpload",
    });
    const rows = await db.select().from(schema.cachedMistakes);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.type).toBe("grammar");
  });

  it("rejects a duplicate localId", async () => {
    const row = {
      localId: "mistake-dup",
      type: "grammar" as const,
      description: "x",
      syncStatus: "pendingUpload" as const,
    };
    await db.insert(schema.cachedMistakes).values(row);
    await expect(db.insert(schema.cachedMistakes).values(row)).rejects.toThrow();
  });

  it("rejects a type value outside the enum at the SQL level", () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_mistakes (local_id, type, description, sync_status)
           values ('bad', 'not_a_real_type', 'x', 'pendingUpload')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});

describe("cached_topics", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates, inserts, and fetches a row", async () => {
    await db.insert(schema.cachedTopics).values({
      localId: "topic-1",
      name: "Salary negotiation",
      category: "business",
      status: "not_started",
      syncStatus: "pendingUpload",
    });
    const rows = await db.select().from(schema.cachedTopics);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("Salary negotiation");
  });

  it("rejects a duplicate localId", async () => {
    const row = {
      localId: "topic-dup",
      name: "x",
      category: "business" as const,
      status: "not_started" as const,
      syncStatus: "pendingUpload" as const,
    };
    await db.insert(schema.cachedTopics).values(row);
    await expect(db.insert(schema.cachedTopics).values(row)).rejects.toThrow();
  });

  it("rejects a status value outside the enum at the SQL level", () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_topics (local_id, name, category, status, sync_status)
           values ('bad', 'x', 'business', 'not_a_real_status', 'pendingUpload')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});

describe("cached_goals", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates, inserts, and fetches a row", async () => {
    await db.insert(schema.cachedGoals).values({
      localId: "goal-1",
      description: "Lead a meeting in English",
      syncStatus: "pendingUpload",
    });
    const rows = await db.select().from(schema.cachedGoals);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.description).toBe("Lead a meeting in English");
  });

  it("rejects a duplicate localId", async () => {
    const row = {
      localId: "goal-dup",
      description: "x",
      syncStatus: "pendingUpload" as const,
    };
    await db.insert(schema.cachedGoals).values(row);
    await expect(db.insert(schema.cachedGoals).values(row)).rejects.toThrow();
  });

  it("rejects a syncStatus value outside the enum at the SQL level", () => {
    const sqlite = (db as unknown as { session: { client: Database.Database } })
      .session.client;
    expect(() =>
      sqlite
        .prepare(
          `insert into cached_goals (local_id, description, sync_status)
           values ('bad', 'x', 'not_a_real_status')`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});

describe("sync_state", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it("creates, inserts, and fetches the singleton row", async () => {
    await db.insert(schema.syncState).values({
      id: 1,
      deviceId: "device-1",
    });
    const rows = await db.select().from(schema.syncState);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.deviceId).toBe("device-1");
  });

  // No enum field on this table; `id` uniqueness is the singleton-row
  // contract itself (ARCHITECTURE.md §9.2's "id: 1, singleton row" note).
  it("rejects a duplicate id (the singleton-row contract)", async () => {
    await db.insert(schema.syncState).values({ id: 1, deviceId: "device-a" });
    await expect(
      db.insert(schema.syncState).values({ id: 1, deviceId: "device-b" }),
    ).rejects.toThrow();
  });
});
