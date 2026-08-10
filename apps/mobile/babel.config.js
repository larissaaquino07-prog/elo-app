// Babel config — needed for one specific reason: inline-importing Drizzle's
// generated .sql migration files as string literals at bundle time
// (IMPLEMENTATION_PLAN.md task 4.4, packages/core/data/src/sqlite/
// migrations/migrations.js). Metro has no config-free default for this;
// see metro.config.js's matching `resolver.sourceExts` change.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
