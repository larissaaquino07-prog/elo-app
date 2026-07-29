import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "../theme/colors";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <View style={styles.toast} pointerEvents="none">
      <Check size={14} color={colors.green} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 50,
    left: 18,
    right: 18,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1c1f22",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 10,
    zIndex: 30,
  },
  text: {
    fontSize: 12.5,
    color: "#f0f0f0",
  },
});
