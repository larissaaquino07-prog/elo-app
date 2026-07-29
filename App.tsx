import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { AppStateProvider, useAppState } from "./src/context/AppStateContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { Toast } from "./src/components/Toast";
import { PaywallModal } from "./src/components/PaywallModal";
import { colors } from "./src/theme/colors";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: colors.border,
    primary: colors.orange,
  },
};

function Overlays() {
  const { toast, showPaywall, setShowPaywall, setPremium } = useAppState();
  return (
    <>
      {toast && <Toast message={toast} />}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => {
          setPremium(true);
          setShowPaywall(false);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="light" />
            <RootNavigator />
            <Overlays />
          </NavigationContainer>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
