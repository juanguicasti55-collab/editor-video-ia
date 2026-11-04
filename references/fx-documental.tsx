// Look «documental cálido» (efecto 13 del menú): color cálido con grano, franjas de cine, títulos serif crema,
// capítulos con número, cita grande en itálica, ficha de nombre, recuadro de revista y frase tachada.
// Para testimonios e historias de alumnos o clientes (reales). Copiar a remotion/src/doc.tsx.
// Va con Cam2 + CoverStory de fx-efectos.tsx para la portada detrás de la persona.
// Orden en Main: Cam2 → <Pelicula/> → piezas → <Destello/> → <SubsDoc/> → <Franjas/> → <CierreDoc/>.
// Probado en un anuncio vertical de 85 s (testimonio de una alumna).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TITLE, HAND, SERIF } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";

export const D = { crema: "#F4EAD8", terracota: "#E0895A", tinta: "#1B1410", oro: "#E8C27A", fondo: "#120D0A" };
const SOMBRA = "0 3px 14px rgba(0,0,0,.65), 0 0 32px rgba(0,0,0,.35)";

/** Tono cálido + viñeta + grano: va encima de la cámara y debajo de los textos. */
export const Pelicula: React.FC<{ until: number }> = ({ until }) => {
  const t = useT();
  const f = useCurrentFrame();
  if (t > until) return null;
  const sx = (f * 37) % 200, sy = (f * 53) % 200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(255,150,70,.10)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "rgba(255,170,90,.06)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,8,0,.55) 100%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.11, mixBlendMode: "overlay" }}>
        <filter id="grano"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 30} /></filter>
        <rect x={-sx} y={-sy} width="1300" height="2150" filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Franjas de cine arriba y abajo (en la zona que tapa la interfaz de Reels). */
export const Franjas: React.FC<{ until: number }> = ({ until }) => {
  const t = useT();
  if (t > until) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: D.fondo }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: D.fondo }} />
    </>
  );
};

/** Destello cálido de luz para los cambios de capítulo. */
export const Destello: React.FC<{ at: number[] }> = ({ at }) => {
  const t = useT();
  const c = at.find((a) => t >= a - 0.15 && t < a + 0.5);
  if (c === undefined) return null;
  const o = t < c ? prog(t, c - 0.15, 0.15) : 1 - prog(t, c, 0.5);
  return <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 85% 20%, rgba(255,190,120,.9), rgba(255,140,60,.35) 45%, rgba(0,0,0,0) 75%)", opacity: o * 0.8, mixBlendMode: "screen" }} />;
};

/** Capítulo: número romano + título serif, arriba. */
export const Capitulo: React.FC<{ from: number; to: number; n: string; t: string }> = ({ from, to, n, t: titulo }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = prog(t, from, 0.6);
  const o = Math.min(1, p * 1.5) * (1 - prog(t, to, 0.25));
  return (
    <div style={{ position: "absolute", top: 230, left: 70, right: 70, opacity: o, textShadow: SOMBRA }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 800, fontSize: 40, color: D.oro, letterSpacing: 4 }}>{n}</div>
      <div style={{ height: 3, width: 120 * p, background: D.oro, margin: "8px 0 12px" }} />
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 70, lineHeight: 1.02, color: D.crema, letterSpacing: -1 }}>{titulo}</div>
    </div>
  );
};

/** Cita grande en serif itálica, con comillas. */
export const CitaGrande: React.FC<{ from: number; to: number; top: number; texto: string; quien: string }> = ({ from, to, top, texto, quien }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.6);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.25));
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, opacity: o, transform: `translateY(${(1 - p) * 40}px)` }}>
      <div style={{ background: "rgba(18,13,10,.78)", borderLeft: `8px solid ${D.terracota}`, borderRadius: 10, padding: "26px 34px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 120, lineHeight: 0.5, color: D.terracota, height: 50 }}>“</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 800, fontSize: 60, lineHeight: 1.12, color: D.crema }}>{texto}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: D.oro, marginTop: 16, textTransform: "uppercase" }}>— {quien}</div>
      </div>
    </div>
  );
};

/** Ficha de nombre tipo documental. */
export const Rotulo: React.FC<{ from: number; to: number; top: number; nombre: string; detalle: string }> = ({ from, to, top, nombre, detalle }) => {
  const t = useT();
  if (t < from || t > to + 0.2) return null;
  const p = prog(t, from, 0.5);
  const o = Math.min(1, p * 1.6) * (1 - prog(t, to, 0.2));
  return (
    <div style={{ position: "absolute", top, left: 70, opacity: o, textShadow: SOMBRA }}>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: D.crema }}>{nombre}</div>
      <div style={{ height: 3, width: 260 * p, background: D.terracota, margin: "4px 0 10px" }} />
      <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: D.oro, textTransform: "uppercase" }}>{detalle}</div>
    </div>
  );
};

