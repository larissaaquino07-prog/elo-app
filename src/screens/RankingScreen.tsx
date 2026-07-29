import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Medal, Target, Trophy } from "lucide-react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../theme/colors";
import { leaderboard } from "../data/mockData";
import { useAppState } from "../context/AppStateContext";

export function RankingScreen() {
  const { instagramOptIn } = useAppState();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Recompensas</Text>
      <Text style={styles.subtitle}>Ranking de consistência entre todas as modalidades</Text>

      {leaderboard.map((u, i) => {
        const isTop = i === 0;
        const rowColors: [string, string] = isTop ? ["#2a2115", "#14120c"] : [colors.card, colors.card];
        const canShowInstagram = i < 2 && !!u.instagram;
        return (
          <LinearGradient
            key={u.id}
            colors={rowColors}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={[
              styles.row,
              isTop
                ? styles.rowTop
                : u.isMe
                  ? styles.rowMe
                  : styles.rowDefault,
            ]}
          >
            <View style={styles.rank}>
              {isTop ? <Trophy size={16} color={colors.gold} /> : <Text style={styles.rankText}>#{i + 1}</Text>}
            </View>
            <View style={[styles.avatar, { backgroundColor: `${u.color}33`, borderColor: `${u.color}55` }]}>
              <Text style={styles.avatarText}>{u.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{u.name}</Text>
              <Text style={styles.total}>{u.total} treinos no mês</Text>
              {canShowInstagram && (!u.isMe || instagramOptIn) && (
                <Text style={styles.instagram}>{u.instagram}</Text>
              )}
              {canShowInstagram && u.isMe && !instagramOptIn && (
                <Text style={styles.instagramHidden}>Instagram oculto (ative no perfil)</Text>
              )}
            </View>
            {isTop && <Medal size={16} color={colors.gold} />}
          </LinearGradient>
        );
      })}

      <View style={styles.challenge}>
        <View style={styles.challengeHeader}>
          <Target size={15} color="#4A90A4" />
          <Text style={styles.challengeTitle}>Desafio quinzenal</Text>
        </View>
        <Text style={styles.challengeBody}>
          Pra quem treina com menos frequência: complete 3 treinos nas próximas 2 semanas e
          concorra a destaque no app, mesmo sem estar no topo do ranking.
        </Text>
        <Pressable style={styles.challengeButton}>
          <Text style={styles.challengeButtonText}>Participar do desafio</Text>
        </Pressable>
      </View>
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
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  rowTop: {
    borderColor: "rgba(201,162,75,0.33)",
  },
  rowMe: {
    borderColor: "rgba(224,102,62,0.33)",
  },
  rowDefault: {
    borderColor: colors.border,
  },
  rank: {
    width: 24,
    alignItems: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textGhost,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#fff",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f0f0f0",
  },
  total: {
    fontSize: 10.5,
    color: colors.textFaint,
  },
  instagram: {
    fontSize: 10.5,
    color: colors.gold,
    marginTop: 2,
  },
  instagramHidden: {
    fontSize: 10.5,
    color: colors.textSubtle,
    marginTop: 2,
  },
  challenge: {
    marginTop: 20,
    backgroundColor: "#1a1d21",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f0f0f0",
  },
  challengeBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  challengeButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(74,144,164,0.33)",
    alignItems: "center",
  },
  challengeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A90A4",
  },
});
