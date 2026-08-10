// Data layer entry point — ARCHITECTURE.md §2, ADR-021. May depend on
// @coach/domain plus persistence/network SDKs (expo-sqlite, Supabase) — the
// only package in this monorepo allowed to.
import { DOMAIN_PACKAGE_MARKER } from "@coach/domain";

export const DATA_PACKAGE_MARKER = "@coach/data" as const;
export { DOMAIN_PACKAGE_MARKER };
