// Injectable database connection factory — ARCHITECTURE.md §4/§7, ADR-012
// (constructor injection, never a global singleton). Two variants: a
// production factory (on-disk, expo-sqlite) and a test factory (in-memory,
// better-sqlite3 — expo-sqlite's native module doesn't exist outside the
// Expo/React Native runtime, so tests use a different, equally-real SQLite
// engine, same pattern as the schema tests, IMPLEMENTATION_PLAN.md task 4.2).
//
// `createProductionDb`'s expo-sqlite import is dynamic (`await import(...)`),
// not a top-level static import — found empirically that a static import
// makes this whole file fail to load in a plain Node/Vitest process (even
// when only `createTestDb` is used), since expo-sqlite's own module
// resolution assumes the Expo/Metro runtime. The dynamic import defers
// evaluation until `createProductionDb` is actually called, so importing
// this file for `createTestDb` alone (as the test suite does) works.
//
// `createProductionDb` runs pending migrations (task 4.4) before returning
// — a caller never gets a handle to a database that hasn't been brought up
// to the current schema version. The generated `migrations.js` (drizzle-kit,
// `driver: "expo"`, drizzle.config.ts) inlines each `.sql` file as a string
// at bundle time via `babel-plugin-inline-import` + `metro.config.js`'s
// `resolver.sourceExts` — both added this session, not defaults; found via
// a real `Unable to resolve "./0000_xxx.sql"` Metro error, not anticipated
// upfront.
//
// NON_FUNCTIONAL_REQUIREMENTS.md §6 target: "OS-level file protection on
// iOS/Android." Checked, not assumed, against the actual installed
// expo-sqlite version (57.0.1): `SQLiteOpenOptions` exposes no encryption
// or file-protection-level setting at all — no SQLCipher integration,
// nothing equivalent to requesting `NSFileProtectionComplete` on iOS. The
// only thing this factory controls is *not overriding* the default
// database directory (which keeps the file inside the OS-sandboxed,
// default-protected app storage area) — it cannot request a *stronger*
// protection level than whatever the OS default is for that directory.
// This is a real, current limitation of the stack, not a settled "secure by
// default" fact — worth a RISKS.md entry if Julia wants one tracked
// explicitly; not added unilaterally here since it's a judgment call on
// how much this specific gap matters versus the many others already
// flagged this session.
import Database from "better-sqlite3";
import { drizzle as drizzleBetterSqlite3, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate as migrateBetterSqlite3 } from "drizzle-orm/better-sqlite3/migrator";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

type Schema = typeof schema;

/**
 * Production connection — on-disk, via expo-sqlite, in the OS's default
 * (protected, sandboxed) database directory, migrated to the current
 * schema version before being returned. Only callable from within the
 * Expo/React Native runtime (the dynamic imports below fail otherwise, by
 * design — see the file header).
 */
export async function createProductionDb(
  databaseName = "coach.db",
): Promise<ExpoSQLiteDatabase<Schema>> {
  const [{ drizzle }, { useMigrations: _useMigrations, migrate }, SQLite, migrations] =
    await Promise.all([
      import("drizzle-orm/expo-sqlite"),
      import("drizzle-orm/expo-sqlite/migrator"),
      import("expo-sqlite"),
      // @ts-expect-error — generated file, no .d.ts (drizzle-kit's own
      // output for `driver: "expo"`; see drizzle.config.ts).
      import("./migrations/migrations.js"),
    ]);
  const sqlite = SQLite.openDatabaseSync(databaseName);
  const db = drizzle(sqlite, { schema });
  await migrate(db, migrations.default);
  return db;
}

/**
 * Test connection — in-memory by default (isolated per call, since each
 * `new Database(":memory:")` is its own separate database), or a temp file
 * if a path is passed. Runs the same generated migrations as
 * `createProductionDb` (via the better-sqlite3 driver's own migrator,
 * pointed at the same `.sql` files by folder path — the file *contents*
 * are identical to what `createProductionDb` applies, only the loading
 * mechanism differs, since better-sqlite3's migrator reads files directly
 * off disk rather than needing them inlined by Metro).
 */
export function createTestDb(
  filePath = ":memory:",
): BetterSQLite3Database<Schema> {
  const sqlite = new Database(filePath);
  const db = drizzleBetterSqlite3(sqlite, { schema });
  migrateBetterSqlite3(db, { migrationsFolder: new URL("./migrations", import.meta.url).pathname });
  return db;
}
