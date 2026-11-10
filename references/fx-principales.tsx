// P · Textos principales (regla de Juan, 9-nov-2026: «tengas estos textos como principales»). Son los textos de base de
// todo video, salvo que la persona pida otros. Idea tomada de 3 reels de referencia (título en dos letras, nota a mano,
// subtítulo suelto de una palabra, serif con destellos, tarjetas de perfil); se tomó la idea, nunca su código ni sus textos.
// Copiar a remotion/src/principales.tsx. Necesita de theme.ts: C, TITLE, FINA; las 4 letras a mano (MANO a–d) se cargan aquí (las demás letras y colores salen de la marca
// de cada video: C.lime = acento, C.violet = segundo color). 🔴 El acento NO es amarillo fijo: es el color de la marca o el que
// la persona pida para ese video; toda pieza acepta `color` para cambiarlo en un texto puntual.
//
// 🔴 Regla de tamaño (Juan, 9-nov-2026: «los que son grandes que queden por detrás siempre»):
// · GRANDE (P1 TituloDetras, P6 TarjetasPerfil) → SIEMPRE en el `behind` de Cam2, con recorte (scripts/mascaras.py). La
//   cabeza tapa una parte. Nunca se ponen delante de la persona.
// · MEDIANO y CHICO (P2, P3, P4, P5) → delante, pero nunca entre los ojos y el mentón: al costado de la cabeza o bajo el mentón
//   (`scripts/caras.py` da el mentón por toma).
// Datos: P6 muestra cuentas y cifras: SOLO reales y con fuente (nunca seguidores inventados ni de muestra en una pieza publicada).
import React from "react";
import { C, TITLE, FINA } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";
import { loadFont as cargaA } from "@remotion/google-fonts/ComingSoon";
import { loadFont as cargaB } from "@remotion/google-fonts/GochiHand";
import { loadFont as cargaC } from "@remotion/google-fonts/ShadowsIntoLightTwo";
import { loadFont as cargaD } from "@remotion/google-fonts/Gaegu";

// Letras a mano de marcador (Juan, 9-nov-2026: «son como refuerzos»). A es la más delgada y va por defecto; B, C y D se
// eligen con `mano="b"`… para variar dentro del mismo video. Solo latin y un peso, para no hacer cientos de descargas.
const sub = { subsets: ["latin"] } as const;
export const MANO = {
  a: cargaA("normal", { weights: ["400"], ...sub }).fontFamily,  // Coming Soon: delgada, letras separadas
  b: cargaB("normal", { weights: ["400"], ...sub }).fontFamily,  // Gochi Hand: más gruesa, de plumón
  c: cargaC("normal", { weights: ["400"], ...sub }).fontFamily,  // Shadows Into Light Two: fina y alta
  d: cargaD("normal", { weights: ["700"], ...sub }).fontFamily,  // Gaegu: redonda, muy separada
};
export type Mano = keyof typeof MANO;

const SOMBRA = "0 4px 18px rgba(0,0,0,.45)";
const limpia = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,;:¿?¡!«»"“”…]/g, "");
const sinPunto = (w: string) => w.replace(/[¿¡]/g, "").replace(/[,;:.?!…]+$/, "");
const fuera = (t: number, r: [number, number][]) => r.some(([a, b]) => t >= a && t <= b);
const sale = (t: number, to: number, d = 0.25) => 1 - prog(t, to - d, d);
type W = (typeof WORDS)[number];

// =====================================================================  P1 · GRANDE, DETRÁS
/**
 * P1 · Título en dos letras detrás de la cabeza: una línea en sans gruesa blanca (minúsculas, apretada) y otra en serif
 * cursiva del color de acento, más grande y montada sobre la primera. La cabeza tapa la base de la segunda línea.
 * Va en el `behind` de Cam2. `top` ≈ coronilla (TOPS) − 230 para que la cabeza tape la parte baja de la cursiva.
 * lineas: [{ at, t: "exposing my" }, { at, t: "viral launch", cursiva: true }]
 */
