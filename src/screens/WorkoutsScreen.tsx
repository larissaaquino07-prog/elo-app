import React from "react";
import { StyleSheet, Text } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { GoalProgress } from "../components/GoalProgress";
import { SportSection } from "../components/SportSection";
import { colors } from "../theme/colors";
import { SPORT_ORDER } from "../theme/sports";
import { WEEKLY_GOAL_MIN, workouts } from "../data/mockData";
import { useAppState } from "../context/AppStateContext";

export function WorkoutsScreen() {
  const { expandedSport, setExpandedSport } = useAppState();
  const weekMinutes = workouts.reduce((total, w) => total + w.duration, 0);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Seus treinos</Text>
      <Text style={styles.subtitle}>Toque numa modalidade pra ver detalhes</Text>

      <GoalProgress achieved={weekMinutes} goal={WEEKLY_GOAL_MIN} />

      {SPORT_ORDER.map((key) => (
        <SportSection
          key={key}
          sportKey={key}
          sessions={workouts.filter((w) => w.sport === key)}
          expanded={expandedSport === key}
          onToggle={() => setExpandedSport(expandedSport === key ? null : key)}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
});
