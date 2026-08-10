// Drizzle Kit config — IMPLEMENTATION_PLAN.md task 4.4. Generates migration
// files from src/sqlite/schema.ts into src/sqlite/migrations/, applied at
// app startup by dbFactory.ts's createProductionDb (and, in tests, by
// applying the same generated migrations against createTestDb — see
// test/sqlite/schema.test.ts).
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/sqlite/schema.ts",
  out: "./src/sqlite/migrations",
});
