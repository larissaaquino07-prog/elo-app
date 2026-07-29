import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme/colors";

interface EloScoreCardProps {
  score: number;
  progress?: number;
}

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function EloScoreCard({ score, progress = 0.68 }: EloScoreCardProps) {
  return (
    <LinearGradient
      colors={["#1c1f24", "#101215"]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glow} />
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Seu elo score</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.delta}>+18 nos últimos 7 dias</Text>
        </View>
        <Svg width={56} height={56} viewBox="0 0 56 56">
          <Circle cx={28} cy={28} r={RADIUS} stroke={colors.track} strokeWidth={5} fill="none" />
          <Circle
            cx={28}
            cy={28}
            r={RADIUS}
            stroke={colors.orange}
            strokeWidth={5}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={`${CIRCUMFERENCE * (1 - progress)}`}
            strokeLinecap="round"
            rotation={-90}
            origin="28, 28"
          />
        </Svg>
      </View>
      <Text style={styles.caption}>
        Combina consistência, variedade de modalidades e conexões ativas
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(224,102,62,0.13)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginBottom: 4,
  },
  score: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.5,
  },
  delta: {
    fontSize: 11,
    color: colors.green,
    marginTop: 2,
  },
  caption: {
    fontSize: 10.5,
    color: colors.textSubtle,
    marginTop: 10,
    lineHeight: 15,
  },
});
