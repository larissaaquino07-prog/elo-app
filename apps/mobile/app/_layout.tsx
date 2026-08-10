// Expo Router root layout — ARCHITECTURE.md §1/§2, ADR-022.
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
