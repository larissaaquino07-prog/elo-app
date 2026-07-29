import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { PersonCard } from "../components/PersonCard";
import { colors } from "../theme/colors";
import { people } from "../data/mockData";
import { useAppState } from "../context/AppStateContext";
import type { Person } from "../types";

export function ConnectScreen() {
  const { premium, locationOptIn, setLocationOptIn, showToast, setShowPaywall } = useAppState();

  const handleConnect = (person: Person, locked: boolean) => {
    if (locked) {
      setShowPaywall(true);
      return;
    }
    showToast(`Convite enviado para ${person.name.split(" ")[0]}`);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Treinar junto</Text>
        <Text style={styles.subtitle}>Pessoas perto de você buscando parceiro de treino</Text>
      </View>

      {!locationOptIn ? (
        <View style={styles.emptyState}>
          <MapPin size={22} color={colors.textGhost} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Localização desativada</Text>
          <Text style={styles.emptyBody}>
            Pra ver e ser visto por pessoas próximas, ative o compartilhamento de localização no
            seu perfil.
          </Text>
          <Pressable onPress={() => setLocationOptIn(true)}>
            <LinearGradient colors={[colors.orange, colors.orangeDeep]} style={styles.enableButton}>
              <Text style={styles.enableButtonText}>Ativar localização</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        people.map((p) => (
          <PersonCard key={p.id} person={p} isPremiumUser={premium} onConnect={handleConnect} />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 18,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 13,
    color: colors.textDim,
    fontWeight: "500",
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: 11.5,
    color: colors.textFaint,
    lineHeight: 17,
    marginBottom: 14,
    textAlign: "center",
  },
  enableButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 11,
  },
  enableButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});
