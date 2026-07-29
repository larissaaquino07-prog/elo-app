import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Users } from "lucide-react-native";
import { colors } from "../theme/colors";
import { SPORTS } from "../theme/sports";
import type { Workout } from "../types";

interface WorkoutRowProps {
  workout: Workout;
}

export function WorkoutRow({ workout }: WorkoutRowProps) {
  const sport = SPORTS[workout.sport];
  const Icon = sport.icon;
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${sport.color}22`, borderColor: `${sport.color}33` }]}>
        <Icon size={17} color={sport.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{sport.label}</Text>
          {workout.coletivo && <Users size={11} color={colors.textGhost} />}
        </View>
        <Text style={styles.note}>{workout.note}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.duration}>{workout.duration} min</Text>
        <Text style={styles.date}>{workout.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "500",
    color: "#f0f0f0",
  },
  note: {
    fontSize: 11.5,
    color: colors.textFaint,
  },
  right: {
    alignItems: "flex-end",
  },
  duration: {
    fontSize: 12.5,
    color: colors.textDim,
    fontWeight: "500",
  },
  date: {
    fontSize: 10.5,
    color: colors.textSubtle,
  },
});