export const TituloDetras: React.FC<{ from: number; to: number; top: number; lineas: { at: number; t: string; cursiva?: boolean; color?: string }[]; size?: number; ancho?: number }> = ({
  from, to, top, lineas, size = 230, ancho = 1000,
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: sale(t, to + 0.3, 0.3) }}>
      {lineas.map((l, i) => {
        const cur = !!l.cursiva;
        // ajusta el tamaño al ancho (medido en render): la sans gruesa ocupa ~0,44 em por letra, la serif cursiva ~0,38 em
        const fs = Math.min(cur ? size * 1.12 : size, Math.floor(ancho / (l.t.length * (cur ? 0.38 : 0.44))));
        const p = prog(t, l.at, 0.5);
        return (
          <div key={i} style={{ whiteSpace: "nowrap", lineHeight: cur ? 0.9 : 0.95, marginTop: i ? -fs * 0.12 : 0,
            fontFamily: cur ? FINA : TITLE, fontStyle: cur ? "italic" : "normal", fontWeight: cur ? 400 : 800, fontSize: fs,
            letterSpacing: cur ? -fs * 0.01 : -fs * 0.055, color: l.color ?? (cur ? C.lime : "#fff"), textShadow: "0 6px 34px rgba(0,0,0,.28)",
            opacity: t < l.at ? 0 : p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 40}px)` }}>{l.t}</div>
        );
      })}
    </div>
  );
};

// =====================================================================  P6 · GRANDE, DETRÁS
/**
 * P6 · Tarjetas de perfil: 2–4 tarjetas blancas en abanico encima de la cabeza (inicial en un círculo del segundo color,
 * @cuenta, cifra grande, «seguidores» y botón «Seguir»). Caen una tras otra y flotan. Va en el `behind` de Cam2: si la
 * cabeza sube, la tapa. `top` ≈ coronilla − 330. Solo cuentas y cifras reales, con fuente.
 */
export const TarjetasPerfil: React.FC<{ from: number; to: number; top: number; items: { at: number; inicial: string; usuario: string; valor: string; etiqueta?: string; boton?: string }[]; color?: string; w?: number }> = ({
  from, to, top, items, color = C.violet, w = 280,
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const n = items.length;
  const paso = Math.min(w + 20, 980 / n);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, height: 360, opacity: sale(t, to + 0.3, 0.3) }}>
      {items.map((it, i) => {
        if (t < it.at) return null;
        const p = pop(t, it.at, 0.5);
        const centro = i - (n - 1) / 2;
        const rot = centro * 5 + Math.sin(t * 1.3 + i) * 0.8;
        const y = Math.abs(centro) * 14 + Math.sin(t * 1.6 + i * 1.7) * 5 - (1 - p) * 90;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + centro * paso - w / 2, top: y, width: w, background: "#fff", borderRadius: 22,
            padding: "22px 18px 18px", boxShadow: "0 22px 50px rgba(0,0,0,.35)", textAlign: "center", opacity: Math.min(1, p * 2),
            transform: `rotate(${rot}deg) scale(${0.85 + 0.15 * p})` }}>
            <div style={{ width: w * 0.36, height: w * 0.36, margin: "0 auto", borderRadius: "50%", background: color, border: `5px solid ${C.lime}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FINA, fontStyle: "italic", fontSize: w * 0.24, color: "#fff" }}>{it.inicial}</div>
            <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: w * 0.085, color: "#222", marginTop: 10 }}>{it.usuario}</div>
            <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: w * 0.22, color, lineHeight: 1.05, letterSpacing: -2 }}>{it.valor}</div>
            <div style={{ fontFamily: TITLE, fontWeight: 500, fontSize: w * 0.07, color: "#888", marginTop: -2 }}>{it.etiqueta ?? "seguidores"}</div>
            <div style={{ marginTop: 12, background: color, color: "#fff", borderRadius: 10, padding: "8px 0", fontFamily: TITLE, fontWeight: 800, fontSize: w * 0.075 }}>{it.boton ?? "Seguir"}</div>
          </div>
        );
      })}
    </div>
  );
};

// =====================================================================  P2 · CHICO, DELANTE
/**
 * P2 · Palabra suelta al costado: subtítulo de UNA palabra, chico, sans gruesa blanca, al lado de la cabeza a la altura de
 * los ojos o la mejilla (como «either» en la referencia), nunca sobre la cara. Las claves cambian a serif cursiva del acento.
 * Lado: con `caras` (FACES de scripts/caras.py) se pone sola en el lado libre de cada toma; si la cara está al centro, cambia
 * de lado cada frase. Sin `caras`, usa `alinear` y `x` fijos (x = borde izquierdo, o el derecho con alinear="der").
 */
