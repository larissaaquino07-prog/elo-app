import React from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, style }: ScreenContainerProps) {
  if (!scroll) {
    return <View style={[styles.container, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },
});
