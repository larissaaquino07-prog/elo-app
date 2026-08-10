// Root route placeholder — real screens land per feature, macro-stages 13+.
// See IMPLEMENTATION_PLAN.md §3 for why UI is sequenced after data/AI (5–12).
import { StyleSheet, Text, View } from "react-native";
// Smoke-test import (IMPLEMENTATION_PLAN.md task 3.4) — proves Metro
// resolves the monorepo workspace packages, not real usage yet. Remove
// once an actual screen imports from either package.
import { DOMAIN_PACKAGE_MARKER } from "@coach/domain";
import { DATA_PACKAGE_MARKER } from "@coach/data";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Presentation-layer skeleton — apps/mobile, ARCHITECTURE.md §1/§2.</Text>
      <Text style={styles.marker}>
        {DOMAIN_PACKAGE_MARKER} / {DATA_PACKAGE_MARKER} resolved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  marker: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.6,
  },
});
