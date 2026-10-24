// Tema de los videos de MOTION GRAPHICS (sin cámara). Lo completa la skill en la entrevista:
// colores de la marca (C) y textos del cierre (MARCA). Las fuentes son LOCALES (public/fonts, src/fuentes.ts),
// las baja scripts/fuentes.py: el Chrome del render a veces no puede bajar de Google Fonts (proxy/certificados).
import { continueRender, delayRender, staticFile } from "remotion";
import { FONTS } from "./fuentes";

if (typeof document !== "undefined") {
  const h = delayRender("fuentes locales");
  Promise.all(
    FONTS.map(([fam, style, weight, file, range]) =>
      new FontFace(fam, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { style, weight, unicodeRange: range })
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  ).then(() => continueRender(h), () => continueRender(h));
}

// Familias por defecto (las de scripts/fuentes.py sin argumentos). Si cambias de fuente, cambia también estos nombres.
export const SERIF = "Cormorant Garamond"; // títulos editoriales
export const SERIF_I = "Cormorant Garamond"; // la misma en cursiva (fontStyle italic)
export const TITLE = "Jost"; // cifras, palabras grandes, subtítulos
export const BODY = TITLE;
export const MONO = "JetBrains Mono"; // rótulos técnicos en mayúsculas

// Paleta: fondo oscuro + un acento principal (lime) + un acento de alerta/CTA (violet). Los nombres lime/violet
// quedan por compatibilidad con lib.tsx; pon aquí los colores de la marca.
export const C = {
  bg: "#060A17",
  bg2: "#0F1A36", // centro del degradado del fondo
  grid: "rgba(150,220,215,0.16)",
  gridSoft: "rgba(150,220,215,0.06)",
  bracket: "rgba(150,220,215,.45)",
  card: "rgba(14,22,44,0.86)",
  cardSolid: "#0E162C",
  line: "rgba(150,220,215,0.16)",
  text: "#F2F6F7",
  muted: "#8C97AD",
  dim: "#C9D2DC",
  lime: "#4FC3C0", // acento principal
  violet: "#F7931E", // acento secundario: tachados, alertas, botón del CTA
  onViolet: "#1A0E00", // texto sobre el botón
  mint: "#A8E0D6",
  paper: "#EEF7F6", // fondo de las tarjetas con ilustraciones claras
  red: "#F7931E",
};

export const MARCA = {
  handle: "@TU_USUARIO",
  ctaPalabra: "PALABRA",
  ctaTexto: "y te envío …",
};