export const PalabraSuelta: React.FC<{ claves?: string[]; ocultar?: [number, number][]; caras?: { at: number; top: number; bottom: number; cx: number }[];
  x?: number; y?: number; alinear?: "izq" | "der"; size?: number; separacion?: number; mano?: Mano | [number, number, Mano][]; color?: string; colorClave?: string }> = ({
  claves = [], ocultar = [], caras, x = 120, y = 640, alinear = "izq", size = 64, separacion = 310, mano, color = "#fff", colorClave = C.lime,
}) => {
  const t = useT();
  if (fuera(t, ocultar)) return null;
  const i = WORDS.findIndex((w, k) => t >= w.s - 0.03 && t < (WORDS[k + 1] ? Math.min(WORDS[k + 1].s - 0.03, w.e + 0.5) : w.e + 0.4));
  if (i < 0) return null;
  const w = WORDS[i];
  const clave = claves.includes(limpia(w.w));
  const p = pop(t, w.s - 0.03, 0.2);
  let lado = alinear, borde = x, top = y;
  if (caras && caras.length) {
    const c = [...caras].reverse().find((f) => t >= f.at) ?? caras[0];
    // frase actual = cuántos puntos o comas hubo antes: sirve para alternar cuando la cara está al centro
    const frase = WORDS.slice(0, i).filter((q) => /[.,;:?!]$/.test(q.w)).length;
    lado = c.cx > 600 ? "der" : c.cx < 480 ? "izq" : frase % 2 ? "der" : "izq";
    top = c.top + (c.bottom - c.top) * 0.35;
    borde = lado === "izq" ? c.cx - separacion : c.cx + separacion; // borde del texto que mira a la cara
  }
  const libre = lado === "izq" ? borde - 40 : 1040 - borde;
  const txt = sinPunto(w.w);
  const m = typeof mano === "string" ? mano : mano?.find(([a, b]) => t >= a && t < b)?.[2];
  // ancho por letra medido en render: sans gruesa ~0,5 em · serif cursiva ~0,42 · a mano (con letras separadas) ~0,72
  const fs = Math.max(34, Math.min(clave ? size * 1.3 : size, Math.floor(libre / (txt.length * (clave ? 0.42 : m ? 0.72 : 0.5)))));
  const st: React.CSSProperties = caras ? (lado === "izq" ? { right: 1080 - borde } : { left: borde }) : (lado === "izq" ? { left: borde } : { right: 1080 - borde });
  // letra a mano en todo el subtítulo (mano="a") o solo en tramos ([[desde, hasta, "b"], …]) para jugar con ella
  return (
    <div style={{ position: "absolute", top, ...st, transform: `scale(${0.9 + 0.1 * p})`, transformOrigin: lado === "izq" ? "100% 50%" : "0 50%", opacity: Math.min(1, p * 2) }}>
      <span style={clave
        ? { fontFamily: FINA, fontStyle: "italic", fontSize: fs, color: colorClave, textShadow: SOMBRA }
        : m ? { fontFamily: MANO[m], fontSize: fs * 0.95, color, letterSpacing: fs * 0.1, textShadow: SOMBRA }
        : { fontFamily: TITLE, fontWeight: 800, fontSize: fs, color, letterSpacing: -fs * 0.04, textShadow: SOMBRA }}>{txt}</span>
    </div>
  );
};

// =====================================================================  P3 · MEDIANO, DELANTE
/**
 * P3 · Título con nota a mano: una línea en sans gruesa blanca (mediana) y debajo una línea en letra a mano que se escribe
 * sola de izquierda a derecha («1. test for demand»). Para listas y pasos que se dicen. Bajo el mentón, nunca sobre la cara.
 * Con varios pasos: mismo `titulo` fijo y una pieza por paso con su `nota`, o `notas` con su `at` cada una.
 */
export const TituloNota: React.FC<{ from: number; to: number; top: number; titulo: string; notas: { at: number; t: string }[]; size?: number; mano?: Mano; color?: string; colorNota?: string }> = ({
  from, to, top, titulo, notas, size = 86, mano = "a", color = "#fff", colorNota = "#fff",
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = prog(t, from, 0.35);
  const nota = [...notas].reverse().find((n) => t >= n.at);
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", opacity: sale(t, to + 0.3) }}>
      <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: Math.min(size, Math.floor(1000 / (titulo.length * 0.5))), color,
        letterSpacing: -size * 0.05, lineHeight: 1, textShadow: SOMBRA, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>{titulo}</div>
      {nota && (() => {
        const q = prog(t, nota.at, Math.min(0.9, 0.06 * nota.t.length));
        return <div key={nota.t} style={{ fontFamily: MANO[mano], fontSize: size * 0.8, color: colorNota, marginTop: 10, textShadow: SOMBRA, letterSpacing: size * 0.1,
          display: "inline-block", clipPath: `inset(-20% ${100 - q * 100}% -20% 0)`, transform: "rotate(-1.5deg)" }}>{nota.t}</div>;
      })()}
    </div>
  );
};

