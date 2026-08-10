import { useColorScheme } from "react-native";
import { colors, type ColorTokens } from "./tokens";

/**
 * DESIGN_SYSTEM.md §12 — resolved automatically via the OS-level appearance
 * setting, never a manual in-app toggle.
 */
export function useThemeColors(): ColorTokens {
  const scheme = useColorScheme();
  return colors[scheme === "light" ? "light" : "dark"];
}
