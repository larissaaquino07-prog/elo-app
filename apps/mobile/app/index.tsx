// Root route placeholder — real screens land per feature, macro-stages 13+.
// See IMPLEMENTATION_PLAN.md §3 for why UI is sequenced after data/AI (5–12).
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Presentation-layer skeleton — apps/mobile, ARCHITECTURE.md §1/§2.</Text>
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
});
