import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";

export const { fontFamily: TITLE } = loadArchivo("normal", { weights: ["800", "900"], subsets: ["latin"] });
export const { fontFamily: BODY } = loadInstrument("normal", { weights: ["600"], subsets: ["latin"] });

export const C = {
  bg: "#0B0A10",
  card: "rgba(21,19,28,0.92)",
  cardSolid: "#15131C",
  line: "rgba(255,255,255,0.09)",
  text: "#F4F2F8",
  muted: "#9C97AB",
  lime: "#D7F25A",
  violet: "#A77BFF",
  red: "#FF6B6B",
};

// ---------- marca (lo completa la skill en la entrevista inicial) ----------
// lime = color de acento principal · violet = acento secundario (los nombres quedan por compatibilidad).
export const MARCA = {
  handle: "@TU_USUARIO", // aparece abajo a la derecha en los videos horizontales
  ctaPalabra: "VIDEO", // reels: "Comenta VIDEO…"
  ctaTexto: "y te envío el video completo",
};
