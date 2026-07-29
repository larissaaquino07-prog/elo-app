import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import type { IconComponent } from "../theme/sports";

interface StatCardProps {
  icon: IconComponent;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <LinearGradient
      colors={["#1a1d21", "#14171a"]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Icon size={14} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  label: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
});
