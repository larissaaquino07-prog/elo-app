import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { spacing, typography } from "@/theme/tokens";

export function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.callout,
          styles.description,
          { color: colors.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  description: {
    marginTop: spacing.md,
    textAlign: "center",
  },
});
