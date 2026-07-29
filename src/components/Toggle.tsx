import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <Pressable onPress={onChange} style={styles.track} hitSlop={8}>
      {on ? (
        <LinearGradient
          colors={["#E0663E", "#C24E2A"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.off]} />
      )}
      <View style={[styles.knob, on ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 42,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  off: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    position: "absolute",
    top: 3,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  knobOn: {
    left: 21,
  },
  knobOff: {
    left: 3,
  },
});
