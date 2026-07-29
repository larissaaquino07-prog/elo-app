import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CustomTabBar } from "./CustomTabBar";
import { HomeScreen } from "../screens/HomeScreen";
import { WorkoutsScreen } from "../screens/WorkoutsScreen";
import { RankingScreen } from "../screens/RankingScreen";
import { ConnectScreen } from "../screens/ConnectScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import type { BottomTabParamList } from "./types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Treinos" component={WorkoutsScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Conectar" component={ConnectScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
