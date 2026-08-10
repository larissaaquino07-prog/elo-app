// dbFactory tests — IMPLEMENTATION_PLAN.md task 4.3.
//
// Only createTestDb() is exercised here: createProductionDb() wraps
// expo-sqlite, whose native module (and, on web, its WASM worker — found
// to need a Metro config change this session, not yet made; open question
// whether web needs local SQLite at all given ADR-024's original
// Supabase-direct companion-surface framing, not decided here) only runs
// inside the Expo/React Native runtime, unavailable in a plain Node test
// process. That half of this task's completion criteria ("app launches
// with the production connection") needs a physical device/emulator or a
// resolved web bundle, consistent with this task's own Execution
// Environment split.
import { existsSync, unlinkSync } from "node:fs";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../src/sqlite/dbFactory";
import { cachedGoals } from "../../src/sqlite/schema";

describe("createTestDb", () => {
  it("opens a database and runs a trivial query (task 4.1's own smoke test)", () => {
    const db = createTestDb();
    const result = db.get(sql`select 1 as one`);
    expect(result).toEqual({ one: 1 });
  });

  it("isolates separate in-memory instances from each other", () => {
    const dbA = createTestDb();
    const dbB = createTestDb();
    dbA.run(sql`create table t (x integer)`);
    dbA.run(sql`insert into t values (1)`);

    // dbB never had `t` created — proves it's a genuinely separate
    // database, not a shared/cached connection (ADR-012: never a global
    // singleton).
    expect(() => dbB.all(sql`select * from t`)).toThrow();
  });

  it("a temp-file database is reusable across separate factory calls with the same path", () => {
    const path = `/tmp/coach-app-dbfactory-test-${Date.now()}.db`;
    try {
      const dbA = createTestDb(path);
      dbA.run(
        sql`create table if not exists cached_goals (
          local_id text primary key, remote_id text, description text not null,
          target_date integer, achieved integer not null default 0,
          sync_status text not null
        )`,
      );
      dbA
        .insert(cachedGoals)
        .values({
          localId: "goal-persist",
          description: "survives across factory calls on the same file",
          syncStatus: "pendingUpload",
        })
        .run();

      const dbB = createTestDb(path);
      const rows = dbB.select().from(cachedGoals).all();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.localId).toBe("goal-persist");
    } finally {
      if (existsSync(path)) unlinkSync(path);
    }
  });
});
