import type { FriendActivity, LeaderboardEntry, Person, WeekDataPoint, Workout } from "../types";

export const workouts: Workout[] = [
  {
    id: 1,
    sport: "corrida",
    duration: 42,
    date: "Hoje",
    note: "Ritmo forte",
    coletivo: false,
    detail: { distancia: "6.2 km", pace: "6:45 /km" },
  },
  {
    id: 2,
    sport: "musculacao",
    duration: 65,
    date: "Ontem",
    note: "Peito e tríceps",
    coletivo: false,
    detail: { grupo: "Peito e tríceps", series: "5x8", carga: "62 kg méd." },
  },
  {
    id: 3,
    sport: "volei",
    duration: 90,
    date: "Seg",
    note: "Treino da equipe",
    coletivo: true,
    detail: { tipo: "Treino de equipe", sets: "4 sets", parceiros: "5 pessoas" },
  },
  {
    id: 4,
    sport: "natacao",
    duration: 35,
    date: "Sáb",
    note: "Livre",
    coletivo: false,
    detail: { distancia: "1500 m", estilo: "Livre", pace: "1:52 /100m" },
  },
  {
    id: 5,
    sport: "corrida",
    duration: 38,
    date: "Qui",
    note: "Com a Camila",
    coletivo: true,
    detail: { distancia: "5.4 km", pace: "7:02 /km" },
  },
];

export const weekData: WeekDataPoint[] = [
  { day: "Seg", min: 90 },
  { day: "Ter", min: 0 },
  { day: "Qua", min: 0 },
  { day: "Qui", min: 38 },
  { day: "Sex", min: 0 },
  { day: "Sáb", min: 35 },
  { day: "Dom", min: 42 },
];

export const WEEKLY_GOAL_MIN = 240;

export const friendActivityData: FriendActivity[] = [
  { id: 1, name: "Camila Reis", sport: "natacao", note: "1500 m livre", time: "há 20 min", kudos: 4, kudoed: false },
  {
    id: 2,
    name: "Diego Martins (sua dupla)",
    sport: "volei",
    note: "Treino de equipe",
    time: "há 3 h",
    kudos: 7,
    kudoed: true,
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: 1, name: "Camila Reis", initials: "CR", total: 34, color: "#C9A24B", instagram: "@camilareis.fit" },
  { id: 2, name: "Você", initials: "RS", total: 27, color: "#E0663E", isMe: true, instagram: "@rafa.souza" },
  { id: 3, name: "Diego Martins", initials: "DM", total: 22, color: "#4A90A4" },
  { id: 4, name: "Bruno Aquino", initials: "BA", total: 18, color: "#5B7FA6" },
];

export const people: Person[] = [
  { id: 1, name: "Rafaela Souza", sport: "corrida", level: "Intermediário", distance: "1.2 km", premium: false },
  { id: 2, name: "Diego Martins", sport: "volei", level: "Avançado", distance: "2.8 km", premium: true },
  { id: 3, name: "Camila Reis", sport: "natacao", level: "Iniciante", distance: "0.8 km", premium: false },
  { id: 4, name: "Bruno Aquino", sport: "musculacao", level: "Avançado", distance: "3.5 km", premium: true },
];
