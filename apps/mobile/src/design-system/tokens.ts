// Design tokens — DESIGN_SYSTEM.md §2–4. Values transcribed directly from
// the approved source of truth, not invented here.

export const colors = {
  dark: {
    background: "#12141A",
    surface: "#1B1E27",
    surfaceElevated: "#242835",
    border: "#2E3340",
    textPrimary: "#F5F5F3",
    textSecondary: "#A6ACBB",
    textTertiary: "#6D7484",
    accentPrimary: "#5B5FEF",
    accentWarm: "#E8A24C",
    categoryBusiness: "#7C7FF2",
    categoryDaily: "#D97757",
    success: "#4CAF7D",
    warning: "#E1615A",
    info: "#5B9FE8",
  },
  light: {
    background: "#FAFAF8",
    surface: "#FFFFFF",
    surfaceElevated: "#F3F2EF",
    border: "#E4E2DD",
    textPrimary: "#1A1C21",
    textSecondary: "#5C606B",
    textTertiary: "#8B8F99",
    accentPrimary: "#4A4ED9",
    accentWarm: "#E8A24C",
    categoryBusiness: "#5B5FEF",
    categoryDaily: "#C4602F",
    success: "#2E9160",
    warning: "#C94A44",
    info: "#3A7FC9",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorTokens = (typeof colors)[ColorScheme];

// DESIGN_SYSTEM.md §3 — size/weight mapping (pt). React Native's `fontSize`
// takes the same numeric value; the OS applies font-scale on top.
export const typography = {
  display: { fontSize: 34, fontWeight: "600" as const },
  title: { fontSize: 22, fontWeight: "600" as const },
  headline: { fontSize: 17, fontWeight: "600" as const },
  body: { fontSize: 17, fontWeight: "400" as const, lineHeight: 17 * 1.3 },
  callout: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
};

// DESIGN_SYSTEM.md §4 — 4pt base unit.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const radii = {
  button: 12,
};
