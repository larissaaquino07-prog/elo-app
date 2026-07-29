import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { colors } from "../theme/colors";
import { SPORTS } from "../theme/sports";
import { initials } from "../utils/initials";
import type { FriendActivity } from "../types";

interface FriendActivityListProps {
  activity: FriendActivity[];
  onKudos: (id: number) => void;
}

export function FriendActivityList({ activity, onKudos }: FriendActivityListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Atividade dos seus contatos</Text>
      {activity.map((a) => {
        const sport = SPORTS[a.sport];
        const Icon = sport.icon;
        return (
          <View key={a.id} style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${sport.color}33`, borderColor: `${sport.color}55` },
              ]}
            >
              <Text style={styles.avatarText}>{initials(a.name)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {a.name}
              </Text>
              <View style={styles.noteRow}>
                <Icon size={11} color={sport.color} />
                <Text style={styles.note}>
                  {" "}
                  {a.note} · {a.time}
                </Text>
              </View>
            </View>
            <Pressable style={styles.kudos} onPress={() => onKudos(a.id)} hitSlop={8}>
              <Flame size={16} color={a.kudoed ? colors.orange : colors.textGhost} fill={a.kudoed ? colors.orange : "none"} />
              <Text style={[styles.kudosCount, { color: a.kudoed ? colors.orange : colors.textGhost }]}>
                {a.kudos}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textDim,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 12.5,
    color: "#f0f0f0",
    fontWeight: "500",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  note: {
    fontSize: 11,
    color: colors.textFaint,
  },
  kudos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kudosCount: {
    fontSize: 11.5,
  },
});
