import type { SportKey } from "./theme/colors";

export type { SportKey };

export interface Workout {
  id: number;
  sport: SportKey;
  duration: number;
  date: string;
  note: string;
  coletivo: boolean;
  detail: Record<string, string>;
}

export interface WeekDataPoint {
  day: string;
  min: number;
}

export interface FriendActivity {
  id: number;
  name: string;
  sport: SportKey;
  note: string;
  time: string;
  kudos: number;
  kudoed: boolean;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  initials: string;
  total: number;
  color: string;
  isMe?: boolean;
  instagram?: string;
}

export interface Person {
  id: number;
  name: string;
  sport: SportKey;
  level: "Iniciante" | "Intermediário" | "Avançado";
  distance: string;
  premium: boolean;
}
