import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Clock, Flame, Trophy, User, Users } from "lucide-react-native";
import { colors } from "../theme/colors";
import type { IconComponent } from "../theme/sports";

const TAB_ICONS: Record<string, IconComponent> = {
  Início: Flame,
  Treinos: Clock,
  Ranking: Trophy,
  Conectar: Users,
  Perfil: User,
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] ?? Flame;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? colors.orange : colors.textGhost;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <Icon size={19} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
              <Text style={[styles.label, { color, fontWeight: isFocused ? "600" : "400" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    overflow: "hidden",
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(17,20,23,0.75)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  tab: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 9.5,
  },
});
