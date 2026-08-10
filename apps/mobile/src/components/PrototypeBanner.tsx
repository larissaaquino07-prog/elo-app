import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { spacing, typography } from "@/theme/tokens";

/**
 * Deliberately loud (relative to DESIGN_SYSTEM.md's "premium, not loud"
 * principle — an intentional, temporary exception) so this can never be
 * mistaken for real functionality. Remove this component and everything
 * that renders it before any of this screen counts as real progress against
 * IMPLEMENTATION_PLAN.md — see PROTOTYPE.md.
 */
export function PrototypeBanner() {
  const colors = useThemeColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.warning }]}>
      <Text style={[typography.caption, styles.text]}>
        PROTÓTIPO VISUAL — respostas fixas, sem IA real. Ver PROTOTYPE.md.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
