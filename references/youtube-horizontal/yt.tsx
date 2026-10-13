// Kit en horizontal (1920x1080) para videos largos de YouTube: cámara completa con cortes secos,
// texto grande animado, texto detrás de la persona, clips de apoyo flotando o a pantalla completa y gráficos de línea.
// Todo se sincroniza con las palabras: W("palabra") = segundo en que se dice.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, BODY, SERIF, MONO, MARCA } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";

export const SHADOW = "0 2px 10px rgba(0,0,0,.8), 0 0 30px rgba(0,0,0,.5)";
export const DROP = "drop-shadow(0 3px 10px rgba(0,0,0,.65))";
export const INK = "#0b0c0f";
const norm = (s: string) => s.toLowerCase().replace(/[.,;:¿?¡!«»"“”…]/g, "");

/** Segundo en que empieza la n-ésima vez que se dice `word` a partir de `after`. */
export const W = (word: string, after = 0, n = 1): number => {
  let k = 0;
  for (const w of WORDS) if (w.s >= after && norm(w.w) === norm(word) && ++k === n) return w.s;
  throw new Error(`No encuentro la palabra «${word}» (#${n}) después de ${after}s`);
};
export const WE = (word: string, after = 0, n = 1): number => {
  let k = 0;
  for (const w of WORDS) if (w.s >= after && norm(w.w) === norm(word) && ++k === n) return w.e;
  throw new Error(`No encuentro la palabra «${word}» (#${n}) después de ${after}s`);
};
const vis = (t: number, from: number, to: number, pad = 0.3) => t >= from - 0.02 && t <= to + pad;
const fade = (t: number, from: number, to: number, din = 0.3, dout = 0.25) => prog(t, from, din) * (1 - prog(t, to, dout));

// ---------- cámara ----------
/** z = zoom · dx/dy = corrimiento en px (para dejar un lado libre). Cada clave es un corte seco. */
export type Key = { at: number; z?: number; dx?: number; dy?: number };
export const keyAt = (keys: Key[], t: number) => { let i = 0; while (i + 1 < keys.length && keys[i + 1].at <= t) i++; return keys[i]; };
export type FgRange = { from: number; to: number; src: string };
const camStyle = (k: Key, t: number, fy: number): React.CSSProperties => {
  const z = (k.z ?? 1) * (1 + 0.03 * Math.min(1, (t - k.at) / 7)); // empuje lento dentro de cada plano
  return { width: "100%", height: "100%", objectFit: "cover", transform: `translate(${k.dx ?? 0}px, ${k.dy ?? 0}px) scale(${z})`, transformOrigin: `50% ${fy}%` };
};
/** Cámara completa. `fg` + `behind` = capa detrás de la persona (tramos recortados con matte_h.py). */
export const Cam: React.FC<{ keys: Key[]; fy?: number; fg?: FgRange[]; behind?: React.ReactNode }> = ({ keys, fy = 40, fg = [], behind }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const st = camStyle(keyAt(keys, t), t, fy);
  const on = fg.find((r) => t >= r.from && t < r.to);
  return (
    <>
      <AbsoluteFill style={{ overflow: "hidden" }}><OffthreadVideo src={staticFile("cut.mp4")} style={st} /></AbsoluteFill>
      {on && behind}
      {fg.map((r, i) => (
        <Sequence key={i} from={Math.round(r.from * fps)} durationInFrames={Math.max(1, Math.round((r.to - r.from) * fps))}>
          <AbsoluteFill style={{ overflow: "hidden" }}><OffthreadVideo muted transparent src={staticFile(r.src)} style={st} /></AbsoluteFill>
        </Sequence>
      ))}
    </>
  );
};
/** Texto enorme para la capa de atrás. `x` = centro horizontal. */
export const BehindText: React.FC<{ from: number; to: number; top: number; x?: number; size?: number; lines: { at: number; t: string; color?: string; outline?: boolean }[] }> = ({
  from, to, top, x = 960, size = 260, lines,
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = 1 - prog(t, to - 0.18, 0.18);
  return (
    <div style={{ position: "absolute", top, left: x - 960, width: 1920, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      {lines.map((l, i) => {
        const fs = Math.min(size, Math.floor(1780 / (l.t.length * 0.62)));
        const p = pop(t, l.at, 0.45);
        const col = l.color ?? "#fff";
        return (
          <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: fs, lineHeight: 0.9, letterSpacing: -fs * 0.045, textTransform: "uppercase", whiteSpace: "nowrap",
            color: l.outline ? "transparent" : col, WebkitTextStroke: l.outline ? `${Math.max(4, fs * 0.02)}px ${col}` : undefined,
            textShadow: l.outline ? "none" : "0 6px 34px rgba(0,0,0,.4)", opacity: t < l.at ? 0 : Math.min(1, p * 1.8), transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})` }}>{l.t}</div>
        );
      })}
    </div>
  );
};

/** Oscurece un lado o la base para que el texto se lea sobre el cielo. */
export const Shade: React.FC<{ from: number; to: number; side?: "left" | "right" | "bottom" | "all"; k?: number }> = ({ from, to, side = "bottom", k = 0.62 }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const g = side === "left" ? `linear-gradient(90deg, rgba(8,9,12,${k}) 0%, rgba(8,9,12,${k * 0.75}) 34%, rgba(8,9,12,0) 62%)`
    : side === "right" ? `linear-gradient(270deg, rgba(8,9,12,${k}) 0%, rgba(8,9,12,${k * 0.75}) 34%, rgba(8,9,12,0) 62%)`
    : side === "all" ? `rgba(8,9,12,${k})`
    : `linear-gradient(180deg, rgba(8,9,12,0) 52%, rgba(8,9,12,${k}) 100%)`;
  return <AbsoluteFill style={{ background: g, opacity: fade(t, from, to, 0.35, 0.3) }} />;
};
/** Sombra fija abajo para subtítulos. */
export const BaseShade = () => <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 68%, rgba(0,0,0,.38) 100%)" }} />;
export const Flash: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const t = useT();
  const c = cuts.find((x) => x > 0 && t >= x && t < x + 0.14);
  if (c === undefined) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: 0.18 * (1 - (t - c) / 0.14) }} />;
};

// ---------- subtítulos chicos ----------
type Wd = (typeof WORDS)[number];
const CHUNKS = (() => {
  const out: { words: Wd[]; s: number; e: number }[] = [];
  let cur: Wd[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const end = /[.?!]$/.test(w.w);
    const punct = /[,;:]$/.test(w.w);
    const gap = next ? next.s - w.e > 0.3 : true;
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (cur.length >= 4 || len >= 20 || end || ((punct || gap) && cur.length >= 2) || !next) {
      out.push({ words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.35) : w.e + 0.5 });
      cur = [];
    }
  });
  return out;
})();
export const Subs: React.FC<{ hide: [number, number][]; y?: number; keywords?: string[] }> = ({ hide, y = 968, keywords = [] }) => {
  const t = useT();
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch) return null;
  const kw = new Set(keywords.map(norm));
  return (
    <div style={{ position: "absolute", top: y, left: 200, right: 200, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 50, letterSpacing: -0.6, color: "#fff",
      textShadow: SHADOW, opacity: prog(t, ch.s, 0.1) }}>
      {ch.words.map((w, i) => (
        <span key={i} style={{ color: kw.has(norm(w.w)) ? C.lime : "#fff" }}>{w.w.replace(/[.,]$/, "")}{i < ch.words.length - 1 ? " " : ""}</span>
      ))}
    </div>
  );
};

// ---------- iconos de línea que se dibujan ----------
const PATHS = {
  alert: ["M12 3l10 17H2z", "M12 10v4", "M12 17v.5"],
  check: ["M4 12.5l5 5L20 6.5"],
  x: ["M5 5l14 14", "M19 5L5 19"],
  heart: ["M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
  bulb: ["M12 3a6 6 0 0 0-4 10.5V15h8v-1.5A6 6 0 0 0 12 3z", "M9 18h6", "M10 21h4"],
  chip: ["M7 7h10v10H7z", "M10 10h4v4h-4z", "M9 3v4", "M15 3v4", "M9 17v4", "M15 17v4", "M3 9h4", "M3 15h4", "M17 9h4", "M17 15h4"],
  skull: ["M5 11a7 7 0 0 1 14 0v4l-2 1.5V19H7v-2.5L5 15z", "M8.5 11.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0", "M12.9 11.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0", "M10.5 19v-2", "M13.5 19v-2"],
  sun: ["M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M5 5l2 2", "M17 17l2 2", "M19 5l-2 2", "M7 17l-2 2"],
  scale: ["M12 4v16", "M7 20h10", "M5 7h14", "M5 7l-3 7a3 3 0 0 0 6 0z", "M19 7l-3 7a3 3 0 0 0 6 0z"],
  brief: ["M3 8h18v11H3z", "M9 8V5h6v3", "M3 13h18"],
  build: ["M4 21V5l8-2v18", "M12 9l8 2v10", "M2 21h20", "M7 8v1", "M7 12v1", "M7 16v1", "M16 14v1", "M16 17v1"],
  book: ["M4 5c3-1.5 5-1.5 8 0v15c-3-1.5-5-1.5-8 0z", "M12 5c3-1.5 5-1.5 8 0v15c-3-1.5-5-1.5-8 0z"],
  chat: ["M4 5h16v11H10l-5 4v-4H4z", "M8 9h8", "M8 12h5"],
  bot: ["M6 9h12v10H6z", "M12 9V5", "M11 4a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", "M9.5 13v1.5", "M14.5 13v1.5", "M3 13v3", "M21 13v3"],
  clock: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M12 7v5l3.5 2"],
  money: ["M3 7h18v10H3z", "M9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0", "M6 10v4", "M18 10v4"],
  users: ["M5.5 8a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0", "M13.5 8a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0", "M3 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5", "M11 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],
  bolt: ["M13 2L4 14h7l-1 8 9-12h-7z"],
  step: ["M3 20h5v-5h5v-5h5V5h3", "M17 5h4v4"],
  globe: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M3 12h18", "M12 3c3 3 3 15 0 18", "M12 3c-3 3-3 15 0 18"],
  doc: ["M6 3h9l4 4v14H6z", "M15 3v4h4", "M9 12h7", "M9 16h7"],
  target: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"],
  flow: ["M3 4h6v5H3z", "M15 4h6v5h-6z", "M9 15h6v5H9z", "M6 9v3h12V9", "M12 12v3"],
  home: ["M3 11l9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
} as const;
export type IconName = keyof typeof PATHS;
export const Icon: React.FC<{ name: IconName; at: number; size?: number; color?: string; sw?: number }> = ({ name, at, size = 96, color = C.lime, sw = 2 }) => {
  const t = useT();
  const d = prog(t, at, 0.55);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ filter: DROP, transform: `scale(${0.7 + 0.3 * pop(t, at, 0.4)})`, flexShrink: 0 }}>
      {PATHS[name].map((p, i) => <path key={i} d={p} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />)}
    </svg>
  );
};

// ---------- texto grande animado ----------
export type Line = { at: number; t: string; k?: "sm" | "big" | "huge" | "serif" | "tag"; color?: string; mark?: string; strikeAt?: number; underlineAt?: number; icon?: IconName };
/** Bloque de líneas. x/y = esquina (o centro si align="center") · w = ancho disponible. */
export const Kin: React.FC<{ from: number; to: number; x: number; y: number; w?: number; align?: "left" | "center" | "right"; lines: Line[]; maxHuge?: number; maxBig?: number }> = ({
  from, to, x, y, w = 760, align = "left", lines, maxHuge = 190, maxBig = 112,
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const out = 1 - prog(t, to, 0.2);
  const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const ai = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  return (
    <div style={{ position: "absolute", left, top: y, width: w, display: "flex", flexDirection: "column", alignItems: ai, gap: 4, opacity: out }}>
      {lines.map((l, i) => {
        const k = l.k ?? "sm";
        const big = k === "big" || k === "huge";
        const avail = w - (l.icon ? 120 : 0);
        const fs = k === "huge" ? Math.min(maxHuge, Math.floor(avail / (l.t.length * 0.56)))
          : k === "big" ? Math.min(maxBig, Math.floor(avail / (l.t.length * 0.55)))
          : k === "serif" ? Math.min(92, Math.floor(avail / (l.t.length * 0.47)))
          : k === "tag" ? 26 : Math.min(48, Math.floor(avail / (l.t.length * 0.5)));
        const h = k === "tag" ? 46 : Math.round(fs * (k === "serif" ? 1.22 : big ? 1.04 : 1.3));
        if (t < l.at) return <div key={i} style={{ height: h }} />;
        const p = big ? pop(t, l.at, 0.35) : prog(t, l.at, 0.28);
        const st = l.strikeAt !== undefined ? prog(t, l.strikeAt, 0.3) : 0;
        const ul = l.underlineAt !== undefined ? prog(t, l.underlineAt, 0.45) : 0;
        const mk = l.mark ? prog(t, l.at + 0.12, 0.35) : 0;
        const base = k === "serif" ? l.color ?? C.lime : k === "tag" ? l.color ?? C.lime : l.color ?? "#fff";
        const color = l.mark && mk > 0.5 ? INK : st > 0.5 ? "rgba(255,255,255,.55)" : base;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: h, transformOrigin: align === "left" ? "0 50%" : align === "right" ? "100% 50%" : "50% 50%",
            transform: big ? `scale(${(k === "huge" ? 1.35 : 0.82) + (k === "huge" ? -0.35 : 0.18) * p})` : `translateY(${(1 - p) * 14}px)`, opacity: Math.min(1, p * 1.6) }}>
            {k === "tag" && <div style={{ width: 44, height: 2, background: base, boxShadow: "0 1px 6px rgba(0,0,0,.6)" }} />}
            {l.icon && <Icon name={l.icon} at={l.at} size={Math.min(100, Math.max(60, fs))} color={l.color ?? C.lime} />}
            <div style={{ position: "relative", isolation: "isolate", whiteSpace: "nowrap", lineHeight: 1, color, fontSize: fs,
              fontFamily: k === "serif" ? SERIF : k === "tag" ? MONO : big ? TITLE : BODY, fontStyle: k === "serif" ? "italic" : "normal",
              fontWeight: k === "serif" ? 500 : k === "tag" ? 500 : big ? 900 : 600, letterSpacing: k === "tag" ? 4 : big ? -fs * 0.045 : -0.6,
              textTransform: k === "tag" ? "uppercase" : "none",
              textShadow: l.mark && mk > 0.5 ? "none" : big && l.color ? `${SHADOW}, 0 0 46px ${l.color}55` : SHADOW }}>
              {l.mark && <span style={{ position: "absolute", left: -14, right: -14, top: -4, bottom: -8, background: l.mark, borderRadius: 10, transformOrigin: "left",
                transform: `scaleX(${mk}) skewX(-6deg)`, zIndex: -1, boxShadow: "0 8px 26px rgba(0,0,0,.35)" }} />}
              {l.t}
              {l.strikeAt !== undefined && <div style={{ position: "absolute", left: -8, right: -8, top: "54%", height: Math.max(6, fs * 0.075), borderRadius: 5, background: C.red,
                transformOrigin: "left", transform: `scaleX(${st})` }} />}
              {l.underlineAt !== undefined && (
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -20, width: "100%", height: 20, filter: DROP }}>
                  <path d="M4 12 C 70 2, 150 18, 296 7" fill="none" stroke={C.lime} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- material de apoyo ----------
const Media: React.FC<{ src: string; from: number; start?: number; style?: React.CSSProperties }> = ({ src, from, start = 0, style }) => {
  const { fps } = useVideoConfig();
  const t = useT();
  const s: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", ...style };
  return /\.(mp4|mov|webm)$/i.test(src)
    ? <Sequence from={Math.round(from * fps)} layout="none"><OffthreadVideo muted src={staticFile(`broll/${src}`)} startFrom={Math.round(start * fps)} style={s} /></Sequence>
    : <Img src={staticFile(`broll/${src}`)} style={{ ...s, transform: `scale(${1.03 + 0.04 * Math.min(1, Math.max(0, t - from) / 5)})` }} />;
};
export const CREDIT = "Imágenes: «The AI Doc» · Focus Features";
/** Clip o imagen flotando sobre la cámara (cámara completa con inserts): entra girado y se asienta. */
export const Clip: React.FC<{ from: number; to: number; src: string; x: number; y: number; w: number; h?: number; rot?: number; start?: number; label?: string; credit?: string | null }> = ({
  from, to, src, x, y, w, h = Math.round((w * 9) / 16), rot = -2.5, start = 0, label, credit = CREDIT,
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const p = pop(t, from, 0.5);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.22));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `rotate(${rot * (0.4 + 0.6 * p) + 0.5 * Math.sin(t * 1.3)}deg) translateY(${(1 - p) * 70}px) scale(${0.84 + 0.16 * p})` }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: 22, overflow: "hidden", border: "5px solid #fff", background: "#111", boxShadow: "0 28px 80px rgba(0,0,0,.6)" }}>
        <Media src={src} from={from} start={start} />
        {label && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "46px 22px 14px", background: "linear-gradient(180deg,transparent,rgba(0,0,0,.82))",
          fontFamily: TITLE, fontWeight: 800, fontSize: 30, letterSpacing: -0.4, color: "#fff" }}>{label}</div>}
      </div>
      {credit && <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: 1.5, color: "rgba(255,255,255,.85)", textShadow: SHADOW, textTransform: "uppercase" }}>{credit}</div>}
    </div>
  );
};
/** Clip a pantalla completa mientras Juan lo comenta, con etiqueta y crédito. */
export type FullItem = { from: number; to: number; src: string; start?: number; tag?: string; origin?: string };
export const Fulls: React.FC<{ list: FullItem[] }> = ({ list }) => {
  const t = useT();
  return (
    <>
      {list.filter((b) => t >= b.from - 0.05 && t <= b.to + 0.3).map((b) => {
        const pin = prog(t, b.from, 0.22), pout = prog(t, b.to - 0.02, 0.22);
        const tp = pop(t, b.from + 0.2, 0.45);
        return (
          <AbsoluteFill key={b.from} style={{ opacity: pin * (1 - pout), background: "#000", overflow: "hidden" }}>
            <Media src={b.src} from={b.from} start={b.start} style={{ transform: `scale(${1.1 - 0.06 * pin + 0.03 * ((t - b.from) / Math.max(1, b.to - b.from))})`, transformOrigin: b.origin ?? "50% 50%" }} />
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,9,12,.6) 0%, rgba(8,9,12,0) 20%, rgba(8,9,12,0) 62%, rgba(8,9,12,.8) 100%)" }} />
            {b.tag && (
              <div style={{ position: "absolute", left: 56, top: 50, display: "flex", alignItems: "center", gap: 16, opacity: Math.min(1, tp * 1.5), transform: `translateX(${(1 - tp) * -40}px)` }}>
                <div style={{ width: 54, height: 3, background: C.lime }} />
                <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: 4, color: C.lime, textTransform: "uppercase", textShadow: SHADOW }}>{b.tag}</div>
              </div>
            )}
            <div style={{ position: "absolute", right: 52, top: 54, fontFamily: MONO, fontWeight: 500, fontSize: 18, letterSpacing: 1.5, color: "rgba(255,255,255,.8)", textTransform: "uppercase", textShadow: SHADOW }}>{CREDIT}</div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};
/** Nombre y cargo abajo a la izquierda (sobre un clip o la cámara). */
export const Lower: React.FC<{ from: number; to: number; name: string; role: string; x?: number; y?: number }> = ({ from, to, name, role, x = 80, y = 800 }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const p = prog(t, from, 0.4);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: fade(t, from, to), transform: `translateX(${(1 - p) * -30}px)`, display: "flex", gap: 18, alignItems: "stretch" }}>
      <div style={{ width: 6, background: C.lime, borderRadius: 3 }} />
      <div>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 58, letterSpacing: -2, color: "#fff", textShadow: SHADOW, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: C.lime, textTransform: "uppercase", textShadow: SHADOW, marginTop: 6 }}>{role}</div>
      </div>
    </div>
  );
};

// ---------- gráficos ----------
/** Las tres posturas arriba: se encienden en su segundo y `active` marca la que se está comentando. */
export const Stances: React.FC<{ from: number; to: number; items: { at: number; t: string; icon: IconName }[]; active?: (t: number) => number; y?: number }> = ({ from, to, items, active, y = 64 }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const o = fade(t, from, to, 0.35, 0.3);
  const act = active ? active(t) : -1;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, opacity: o }}>
      {items.map((it, i) => {
        const on = t >= it.at;
        const p = pop(t, it.at, 0.45);
        const hot = act === i || (act === -1 && on);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 26px 14px 16px", borderRadius: 16, background: hot && act === i ? C.lime : "rgba(11,12,15,.78)",
            border: `2px solid ${on ? C.lime : "rgba(255,255,255,.25)"}`, boxShadow: "0 12px 34px rgba(0,0,0,.45)", opacity: on ? (act >= 0 && act !== i ? 0.55 : 1) : 0.4,
            transform: `scale(${on ? 0.9 + 0.1 * p : 0.94})` }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: hot && act === i ? INK : on ? C.lime : "rgba(255,255,255,.2)", color: hot && act === i ? C.lime : INK,
              fontFamily: TITLE, fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 32, letterSpacing: -0.8, color: hot && act === i ? INK : "#fff", whiteSpace: "nowrap" }}>{on ? it.t : "···"}</div>
          </div>
        );
      })}
    </div>
  );
};
/** Píldoras con icono que van entrando (lista corta de cosas que se nombran). */
export const Chips: React.FC<{ from: number; to: number; x: number; y: number; items: { at: number; t: string; icon?: IconName; strikeAt?: number }[]; dir?: "col" | "row"; size?: number; align?: "left" | "right" | "center" }> = ({
  from, to, x, y, items, dir = "col", size = 50, align = "left",
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const pos: React.CSSProperties = align === "center" ? { left: 0, right: 0, justifyContent: "center" } : align === "right" ? { right: 1920 - x, alignItems: "flex-end" } : { left: x };
  return (
    <div style={{ position: "absolute", top: y, ...pos, display: "flex", flexDirection: dir === "col" ? "column" : "row", gap: dir === "col" ? 16 : 20, opacity: 1 - prog(t, to, 0.22) }}>
      {items.map((it, i) => {
        const p = pop(t, it.at, 0.42);
        const st = it.strikeAt !== undefined ? prog(t, it.strikeAt, 0.3) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: `${size * 0.26}px ${size * 0.56}px ${size * 0.26}px ${size * 0.4}px`, borderRadius: 18, background: "rgba(11,12,15,.82)",
            border: `2px solid ${st > 0.5 ? "rgba(255,90,79,.7)" : "rgba(225,184,90,.6)"}`, boxShadow: "0 14px 40px rgba(0,0,0,.45)", opacity: t < it.at ? 0 : Math.min(1, p * 2),
            transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + 0.14 * p})`, transformOrigin: align === "right" ? "100% 50%" : "0 50%" }}>
            {it.icon && <Icon name={it.icon} at={it.at} size={size * 1.05} color={st > 0.5 ? C.red : C.lime} />}
            <div style={{ position: "relative", fontFamily: TITLE, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.03, color: st > 0.5 ? "rgba(255,255,255,.55)" : "#fff", whiteSpace: "nowrap" }}>
              {it.t}
              {it.strikeAt !== undefined && <div style={{ position: "absolute", left: -4, right: -4, top: "54%", height: 5, borderRadius: 3, background: C.red, transformOrigin: "left", transform: `scaleX(${st})` }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
/** Número que sube + etiqueta (cifras dichas en cámara). */
export const BigNum: React.FC<{ from: number; to: number; x: number; y: number; value: number; prefix?: string; label: string; sub?: string; align?: "left" | "right" }> = ({ from, to, x, y, value, prefix = "", label, sub, align = "left" }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const pos: React.CSSProperties = align === "right" ? { right: 1920 - x, alignItems: "flex-end" } : { left: x };
  return (
    <div style={{ position: "absolute", top: y, ...pos, display: "flex", flexDirection: "column", opacity: 1 - prog(t, to, 0.2) }}>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 280, letterSpacing: -14, lineHeight: 0.9, color: C.lime, textShadow: `${SHADOW}, 0 0 60px ${C.lime}55`,
        transform: `scale(${0.8 + 0.2 * pop(t, from, 0.4)})`, transformOrigin: align === "right" ? "100% 60%" : "0 60%" }}>{prefix}{Math.round(value * prog(t, from, 0.9))}</div>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 76, letterSpacing: -3, color: "#fff", textShadow: SHADOW, opacity: prog(t, from + 0.35, 0.3) }}>{label}</div>
      {sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 50, color: C.lime, textShadow: SHADOW, opacity: prog(t, from + 0.8, 0.3) }}>{sub}</div>}
    </div>
  );
};
/** Dos barras que crecen a ritmo distinto (IA vs. personas). */
export const Race: React.FC<{ from: number; to: number; x: number; y: number; w?: number; rows: { at: number; t: string; v: number; color: string; icon?: IconName }[] }> = ({ from, to, x, y, w = 760, rows }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "30px 34px 34px", borderRadius: 24, background: "rgba(11,12,15,.84)", border: `1.5px solid ${C.line}`,
      boxShadow: "0 24px 70px rgba(0,0,0,.5)", opacity: fade(t, from, to), transform: `translateY(${(1 - prog(t, from, 0.4)) * 30}px)` }}>
      {rows.map((r, i) => {
        const g = prog(t, r.at, 2.4) * r.v;
        return (
          <div key={i} style={{ marginTop: i ? 28 : 0, opacity: t < r.at ? 0.25 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: TITLE, fontWeight: 800, fontSize: 40, letterSpacing: -1, color: "#fff", marginBottom: 12 }}>
              {r.icon && <Icon name={r.icon} at={r.at} size={46} color={r.color} />}{r.t}
            </div>
            <div style={{ height: 30, borderRadius: 15, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
              <div style={{ width: `${g * 100}%`, height: "100%", borderRadius: 15, background: r.color, boxShadow: `0 0 26px ${r.color}88` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
/** Burbuja de chat donde se escribe un mensaje; `strikeAt` lo tacha («eso ya no es usar IA»). */
export const ChatMock: React.FC<{ from: number; to: number; x: number; y: number; w?: number; who: string; text: string; typeFrom: number; typeTo: number; strikeAt?: number }> = ({
  from, to, x, y, w = 760, who, text, typeFrom, typeTo, strikeAt,
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const p = pop(t, from, 0.45);
  const n = Math.round(text.length * Math.min(1, Math.max(0, (t - typeFrom) / Math.max(0.2, typeTo - typeFrom))));
  const st = strikeAt !== undefined ? prog(t, strikeAt, 0.35) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, borderRadius: 26, background: "rgba(14,16,21,.94)", border: `1.5px solid ${st > 0.5 ? "rgba(255,90,79,.7)" : C.line}`,
      boxShadow: "0 26px 80px rgba(0,0,0,.55)", opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.22)), transform: `translateY(${(1 - p) * 50}px) rotate(${(1 - p) * 2 - 1}deg)`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", borderBottom: `1.5px solid ${C.line}`, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: st > 0.5 ? C.red : C.lime }} />{who}
      </div>
      <div style={{ padding: "30px 30px 34px", minHeight: 150 }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: TITLE, fontWeight: 600, fontSize: 44, letterSpacing: -1, lineHeight: 1.2, color: st > 0.5 ? "rgba(255,255,255,.5)" : "#fff" }}>
          {text.slice(0, n)}<span style={{ opacity: n < text.length || Math.sin(t * 9) > 0 ? 1 : 0, color: C.lime }}>▍</span>
          {strikeAt !== undefined && <div style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 6, borderRadius: 3, background: C.red, transformOrigin: "left", transform: `scaleX(${st})` }} />}
        </div>
      </div>
    </div>
  );
};
/** Centro con agentes alrededor que se encienden uno por uno. */
export const Hub: React.FC<{ from: number; to: number; cx: number; cy: number; r?: number; title: string[]; titleAt: number; nodes: { at: number; t: string; icon: IconName }[] }> = ({
  from, to, cx, cy, r = 300, title, titleAt, nodes,
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const o = fade(t, from, to);
  const n = nodes.length;
  const P = nodes.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * 1.28 * Math.cos(a), cy + r * 0.92 * Math.sin(a)]; });
  const tp = pop(t, titleAt, 0.5);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {P.map(([x, y], i) => {
          const d = prog(t, nodes[i].at - 0.25, 0.4);
          const pulse = ((t - nodes[i].at) * 0.9) % 1;
          return (
            <g key={i} opacity={t >= nodes[i].at - 0.25 ? 1 : 0}>
              <line x1={cx} y1={cy} x2={cx + (x - cx) * d} y2={cy + (y - cy) * d} stroke={C.lime} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={0.8} />
              {t > nodes[i].at && <circle cx={cx + (x - cx) * pulse} cy={cy + (y - cy) * pulse} r={7} fill={C.lime} />}
            </g>
          );
        })}
      </svg>
      {P.map(([x, y], i) => {
        const p = pop(t, nodes[i].at, 0.45);
        return (
          <div key={i} style={{ position: "absolute", left: x - 150, top: y - 46, width: 300, height: 92, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, borderRadius: 20,
            background: "rgba(11,12,15,.9)", border: `2px solid ${C.lime}`, boxShadow: "0 14px 40px rgba(0,0,0,.5)", opacity: t < nodes[i].at ? 0 : Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})` }}>
            <Icon name={nodes[i].icon} at={nodes[i].at} size={46} />
            <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 36, letterSpacing: -1, color: "#fff" }}>{nodes[i].t}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx - 210, top: cy - 92, width: 420, height: 184, borderRadius: 28, background: C.lime, boxShadow: `0 0 80px ${C.lime}66, 0 20px 60px rgba(0,0,0,.5)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: t < titleAt ? 0 : Math.min(1, tp * 2), transform: `scale(${0.7 + 0.3 * tp})` }}>
        {title.map((l, i) => <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: i ? 62 : 34, letterSpacing: i ? -2.5 : -0.5, lineHeight: 1.02, color: INK }}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
/** Dos columnas que se comparan fila a fila. */
export const Versus: React.FC<{ from: number; to: number; x: number; y: number; w?: number; left: { title: string; at: number; rows: { at: number; t: string }[] }; right: { title: string; at: number; rows: { at: number; t: string }[] } }> = ({
  from, to, x, y, w = 1000, left, right,
}) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const col = (c: typeof left, good: boolean) => (
    <div style={{ flex: 1, padding: "26px 30px 30px", borderRadius: 24, background: good ? "rgba(225,184,90,.14)" : "rgba(11,12,15,.86)", border: `2px solid ${good ? C.lime : "rgba(255,255,255,.14)"}`,
      boxShadow: "0 22px 60px rgba(0,0,0,.5)", opacity: t < c.at ? 0 : prog(t, c.at, 0.3), transform: `translateY(${(1 - pop(t, c.at, 0.45)) * 40}px)`, backdropFilter: "blur(10px)" }}>
      <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: good ? C.lime : C.muted, textTransform: "uppercase", marginBottom: 14 }}>{c.title}</div>
      {c.rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, opacity: t < r.at ? 0.14 : 1, transform: `translateX(${(1 - prog(t, r.at, 0.3)) * 14}px)` }}>
          <Icon name={good ? "check" : "x"} at={r.at} size={40} color={good ? C.lime : C.red} sw={3} />
          <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 42, letterSpacing: -1.2, color: "#fff", whiteSpace: "nowrap" }}>{r.t}</div>
        </div>
      ))}
    </div>
  );
  return <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", gap: 22, opacity: 1 - prog(t, to, 0.22) }}>{col(left, false)}{col(right, true)}</div>;
};
/** Tarjeta de capítulo: número enorme + título, sobre la cámara oscurecida. */
export const Chapter: React.FC<{ from: number; to: number; n: string; tag: string; title: string[]; titleAt?: number }> = ({ from, to, n, tag, title, titleAt = from + 0.25 }) => {
  const t = useT();
  if (!vis(t, from, to)) return null;
  const o = fade(t, from, to, 0.25, 0.25);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,9,12,.9) 0%, rgba(8,9,12,.72) 40%, rgba(8,9,12,.1) 75%)" }} />
      <div style={{ position: "absolute", left: 110, top: 300, fontFamily: TITLE, fontWeight: 900, fontSize: 420, lineHeight: 0.8, letterSpacing: -20, color: "transparent",
        WebkitTextStroke: `4px ${C.lime}`, opacity: 0.9, transform: `translateX(${(1 - prog(t, from, 0.5)) * -60}px)` }}>{n}</div>
      <div style={{ position: "absolute", left: 420, top: 356 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: prog(t, from + 0.1, 0.3) }}>
          <div style={{ width: 54, height: 3, background: C.lime }} />
          <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 5, color: C.lime, textTransform: "uppercase" }}>{tag}</div>
        </div>
        {title.map((l, i) => (
          <div key={i} style={{ fontFamily: i === title.length - 1 && title.length > 1 ? SERIF : TITLE, fontStyle: i === title.length - 1 && title.length > 1 ? "italic" : "normal",
            fontWeight: i === title.length - 1 && title.length > 1 ? 500 : 900, fontSize: 104, letterSpacing: i === title.length - 1 && title.length > 1 ? -1 : -5, lineHeight: 1.08,
            color: i === title.length - 1 && title.length > 1 ? C.lime : "#fff", textShadow: SHADOW, opacity: prog(t, titleAt + i * 0.14, 0.3),
            transform: `translateY(${(1 - prog(t, titleAt + i * 0.14, 0.4)) * 30}px)` }}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
/** Signos sueltos que saltan (¿ ? !). items = [segundo, x, y, giro, tamaño]. */
export const Marks: React.FC<{ to: number; ch?: string; color?: string; items: [number, number, number, number, number][] }> = ({ to, ch = "?", color = C.lime, items }) => {
  const t = useT();
  if (t < items[0][0] - 0.05 || t > to + 0.25) return null;
  const out = 1 - prog(t, to, 0.2);
  return (
    <>
      {items.map(([at, x, y, rot, size], i) => {
        const p = pop(t, at, 0.4);
        return <div key={i} style={{ position: "absolute", left: x, top: y + 8 * Math.sin((t - at) * 4 + i), fontFamily: TITLE, fontWeight: 900, fontSize: size, color,
          textShadow: `${SHADOW}, 0 0 30px ${color}66`, transform: `rotate(${rot}deg) scale(${p})`, opacity: Math.min(1, p * 2) * out }}>{ch}</div>;
      })}
    </>
  );
};
/** Cierre: usuario + botón. */
export const EndTag: React.FC<{ from: number; lines: string[]; button: string }> = ({ from, lines, button }) => {
  const t = useT();
  if (t < from - 0.05) return null;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(90% 80% at 50% 40%, rgba(21,94,239,.22) 0%, rgba(11,12,15,.96) 55%, #08090c 100%)", opacity: prog(t, from, 0.35) }}>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: i ? SERIF : TITLE, fontStyle: i ? "italic" : "normal", fontWeight: i ? 500 : 900, fontSize: i ? 96 : 110, letterSpacing: i ? -1 : -5, color: i ? C.lime : "#fff",
            opacity: prog(t, from + 0.2 + i * 0.15, 0.3), transform: `translateY(${(1 - prog(t, from + 0.2 + i * 0.15, 0.4)) * 30}px)` }}>{l}</div>
        ))}
        <div style={{ marginTop: 50, padding: "22px 44px", borderRadius: 6, background: C.lime, color: INK, fontFamily: TITLE, fontWeight: 800, fontSize: 44, letterSpacing: -1,
          boxShadow: `0 14px 40px -14px ${C.lime}`, transform: `scale(${pop(t, from + 0.7, 0.45) * (1 + 0.025 * Math.sin((t - from) * 6))})` }}>{button}</div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 28, letterSpacing: 5, color: C.muted, opacity: prog(t, from + 1.0, 0.3) }}>{MARCA.handle}</div>
      </div>
    </AbsoluteFill>
  );
};
export const Handle = () => (
  <div style={{ position: "absolute", right: 44, bottom: 28, fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: 3, color: "rgba(255,255,255,.6)", textShadow: SHADOW }}>{MARCA.handle}</div>
);
