// Estilo «Lanzamiento» (Juan, 9-nov-2026: «quiero que quede una en este estilo, fuentes y ubicaciones»). Copia las letras y
// los lugares de una captura de referencia: título en dos letras detrás de la cabeza, una palabra suelta al lado de la cara a
// la altura del mentón y una nota a mano sobre el pecho. Se tomó el lenguaje visual, nunca el video ni sus textos.
// Copiar a remotion/src/lanzamiento.tsx junto con principales.tsx. Necesita FACES (scripts/caras.py) y TOPS (mascaras.py).
// El título va en el `behind` de Cam2; la palabra y la nota, encima.
import React from "react";
import { loadFont as cargaSans } from "@remotion/google-fonts/InterTight";
import { loadFont as cargaSerif } from "@remotion/google-fonts/InstrumentSerif";
import { TituloDetras, PalabraSuelta, NotaMano } from "./principales";

export const L_SANS = cargaSans("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;   // sans gruesa apretada
export const L_SERIF = cargaSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily; // serif cursiva angosta
export const L_ACENTO = "#F3E49A"; // amarillo pálido de la referencia; se cambia por el de la marca si la persona quiere

type Cara = { at: number; top: number; bottom: number; cx: number };
const caraEn = (caras: Cara[], t: number) => [...caras].reverse().find((f) => t >= f.at) ?? caras[0];

// Medidas de la referencia en un video de 1080×1920 (ver ESTILO.md):
// · línea 1 (sans) ocupa ~725 px de ancho, centrada · línea 2 (cursiva) ~545 px, montada sobre la 1
// · la base de la cursiva queda ~45 px por debajo de la coronilla: la cabeza tapa la parte baja de las letras del centro
// · ancho por letra medido en render: Inter Tight 700 con tracking −0,06 ≈ 0,40 em · Instrument Serif cursiva ≈ 0,32 em
export const LanzTitulo: React.FC<{ from: number; to: number; coronilla: number; linea1: string; linea2: string; at1?: number; at2?: number; color?: string }> = ({
  from, to, coronilla, linea1, linea2, at1 = from, at2 = from + 0.35, color = L_ACENTO,
}) => {
  const fs1 = Math.min(190, Math.round(725 / (linea1.length * 0.4)));
  const fs2 = Math.min(210, Math.round(545 / (linea2.length * 0.32)));
  const alto = fs1 * 0.95 + fs2 * 0.9 - fs2 * 0.12;
  return (
    <TituloDetras from={from} to={to} top={Math.max(215, coronilla + 45 - alto)} fuenteSans={L_SANS} pesoSans={700} fuenteCursiva={L_SERIF} tracking={-0.06}
      lineas={[{ at: at1, t: linea1, size: fs1 }, { at: at2, t: linea2, cursiva: true, size: fs2, color }]} />
  );
};

/** Palabra suelta: sans gruesa blanca de ~58 px, a la altura del mentón, al lado libre de la cara (≈ 300 px del centro). */
export const LanzPalabra: React.FC<{ caras: Cara[]; claves?: string[]; ocultar?: [number, number][]; color?: string; colorClave?: string }> = ({
  caras, claves = [], ocultar = [], color = "#fff", colorClave = L_ACENTO,
}) => <PalabraSuelta caras={caras} claves={claves} ocultar={ocultar} size={58} separacion={300} altura={0.97} fuente={L_SANS} peso={700} color={color} colorClave={colorClave} />;

/** Nota a mano (letra A) sobre el pecho: 2 líneas, inclinada −3°, empieza un poco a la izquierda del centro. */
export const LanzNota: React.FC<{ from: number; to: number; lineas: string[]; caras: Cara[]; color?: string }> = ({ from, to, lineas, caras, color = "#fff" }) => {
  const c = caraEn(caras, from);
  return <NotaMano from={from} to={to} lineas={lineas} mano="a" size={40} espacio={0.09} rot={-3} color={color} top={Math.max(1170, c.bottom + 90)} left={296} right={150} />;
};
