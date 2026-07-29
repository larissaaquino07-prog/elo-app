import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

interface GoalProgressProps {
  achieved: number;
  goal: number;
}

export function GoalProgress({ achieved, goal }: GoalProgressProps) {
  const pct = Math.min(100, Math.round((achieved / goal) * 100));
  const hit = pct >= 100;

  return (
    <LinearGradient
      colors={hit ? ["#1a2418", "#12160f"] : [colors.card, colors.card]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.card, hit ? styles.cardHit : styles.cardDefault]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.label}>Meta semanal</Text>
        <Text style={[styles.pct, { color: hit ? colors.greenBright : "#f0f0f0" }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={hit ? ["#639922", "#97C459"] : ["#C24E2A", "#E0663E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={styles.caption}>
        {achieved} de {goal} min {hit ? "· meta batida" : `· faltam ${goal - achieved} min`}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  cardDefault: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHit: {
    borderWidth: 1,
    borderColor: "rgba(99,153,34,0.33)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  label: {
    fontSize: 12.5,
    color: colors.textDim,
    fontWeight: "500",
  },
  pct: {
    fontSize: 18,
    fontWeight: "600",
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  caption: {
    fontSize: 10.5,
    color: colors.textFaint,
    marginTop: 8,
  },
});
