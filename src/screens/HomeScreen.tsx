import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Flame, TrendingUp, Users } from "lucide-react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Logo } from "../components/Logo";
import { EloScoreCard } from "../components/EloScoreCard";
import { WeekChart } from "../components/WeekChart";
import { StatCard } from "../components/StatCard";
import { FriendActivityList } from "../components/FriendActivityList";
import { WorkoutRow } from "../components/WorkoutRow";
import { colors } from "../theme/colors";
import { SPORT_ORDER, SPORTS } from "../theme/sports";
import { weekData, workouts } from "../data/mockData";
import { useAppState } from "../context/AppStateContext";
import type { BottomTabParamList } from "../navigation/types";

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { activity, toggleKudos, setExpandedSport } = useAppState();

  const weekMinutes = workouts.reduce((total, w) => total + w.duration, 0);
  const coletivos = workouts.filter((w) => w.coletivo).length;

  return (
    <ScreenContainer>
      <View style={styles.logoWrap}>
        <Logo />
      </View>

      <EloScoreCard score={742} />

      <WeekChart data={weekData} />

      <View style={styles.statsRow}>
        <StatCard icon={Flame} label="Min. na semana" value={weekMinutes} color={colors.orange} />
        <StatCard icon={Users} label="Treinos coletivos" value={coletivos} color={colors.gold} />
        <StatCard icon={TrendingUp} label="Sequência" value="4 dias" color="#4A90A4" />
      </View>

      <FriendActivityList activity={activity} onKudos={toggleKudos} />

      <Text style={styles.heading}>Registrar treino</Text>
      <View style={styles.sportsGrid}>
        {SPORT_ORDER.map((key) => {
          const sport = SPORTS[key];
          const Icon = sport.icon;
          return (
            <Pressable
              key={key}
              style={[styles.sportButton, { backgroundColor: `${sport.color}18`, borderColor: colors.borderStrong }]}
              onPress={() => {
                setExpandedSport(key);
                navigation.navigate("Treinos");
              }}
            >
              <Icon size={16} color={sport.color} />
              <Text style={styles.sportButtonText}>{sport.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.heading}>Treinos recentes</Text>
      {workouts.slice(0, 3).map((w) => (
        <WorkoutRow key={w.id} workout={w} />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  heading: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textDim,
    marginBottom: 10,
  },
  sportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  sportButton: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  sportButtonText: {
    fontSize: 12.5,
    color: "#f0f0f0",
    fontWeight: "500",
  },
});
