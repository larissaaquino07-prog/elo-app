import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 30 }: LogoProps) {
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Defs>
          <LinearGradient id="gCorrida" x1="0" y1="0" x2="18" y2="18">
            <Stop offset="0%" stopColor="#F0946B" />
            <Stop offset="100%" stopColor="#C24E2A" />
          </LinearGradient>
          <LinearGradient id="gMusc" x1="18" y1="0" x2="36" y2="18">
            <Stop offset="0%" stopColor="#7BB8CC" />
            <Stop offset="100%" stopColor="#4A90A4" />
          </LinearGradient>
          <LinearGradient id="gVolei" x1="0" y1="18" x2="18" y2="36">
            <Stop offset="0%" stopColor="#E6C273" />
            <Stop offset="100%" stopColor="#C9A24B" />
          </LinearGradient>
          <LinearGradient id="gNat" x1="18" y1="18" x2="36" y2="36">
            <Stop offset="0%" stopColor="#8CADD1" />
            <Stop offset="100%" stopColor="#5B7FA6" />
          </LinearGradient>
        </Defs>
        <Circle cx="17" cy="17" r="10.5" stroke="url(#gCorrida)" strokeWidth="4.6" />
        <Circle cx="27" cy="17" r="10.5" stroke="url(#gMusc)" strokeWidth="4.6" />
        <Circle cx="17" cy="27" r="10.5" stroke="url(#gVolei)" strokeWidth="4.6" />
        <Circle cx="27" cy="27" r="10.5" stroke="url(#gNat)" strokeWidth="4.6" />
      </Svg>
      <Text style={styles.text}>elo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  text: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
});
