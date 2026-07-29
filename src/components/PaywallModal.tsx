import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Star, X } from "lucide-react-native";
import { colors } from "../theme/colors";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PaywallModal({ visible, onClose, onSubscribe }: PaywallModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <LinearGradient colors={["#1a1d21", "#0f1114"]} style={styles.sheet}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <X size={18} color={colors.textMuted} />
          </Pressable>

          <LinearGradient colors={[colors.gold, colors.goldDeep]} style={styles.icon}>
            <Star size={20} color="#1a1408" />
          </LinearGradient>

          <Text style={styles.title}>Vire premium</Text>
          <Text style={styles.description}>
            Filtros de match por nível e horário, grupos privados, eventos recorrentes e
            estatísticas avançadas.
          </Text>

          <Pressable onPress={onSubscribe}>
            <LinearGradient colors={[colors.gold, colors.goldDeep]} style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Assinar R$ 15/mês</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.dismissButton} onPress={onClose}>
            <Text style={styles.dismissText}>Agora não</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  description: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 18,
    lineHeight: 18,
  },
  subscribeButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  subscribeText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1a1408",
  },
  dismissButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
});
