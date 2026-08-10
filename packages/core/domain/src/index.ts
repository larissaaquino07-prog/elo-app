// Domain layer entry point — ARCHITECTURE.md §2, ADR-021. Zero runtime
// dependencies: this package's package.json must never gain one — that's
// the actual enforcement mechanism, not just a convention (§3.2 verifies it).
export const DOMAIN_PACKAGE_MARKER = "@coach/domain" as const;
