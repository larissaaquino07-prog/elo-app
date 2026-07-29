import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import type { WeekDataPoint } from "../types";

interface WeekChartProps {
  data: WeekDataPoint[];
}

const CHART_HEIGHT = 90;

export function WeekChart({ data }: WeekChartProps) {
  const max = Math.max(...data.map((d) => d.min), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Minutos por dia</Text>
      <View style={styles.chart}>
        {data.map((d) => {
          const barHeight = d.min > 0 ? Math.max((d.min / max) * (CHART_HEIGHT - 20), 4) : 3;
          return (
            <View key={d.day} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: d.min > 0 ? colors.orange : colors.track,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{d.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  heading: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  chart: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    height: CHART_HEIGHT - 18,
    width: "62%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dayLabel: {
    fontSize: 10.5,
    color: colors.textGhost,
    marginTop: 6,
  },
});
