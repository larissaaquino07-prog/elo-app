// Metro config — two reasons this exists, both found necessary this
// session, not assumed upfront:
//
// 1. `.sql` as a source extension, paired with babel.config.js's
//    inline-import plugin, so Drizzle's generated migration files
//    (packages/core/data/src/sqlite/migrations/migrations.js) can
//    `import ... from './0000_xxx.sql'` — IMPLEMENTATION_PLAN.md task 4.4.
// 2. Watching packages/core/* explicitly. Metro's default config already
//    resolved the @coach/domain/@coach/data workspace packages correctly
//    with zero configuration (task 3.4 found this worked out of the box)
//    — this addition is specifically for .sql file watching across the
//    monorepo boundary, not a resolution fix.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.resolver.sourceExts.push("sql");
config.watchFolders = [workspaceRoot];

module.exports = config;
