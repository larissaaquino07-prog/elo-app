import { Activity, Dumbbell, Waves, Zap } from "lucide-react-native";
import type { ComponentType } from "react";
import { SPORT_COLORS, SPORT_LABELS, type SportKey } from "./colors";

export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}>;

export interface SportMeta {
  key: SportKey;
  label: string;
  color: string;
  icon: IconComponent;
}

export const SPORTS: Record<SportKey, SportMeta> = {
  corrida: { key: "corrida", label: SPORT_LABELS.corrida, color: SPORT_COLORS.corrida, icon: Activity },
  musculacao: { key: "musculacao", label: SPORT_LABELS.musculacao, color: SPORT_COLORS.musculacao, icon: Dumbbell },
  volei: { key: "volei", label: SPORT_LABELS.volei, color: SPORT_COLORS.volei, icon: Zap },
  natacao: { key: "natacao", label: SPORT_LABELS.natacao, color: SPORT_COLORS.natacao, icon: Waves },
};

export const SPORT_ORDER: SportKey[] = ["corrida", "musculacao", "volei", "natacao"];
