export const colors = {
  bg: "#111417",
  bgDeep: "#0e1013",
  card: "#15181b",
  cardAlt: "#0e1013",
  border: "rgba(255,255,255,0.05)",
  borderStrong: "rgba(255,255,255,0.07)",
  text: "#f0f0f0",
  textBright: "#ffffff",
  textDim: "#c9cdd1",
  textMuted: "#8a8f96",
  textFaint: "#7d8288",
  textGhost: "#6f7479",
  textSubtle: "#63676c",
  track: "#242830",
  orange: "#E0663E",
  orangeDeep: "#C24E2A",
  gold: "#C9A24B",
  goldDeep: "#A8802F",
  green: "#5DCAA5",
  greenBright: "#97C459",
  greenDeep: "#639922",
};

export type SportKey = "corrida" | "musculacao" | "volei" | "natacao";

export const SPORT_COLORS: Record<SportKey, string> = {
  corrida: "#E0663E",
  musculacao: "#4A90A4",
  volei: "#C9A24B",
  natacao: "#5B7FA6",
};

export const SPORT_LABELS: Record<SportKey, string> = {
  corrida: "Corrida",
  musculacao: "Musculação",
  volei: "Vôlei",
  natacao: "Natação",
};
