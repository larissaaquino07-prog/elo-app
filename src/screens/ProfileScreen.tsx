import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Star } from "lucide-react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Toggle } from "../components/Toggle";
import { colors } from "../theme/colors";
import { SPORT_ORDER, SPORTS } from "../theme/sports";
import { useAppState } from "../context/AppStateContext";

export function ProfileScreen() {
  const { premium, setShowPaywall, locationOptIn, setLocationOptIn, instagramOptIn, setInstagramOptIn } =
    useAppState();

  return (
    <ScreenContainer>
      <View style={styles.profileHeader}>
        <LinearGradient colors={["rgba(224,102,62,0.53)", "rgba(194,78,42,0.27)"]} style={styles.avatar}>
          <Text style={styles.avatarText}>RS</Text>
        </LinearGradient>
        <View>
          <Text style={styles.name}>Rafaela Souza</Text>
          <Text style={styles.location}>São José do Rio Preto, SP · #2 no ranking</Text>
        </View>
      </View>

      <LinearGradient
        colors={premium ? ["#2a2115", "#14120c"] : ["#1a1d21", "#131518"]}
        style={[styles.planCard, { borderColor: premium ? "rgba(201,162,75,0.33)" : colors.borderStrong }]}
      >
        <View style={styles.planHeader}>
          <Star size={14} color={premium ? colors.gold : colors.textMuted} />
          <Text style={[styles.planTitle, { color: premium ? "#E0C285" : colors.textDim }]}>
            {premium ? "Plano premium ativo" : "Plano gratuito"}
          </Text>
        </View>
        <Text style={styles.planBody}>
          {premium
            ? "Filtros de match, grupos privados e estatísticas avançadas liberados."
            : "Desbloqueie filtros de match, grupos privados e estatísticas avançadas."}
        </Text>
        {!premium && (
          <Pressable onPress={() => setShowPaywall(true)}>
            <LinearGradient colors={[colors.gold, colors.goldDeep]} style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Assinar por R$ 15/mês</Text>
            </LinearGradient>
          </Pressable>
        )}
      </LinearGradient>

      <Text style={styles.heading}>Privacidade</Text>
      <View style={styles.privacyCard}>
        <View style={[styles.privacyRow, styles.privacyRowBorder]}>
          <MapPin size={16} color={colors.textGhost} />
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>Compartilhar localização</Text>
            <Text style={styles.privacySubtitle}>Necessário pra aparecer em Treinar junto</Text>
          </View>
          <Toggle on={locationOptIn} onChange={() => setLocationOptIn(!locationOptIn)} />
        </View>
        <View style={styles.privacyRow}>
          <Star size={16} color={colors.textGhost} />
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyTitle}>Mostrar Instagram se eu vencer</Text>
            <Text style={styles.privacySubtitle}>Exibido no ranking só em 1º ou 2º lugar</Text>
          </View>
          <Toggle on={instagramOptIn} onChange={() => setInstagramOptIn(!instagramOptIn)} />
        </View>
      </View>

      <Text style={styles.heading}>Suas modalidades</Text>
      <View style={styles.sportsRow}>
        {SPORT_ORDER.map((key) => {
          const sport = SPORTS[key];
          const Icon = sport.icon;
          return (
            <View
              key={key}
              style={[styles.sportPill, { backgroundColor: `${sport.color}1e`, borderColor: `${sport.color}33` }]}
            >
              <Icon size={12} color={sport.color} />
              <Text style={styles.sportPillText}>{sport.label}</Text>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  location: {
    fontSize: 12,
    color: colors.textMuted,
  },
  planCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  planTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  planBody: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  upgradeButton: {
    width: "100%",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeButtonText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#1a1408",
  },
  heading: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textDim,
    marginBottom: 10,
  },
  privacyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  privacyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 12.5,
    color: "#f0f0f0",
    fontWeight: "500",
  },
  privacySubtitle: {
    fontSize: 10.5,
    color: colors.textFaint,
  },
  sportsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sportPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  sportPillText: {
    fontSize: 11.5,
    color: "#e5e5e5",
  },
});
