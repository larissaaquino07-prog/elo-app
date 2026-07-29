import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock, MapPin, Users } from "lucide-react-native";
import { colors } from "../theme/colors";
import { SPORTS } from "../theme/sports";
import { initials } from "../utils/initials";
import type { Person } from "../types";

interface PersonCardProps {
  person: Person;
  isPremiumUser: boolean;
  onConnect: (person: Person, locked: boolean) => void;
}

export function PersonCard({ person, isPremiumUser, onConnect }: PersonCardProps) {
  const sport = SPORTS[person.sport];
  const Icon = sport.icon;
  const locked = person.premium && !isPremiumUser;

  return (
    <LinearGradient
      colors={["#191c20", "#131518"]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: `${sport.color}33`, borderColor: `${sport.color}55` }]}>
          <Text style={styles.avatarText}>{initials(person.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{person.name}</Text>
          <View style={styles.metaRow}>
            <Icon size={12} color={sport.color} />
            <Text style={styles.meta}>
              {" "}
              {sport.label} · {person.level}
            </Text>
          </View>
        </View>
        <View style={styles.distanceRow}>
          <MapPin size={11} color={colors.textGhost} />
          <Text style={styles.distance}>{person.distance}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => onConnect(person, locked)}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
      >
        {locked ? (
          <View style={[styles.buttonContent, styles.buttonLocked]}>
            <Lock size={12} color={colors.textMuted} />
            <Text style={styles.buttonTextLocked}>Filtro avançado (Premium)</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[colors.orange, colors.orangeDeep]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.buttonContent}
          >
            <Users size={12} color="#fff" />
            <Text style={styles.buttonText}>Convidar para treinar</Text>
          </LinearGradient>
        )}
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f2f2f2",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  meta: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distance: {
    fontSize: 11,
    color: colors.textGhost,
  },
  button: {
    marginTop: 12,
    borderRadius: 11,
    overflow: "hidden",
  },
  buttonLocked: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
  },
  buttonText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#fff",
  },
  buttonTextLocked: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
