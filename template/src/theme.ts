import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const { fontFamily: TITLE } = loadArchivo("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
export const { fontFamily: BODY } = loadInstrument("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
// Las piden los efectos: SERIF = portadas y capítulos · TYPE = notas de papel · HAND = subtítulos en manuscrita
export const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["800", "900"], subsets: ["latin"] });
export const { fontFamily: TYPE } = loadCourier("normal", { weights: ["700"], subsets: ["latin"] });
export const { fontFamily: HAND } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

// ---------- colores y marca: SIEMPRE se reemplazan con los de la persona (entrevista, pregunta 4) ----------
// La skill no trae una paleta propia: estos valores neutros solo sirven para que el proyecto compile.
// lime = acento principal · violet = acento secundario (los nombres quedan por compatibilidad con los efectos).
export const C = {
  bg: "#111111",
  card: "rgba(17,17,17,0.92)",
  cardSolid: "#111111",
  line: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  lime: "#FFFFFF",
  violet: "#FFFFFF",
  red: "#FF5A5A",
};

export const MARCA = {
  handle: "@TU_USUARIO", // marca de agua (Brand) si la persona la quiere
  ctaPalabra: "VIDEO", // reels orgánicos: "Comenta VIDEO…"
  ctaTexto: "y te envío el video completo",
};
