import React from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, Plus } from "lucide-react-native";
import { colors } from "../theme/colors";
import { SPORTS } from "../theme/sports";
import type { SportKey, Workout } from "../types";

interface SportSectionProps {
  sportKey: SportKey;
  sessions: Workout[];
  expanded: boolean;
  onToggle: () => void;
}

export function SportSection({ sportKey, sessions, expanded, onToggle }: SportSectionProps) {
  const sport = SPORTS[sportKey];
  const Icon = sport.icon;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={handleToggle} style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${sport.color}22`, borderColor: `${sport.color}33` }]}>
          <Icon size={16} color={sport.color} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{sport.label}</Text>
          <Text style={styles.subtitle}>{sessions.length} sessões registradas</Text>
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <ChevronDown size={16} color={colors.textGhost} />
        </View>
      </Pressable>
      {expanded && (
        <View style={styles.body}>
          {sessions.map((w) => (
            <View key={w.id} style={styles.session}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>{w.date}</Text>
                <Text style={styles.sessionDuration}>{w.duration} min</Text>
              </View>
              <View style={styles.chips}>
                {Object.entries(w.detail).map(([k, v]) => (
                  <View key={k} style={[styles.chip, { backgroundColor: `${sport.color}18` }]}>
                    <Text style={[styles.chipText, { color: sport.color }]}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <Pressable style={[styles.addButton, { borderColor: `${sport.color}55` }]}>
            <Plus size={13} color={sport.color} />
            <Text style={[styles.addButtonText, { color: sport.color }]}>
              Adicionar sessão de {sport.label.toLowerCase()}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "500",
    color: "#f0f0f0",
  },
  subtitle: {
    fontSize: 11,
    color: colors.textFaint,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  session: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sessionDate: {
    fontSize: 11.5,
    color: colors.textDim,
    fontWeight: "500",
  },
  sessionDuration: {
    fontSize: 11,
    color: colors.textFaint,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10.5,
  },
  addButton: {
    width: "100%",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addButtonText: {
    fontSize: 11.5,
    fontWeight: "500",
  },
});