// =====================================================================  P4 · MEDIANO, DELANTE
/**
 * P4 · Nota a mano suelta: 1–3 líneas en letra a mano blanca, un poco inclinadas, que se escriben solas línea por línea.
 * Para un comentario aparte («y esta es mi primera vez haciendo esto :)»). Sobre el pecho o a un costado, nunca la cara.
 */
export const NotaMano: React.FC<{ from: number; to: number; lineas: string[]; top: number; left?: number; right?: number; rot?: number; size?: number; color?: string; mano?: Mano }> = ({
  from, to, lineas, top, left = 90, right = 90, rot = -4, size = 66, color = "#fff", mano = "a",
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const total = lineas.join("").length;
  const dur = Math.min(1.6, 0.05 * total);
  let acum = 0;
  return (
    <div style={{ position: "absolute", top, left, right, transform: `rotate(${rot}deg)`, opacity: sale(t, to + 0.3), fontFamily: MANO[mano], fontSize: size,
      color, lineHeight: 1.25, letterSpacing: size * 0.14, textShadow: SOMBRA }}>
      {lineas.map((l, i) => {
        const a = from + (acum / total) * dur;
        acum += l.length;
        const q = prog(t, a, (l.length / total) * dur);
        return <div key={i} style={{ clipPath: `inset(-20% ${100 - q * 100}% -20% 0)` }}>{l}</div>;
      })}
    </div>
  );
};

// =====================================================================  P5 · MEDIANO, DELANTE
const bloques = (max: number) => {
  const out: { words: W[]; s: number; e: number }[] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const pausa = nx ? nx.s - w.e > 0.3 : true;
    if (cur.length >= max || /[.?!,;:]$/.test(w.w) || pausa || !nx) { out.push({ words: cur, s: cur[0].s, e: nx ? Math.min(nx.s, w.e + 0.35) : w.e + 0.5 }); cur = []; }
  });
  return out;
};
const Destello: React.FC<{ t: number; fase: number; size: number; style: React.CSSProperties }> = ({ t, fase, size, style }) => {
  const s = 0.6 + 0.4 * Math.abs(Math.sin(t * 2.2 + fase));
  return <span style={{ position: "absolute", fontSize: size, color: "#fff", opacity: 0.75 + 0.25 * s, textShadow: "0 0 12px rgba(255,255,255,.8)", transform: `scale(${s}) rotate(${t * 40 + fase * 30}deg)`, ...style }}>✦</span>;
};
/**
 * P5 · Subtítulos en serif con destellos: frases cortas en serif fina blanca; la frase que lleva una palabra clave sale en
 * serif cursiva más grande con dos destellos ✦ que titilan a los lados. Elegante, para testimonios, historias y marca.
 * En el pecho (y ≈ 1100–1250), nunca sobre la cara.
 */
export const SubsSerif: React.FC<{ claves: string[]; ocultar?: [number, number][]; y?: number; size?: number; max?: number; color?: string }> = ({
  claves, ocultar = [], y = 1120, size = 64, max = 4, color = "#fff",
}) => {
  const t = useT();
  const B = React.useMemo(() => bloques(max), [max]);
  if (fuera(t, ocultar)) return null;
  const b = B.find((c) => t >= c.s && t < c.e);
  if (!b) return null;
  const k = b.words.some((w) => claves.includes(limpia(w.w)));
  const p = prog(t, b.s, 0.18);
  const fs = k ? size * 1.25 : size;
  const texto = b.words.map((w) => sinPunto(w.w)).join(" ");
  return (
    <div style={{ position: "absolute", top: y, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
      <div style={{ position: "relative", fontFamily: FINA, fontStyle: k ? "italic" : "normal", fontSize: Math.min(fs, Math.floor(1700 / Math.max(8, texto.length))),
        color, textShadow: SOMBRA, textAlign: "center", lineHeight: 1.05, padding: k ? "0 50px" : 0 }}>
        {k && <Destello t={t} fase={0} size={fs * 0.55} style={{ left: -4, top: "10%" }} />}
        {texto}
        {k && <Destello t={t} fase={1.7} size={fs * 0.42} style={{ right: 0, bottom: "-30%" }} />}
      </div>
    </div>
  );
};
