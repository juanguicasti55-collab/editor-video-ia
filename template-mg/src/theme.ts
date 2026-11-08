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

// LETRAS: se preguntan en cada video. Estas son las de scripts/fuentes.py sin argumentos; con las de la marca, baja
// las suyas con fuentes.py y cambia también estos nombres.
export const SERIF = "Cormorant Garamond"; // títulos editoriales
export const SERIF_I = "Cormorant Garamond"; // la misma en cursiva (fontStyle italic)
export const TITLE = "Jost"; // cifras, palabras grandes, subtítulos
export const BODY = TITLE;
export const MONO = "JetBrains Mono"; // rótulos técnicos en mayúsculas

// COLORES: se preguntan en cada video (entrevista) y se reemplazan aquí con los de la marca. Estos valores neutros
// solo sirven para que el proyecto compile; nunca se reusa la paleta de otro video ni la del catálogo.
// lime = acento principal · violet = acento secundario (tachados, alertas, botón del CTA). Los nombres quedan por compatibilidad.
export const C = {
  bg: "#0A0A0A",
  bg2: "#1A1A1A", // centro del degradado del fondo
  grid: "rgba(255,255,255,0.10)",
  gridSoft: "rgba(255,255,255,0.04)",
  bracket: "rgba(255,255,255,.35)",
  card: "rgba(20,20,20,0.88)",
  cardSolid: "#141414",
  line: "rgba(255,255,255,0.12)",
  text: "#F5F5F5",
  muted: "#9A9A9A",
  dim: "#CFCFCF",
  lime: "#FFFFFF", // acento principal → el de la marca
  violet: "#FFFFFF", // acento secundario → el de la marca
  onViolet: "#111111", // texto sobre el botón
  mint: "#DDDDDD",
  paper: "#F4F4F4", // fondo de las tarjetas con ilustraciones claras
  red: "#FF5A5A",
};

export const MARCA = {
  handle: "@TU_USUARIO",
  ctaPalabra: "PALABRA",
  ctaTexto: "y te envío …",
};
