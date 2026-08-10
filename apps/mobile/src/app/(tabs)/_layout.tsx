import { Tabs } from "expo-router";
import { useThemeColors } from "@/theme/useThemeColors";

// DESIGN_SYSTEM.md §5.4 — four tabs, matching the app's actual pillars, not
// padded for symmetry. Plain text labels here (no @expo/vector-icons in this
// prototype — see PROTOTYPE.md) stand in for the real icon set later.
export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Coach", tabBarLabel: "Coach" }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarLabel: "Progress" }}
      />
      <Tabs.Screen
        name="memory"
        options={{ title: "Memory", tabBarLabel: "Memory" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarLabel: "Profile" }}
      />
    </Tabs>
  );
}
