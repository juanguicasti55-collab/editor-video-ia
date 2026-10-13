import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Identidad de la marca personal de Juan (juangonzalez.co): oscuro + dorado, Outfit / Playfair / JetBrains Mono.
export const { fontFamily: TITLE } = loadOutfit("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const BODY = TITLE;
export const { fontFamily: SERIF } = loadPlayfair("italic", { weights: ["500", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

export const C = {
  bg: "#0b0c0f",
  card: "rgba(14,16,21,0.92)",
  cardSolid: "#12151c",
  line: "rgba(255,255,255,0.10)",
  text: "#ffffff",
  muted: "#afb3bc",
  lime: "#e1b85a", // acento principal (dorado)
  violet: "#ff5a4f", // acento secundario (tachados, alertas)
  red: "#ff5a4f",
  blue: "#188bf6",
};

export const MARCA = {
  handle: "@soyjuanggonzalez",
  ctaPalabra: "",
  ctaTexto: "",
};