/** Lista que se escribe renglón por renglón en una tarjeta crema (como recuadro de revista). */
export const Recuadro: React.FC<{ from: number; to: number; top: number; titulo: string; filas: { at: number; t: string }[] }> = ({ from, to, top, titulo, filas }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.5);
  return (
    <div style={{ position: "absolute", top, right: 60, width: 520, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)), transform: `rotate(${1.5 * p}deg) scale(${0.9 + 0.1 * p})` }}>
      <div style={{ background: D.crema, borderRadius: 6, padding: "26px 30px", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 800, fontSize: 40, color: D.terracota }}>{titulo}</div>
        <div style={{ height: 2, background: "rgba(27,20,16,.25)", margin: "10px 0 14px" }} />
        {filas.map((r, i) => (
          <div key={i} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 44, lineHeight: 1.3, color: D.tinta, opacity: prog(t, r.at, 0.3), transform: `translateX(${(1 - prog(t, r.at, 0.3)) * 20}px)` }}>· {r.t}</div>
        ))}
      </div>
    </div>
  );
};

/** Frase tachada con tinta roja, en serif. */
export const TachaSerif: React.FC<{ from: number; to: number; strikeAt: number; top: number; texto: string }> = ({ from, to, strikeAt, top, texto }) => {
  const t = useT();
  if (t < from || t > to + 0.2) return null;
  const s = prog(t, strikeAt, 0.35);
  const o = prog(t, from, 0.3) * (1 - prog(t, to, 0.2));
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: o, textShadow: SOMBRA }}>
      <span style={{ position: "relative", fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: s > 0.5 ? "rgba(244,234,216,.6)" : D.crema }}>
        {texto}
        <svg width="100%" height="40" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: "38%" }}>
          <path d="M1 6 Q 30 2, 55 6 T 99 4" stroke={D.terracota} strokeWidth={1.6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - s} strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
};

// ---------- subtítulos: manuscrita + palabra clave en gruesa ----------
const limpia = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,;:¿?¡!«»"“”…]/g, "");
type Bloque = { words: typeof WORDS; s: number; e: number };
const BLOQUES: Bloque[] = (() => {
  const out: Bloque[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const fin = /[.?!»]$/.test(w.w);
    const coma = /[,;:]$/.test(w.w);
    const pausa = nx ? nx.s - w.e > 0.3 : true;
    if (cur.length >= 4 || fin || ((coma || pausa) && cur.length >= 2) || !nx) {
      out.push({ words: cur, s: cur[0].s, e: nx ? Math.min(nx.s, w.e + 0.35) : w.e + 0.5 });
      cur = [];
    }
  });
  return out;
})();
/** Subtítulos en manuscrita (HAND) con la palabra clave en la gruesa (TITLE). `claves`: sin tildes, minúsculas. */
export const SubsDoc: React.FC<{ claves: string[]; ocultar: [number, number][]; y?: number; color?: string; clave?: string }> = ({
  claves, ocultar, y = 1400, color = D.crema, clave = D.terracota }) => {
  const t = useT();
  if (ocultar.some(([a, b]) => t >= a && t <= b)) return null;
  const b = BLOQUES.find((c) => t >= c.s && t < c.e);
  if (!b) return null;
  const k = new Set(claves);
  const o = prog(t, b.s, 0.18);
  return (
    <div style={{ position: "absolute", top: y - 70, left: 40, right: 140, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0 18px", opacity: o }}>
      {b.words.map((w, i) => {
        const dicha = t >= w.s;
        const txt = w.w.replace(/[,.;:]$/, "");
        return k.has(limpia(w.w)) ? (
          <span key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 80, letterSpacing: -1.5, color: dicha ? clave : "rgba(244,234,216,.4)", textShadow: SOMBRA }}>{txt}</span>
        ) : (
          <span key={i} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 90, color: dicha ? color : "rgba(244,234,216,.45)", textShadow: SOMBRA }}>{txt}</span>
        );
      })}
    </div>
  );
};

/** Cierre documental: fondo cálido oscuro, título serif y botón. En anuncios: button = «Toca el botón de abajo ↓». */
export const CierreDoc: React.FC<{ from: number; kicker: string; title: string; button: string }> = ({ from, kicker, title, button }) => {
  const t = useT();
  if (t < from - 0.05) return null;
  const o = prog(t, from, 0.4);
  const p = pop(t, from + 0.2, 0.6);
  const pulse = 1 + 0.03 * Math.sin((t - from) * 6);
  return (
    <AbsoluteFill style={{ opacity: o, background: `radial-gradient(80% 50% at 50% 42%, #3a2418 0%, ${D.fondo} 80%)` }}>
      <div style={{ position: "absolute", top: 560, left: 70, right: 70, textAlign: "center", transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 800, fontSize: 40, letterSpacing: 4, color: D.oro }}>{kicker}</div>
        <div style={{ height: 3, width: 140, background: D.oro, margin: "16px auto 22px" }} />
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, lineHeight: 1.02, color: D.crema }}>{title}</div>
        <div style={{ display: "inline-block", marginTop: 46, background: D.terracota, color: D.tinta, borderRadius: 50, padding: "24px 54px", fontFamily: TITLE, fontWeight: 900, fontSize: 56,
          transform: `scale(${pulse})`, opacity: prog(t, from + 0.6, 0.3) }}>{button}</div>
      </div>
    </AbsoluteFill>
  );
};
