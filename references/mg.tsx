// Kit de motion graphics vertical (1080x1920). Copiar a remotion/src/mg.tsx del reel.
// Todo se sincroniza con las palabras: W("palabra") = segundo en que se dice (n-ésima vez con W("palabra", 2)).
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, BODY } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";
import { CAM_FULL, CamKeyV } from "./reel";

export const SHADOW = "0 2px 10px rgba(0,0,0,.75), 0 0 28px rgba(0,0,0,.45)";
export const DROP = "drop-shadow(0 3px 10px rgba(0,0,0,.6))";
export const INK = "#06302E";
const norm = (s: string) => s.toLowerCase().replace(/[.,;:¿?¡!«»"“”…]/g, "");

/** Segundo en que empieza la n-ésima vez que se dice `word` (desde `after` si se indica). */
export const W = (word: string, n = 1, after = 0): number => {
  let k = 0;
  for (const w of WORDS) if (w.s >= after && norm(w.w) === norm(word) && ++k === n) return w.s;
  throw new Error(`No encuentro la palabra «${word}» (#${n}) después de ${after}s`);
};
/** Segundo en que termina esa palabra. */
export const WE = (word: string, n = 1, after = 0): number => {
  let k = 0;
  for (const w of WORDS) if (w.s >= after && norm(w.w) === norm(word) && ++k === n) return w.e;
  throw new Error(`No encuentro la palabra «${word}» (#${n}) después de ${after}s`);
};

// ---------- cámara: un encuadre por toma + acercamientos en los énfasis ----------
/** cuts = segundos de cada cambio de toma; fy = altura de la cara (%) por toma; punches = [segundo, zoom]. */
export const camKeys = (cuts: number[], fy: number[], punches: [number, number][] = [], base: number[] = []): CamKeyV[] => {
  const keys = cuts.map((at, i) => ({ at, box: CAM_FULL, zoom: base[i] ?? (i % 2 ? 1.07 : 1), fy: fy[i] ?? 38 }));
  for (const [at, zoom] of punches) {
    let i = 0;
    while (i + 1 < cuts.length && cuts[i + 1] <= at) i++;
    keys.push({ at, box: CAM_FULL, zoom: zoom * (base[i] ?? 1), fy: fy[i] ?? 38 });
  }
  return keys.sort((a, b) => a.at - b.at);
};

// ---------- subtítulos chicos (1–3 palabras, blancos, sin caja) ----------
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
    if (cur.length >= 3 || end || ((punct || gap) && cur.length >= 2) || !next) {
      out.push({ words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.35) : w.e + 0.5 });
      cur = [];
    }
  });
  return out;
})();
export const Subs: React.FC<{ hide: [number, number][]; y?: number | ((t: number) => number); keywords?: string[]; color?: string }> = ({
  hide, y: yy = 1240, keywords = [], color = C.lime,
}) => {
  const t = useT();
  const y = typeof yy === "function" ? yy(t) : yy;
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch) return null;
  const kw = new Set(keywords.map(norm));
  return (
    <div style={{ position: "absolute", top: y - 40, left: 90, right: 90, textAlign: "center", fontFamily: BODY, fontWeight: 600,
      fontSize: 54, letterSpacing: -0.8, color: "#fff", textShadow: SHADOW, opacity: prog(t, ch.s, 0.1) }}>
      {ch.words.map((w, i) => (
        <span key={i} style={{ color: kw.has(norm(w.w)) ? color : "#fff" }}>{w.w.replace(/[.,]$/, "")}{i < ch.words.length - 1 ? " " : ""}</span>
      ))}
    </div>
  );
};

// ---------- iconos de línea que se dibujan ----------
export type IconName = "box" | "kit" | "toy" | "eye" | "bulb" | "target" | "bookmark" | "chat" | "play" | "list" | "layers"
  | "family" | "alert" | "check" | "x" | "baby" | "clock" | "heart" | "compass" | "star";
const PATHS: Record<IconName, string[]> = {
  box: ["M3 7.5l9-4.5 9 4.5v9L12 21l-9-4.5z", "M3 7.5l9 4.5 9-4.5", "M12 12v9"],
  kit: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  toy: ["M9 3l4.5 7h-9z", "M13.5 12.5h7.5v7.5h-7.5z", "M3.5 16.5a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],
  bulb: ["M12 3a6 6 0 0 0-4 10.5V15h8v-1.5A6 6 0 0 0 12 3z", "M9 18h6", "M10 21h4"],
  target: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"],
  bookmark: ["M6 3h12v18l-6-4.5L6 21z"],
  chat: ["M4 5h16v11H10l-5 4v-4H4z", "M8 9h8", "M8 12h5"],
  play: ["M3 5h18v14H3z", "M10 9l5 3-5 3z"],
  list: ["M4 6h2", "M9 6h11", "M4 12h2", "M9 12h11", "M4 18h2", "M9 18h11"],
  layers: ["M12 3l9 5-9 5-9-5z", "M3 12l9 5 9-5", "M3 16l9 5 9-5"],
  family: ["M5.5 7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0", "M13.5 7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0", "M3 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5", "M11 20c0-4 2-6.5 5-6.5s5 2.5 5 6.5"],
  alert: ["M12 3l10 17H2z", "M12 10v4", "M12 17v.5"],
  check: ["M4 12.5l5 5L20 6.5"],
  x: ["M5 5l14 14", "M19 5L5 19"],
  baby: ["M5 13a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", "M12 6c0-2 2.5-2 2.5-.5", "M9.5 12.5v.5", "M14.5 12.5v.5", "M9.5 16c1.5 1.3 3.5 1.3 5 0"],
  clock: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M12 7v5l3.5 2"],
  heart: ["M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
  compass: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M15.5 8.5l-2 5-5 2 2-5z"],
  star: ["M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z"],
};
export const Icon: React.FC<{ name: IconName; at: number; size?: number; color?: string; fill?: boolean; sw?: number }> = ({
  name, at, size = 108, color = C.lime, fill, sw = 2,
}) => {
  const t = useT();
  const d = prog(t, at, 0.55);
  const lit = prog(t, at + 0.4, 0.3);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
      strokeLinejoin="round" style={{ filter: DROP, transform: `scale(${0.7 + 0.3 * pop(t, at, 0.4)})`, flexShrink: 0 }}>
      {PATHS[name].map((p, i) => (
        <path key={i} d={p} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} fill={fill ? color : "none"} fillOpacity={fill ? lit : 0} />
      ))}
    </svg>
  );
};

// ---------- texto grande animado ----------
export type Line = {
  at: number; t: string; big?: boolean; huge?: boolean; color?: string; icon?: IconName;
  strikeAt?: number; underlineAt?: number; mark?: string; tilt?: number;
};
const fit = (txt: string, max: number, width = 940, hasIcon = false) => Math.min(max, Math.floor((width - (hasIcon ? 130 : 0)) / (txt.length * 0.56)));
/** Bloque de líneas: chica (blanca) / big (gruesa, 118) / huge (hasta 190). `mark` = color de un resaltador detrás del texto. */
export const Kin: React.FC<{ from: number; to: number; lines: Line[]; top?: number; maxHuge?: number }> = ({ from, to, lines, top = 1090, maxHuge = 190 }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const out = 1 - prog(t, to, 0.2);
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: out }}>
      {lines.map((l, i) => {
        const big = l.big || l.huge;
        const fs = big ? fit(l.t, l.huge ? maxHuge : 118, l.huge ? 860 : 940, !!l.icon) : Math.min(54, Math.floor(960 / (l.t.length * 0.5)));
        const h = big ? Math.round(fs * 1.09) : 62;
        if (t < l.at) return <div key={i} style={{ height: h }} />;
        const p = big ? pop(t, l.at, 0.35) : prog(t, l.at, 0.25);
        const st = l.strikeAt !== undefined ? prog(t, l.strikeAt, 0.3) : 0;
        const ul = l.underlineAt !== undefined ? prog(t, l.underlineAt, 0.45) : 0;
        const mk = l.mark ? prog(t, l.at + 0.12, 0.35) : 0;
        const color = l.mark && mk > 0.5 ? INK : st > 0.5 ? "rgba(255,255,255,.6)" : l.color ?? "#fff";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, height: h,
            transform: big ? `rotate(${l.tilt ?? 0}deg) scale(${(l.huge ? 1.5 : 0.8) + (l.huge ? -0.5 : 0.2) * p})` : `translateY(${(1 - p) * 14}px)`,
            opacity: Math.min(1, p * 1.6) }}>
            {l.icon && <Icon name={l.icon} at={l.at} size={Math.min(108, fs)} color={st > 0.5 ? "rgba(255,255,255,.6)" : l.strikeAt !== undefined ? "#fff" : l.color ?? C.lime} />}
            <div style={{ position: "relative", fontFamily: big ? TITLE : BODY, fontWeight: big ? 900 : 600, fontSize: fs, letterSpacing: big ? -fs * 0.03 : -0.8,
              lineHeight: 1, color, textShadow: l.mark && mk > 0.5 ? "none" : big && l.color ? `${SHADOW}, 0 0 44px ${l.color}66` : SHADOW, whiteSpace: "nowrap", isolation: "isolate" }}>
              {l.mark && <span style={{ position: "absolute", left: -16, right: -16, top: big ? -4 : -6, bottom: big ? -8 : -8, background: l.mark, borderRadius: 12,
                transformOrigin: "left", transform: `scaleX(${mk}) skewX(-6deg)`, zIndex: -1, boxShadow: "0 8px 26px rgba(0,0,0,.35)" }} />}
              {l.t}
              {l.strikeAt !== undefined && <div style={{ position: "absolute", left: -8, right: -8, top: "52%", height: Math.max(6, fs * 0.075), borderRadius: 5,
                background: C.violet, transformOrigin: "left", transform: `scaleX(${st})` }} />}
              {l.underlineAt !== undefined && (
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -22, width: "100%", height: 22, filter: DROP }}>
                  <path d="M4 12 C 70 2, 150 18, 296 7" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Signos (¿ ? ! ✕) que saltan alrededor de una zona. items = [segundo, x, y, giro, tamaño]. */
export const Marks: React.FC<{ to: number; ch?: string; color?: string; items: [number, number, number, number, number][] }> = ({ to, ch = "?", color = C.lime, items }) => {
  const t = useT();
  if (t < items[0][0] - 0.05 || t > to + 0.25) return null;
  const out = 1 - prog(t, to, 0.2);
  return (
    <>
      {items.map(([at, x, y, rot, size], i) => {
        const p = pop(t, at, 0.4);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + 8 * Math.sin((t - at) * 4 + i), fontFamily: TITLE, fontWeight: 900, fontSize: size, color,
            textShadow: `${SHADOW}, 0 0 30px ${color}66`, transform: `rotate(${rot}deg) scale(${p})`, opacity: Math.min(1, p * 2) * out }}>{ch}</div>
        );
      })}
    </>
  );
};

/** 1 — 2 — 3 arriba; cada círculo se enciende en su segundo. labels opcionales debajo. */
export const Stepper: React.FC<{ from: number; to: number; steps: number[]; labels?: string[]; y?: number }> = ({ from, to, steps, labels, y = 300 }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const o = prog(t, from, 0.35) * (1 - prog(t, to, 0.25));
  const n = steps.length;
  const X = steps.map((_, i) => 540 + (i - (n - 1) / 2) * 240);
  const fill = steps.slice(1).reduce((a, s) => a + prog(t, s, 0.5) / (n - 1), 0);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, transform: `translateY(${(1 - prog(t, from, 0.4)) * -24}px)` }}>
      <div style={{ position: "absolute", left: X[0], top: y - 4, width: X[n - 1] - X[0], height: 8, borderRadius: 4, background: "rgba(255,255,255,.45)", boxShadow: "0 2px 10px rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: X[0], top: y - 4, width: (X[n - 1] - X[0]) * fill, height: 8, borderRadius: 4, background: C.lime }} />
      {steps.map((at, i) => {
        const on = pop(t, at, 0.4);
        const active = t >= at;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: X[i] - 46, top: y - 46, width: 92, height: 92, borderRadius: 46, background: active ? C.lime : "rgba(20,24,28,.55)",
              border: `5px solid ${active ? C.lime : "rgba(255,255,255,.8)"}`, color: active ? INK : "#fff", fontFamily: TITLE, fontWeight: 900, fontSize: 54, display: "flex",
              alignItems: "center", justifyContent: "center", transform: `scale(${active ? 0.9 + 0.25 * on - 0.15 * prog(t, at + 0.35, 0.3) : 0.9})`, boxShadow: "0 8px 26px rgba(0,0,0,.4)" }}>{i + 1}</div>
            {labels && active && <div style={{ position: "absolute", left: X[i] - 120, width: 240, top: y + 62, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 38,
              color: "#fff", textShadow: SHADOW, opacity: prog(t, at, 0.3) }}>{labels[i]}</div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Fila de personas que van apareciendo. */
export const People: React.FC<{ from: number; to: number; n?: number; top?: number; color?: string }> = ({ from, to, n = 5, top = 1330, color = C.lime }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.2);
  const size = Math.min(104, Math.floor(900 / n) - 14);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        const p = pop(t, from + i * (0.6 / n), 0.4);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ filter: DROP, transform: `translateY(${(1 - p) * 30}px) scale(${p})`, opacity: Math.min(1, p * 2) }}>
            <circle cx={12} cy={7.5} r={4} fill={color} />
            <path d="M4 21c0-4.6 3.6-7.5 8-7.5s8 2.9 8 7.5z" fill={color} />
          </svg>
        );
      })}
    </div>
  );
};

/** Número que sube + etiqueta (cifras que la persona dice en cámara). */
export const BigNumber: React.FC<{ from: number; to: number; value: number; prefix?: string; label: string; sub?: string; top?: number; color?: string }> = ({
  from, to, value, prefix = "", label, sub, top = 1040, color = C.lime,
}) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.2);
  const p = prog(t, from, 0.9);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 230, letterSpacing: -9, lineHeight: 0.95, color, textShadow: `${SHADOW}, 0 0 50px ${color}66`,
        transform: `scale(${0.8 + 0.2 * pop(t, from, 0.4)})` }}>{prefix}{Math.round(value * p)}</div>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 84, letterSpacing: -2.5, color: "#fff", textShadow: SHADOW, opacity: prog(t, from + 0.35, 0.3) }}>{label}</div>
      {sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 50, color: "#fff", textShadow: SHADOW, marginTop: 8, opacity: prog(t, from + 0.8, 0.3) }}>{sub}</div>}
    </div>
  );
};

/** Tarjeta blanca con una cita dicha en cámara; cada línea entra en su segundo. */
export const QuoteCard: React.FC<{ from: number; to: number; who: string; lines: { at: number; t: string }[]; top?: number }> = ({ from, to, who, lines, top = 1010 }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.25));
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, padding: "44px 48px 40px", borderRadius: 40, background: "#F6F4F1", boxShadow: "0 24px 70px rgba(0,0,0,.45)",
      transform: `translateY(${(1 - p) * 50}px) rotate(${(1 - p) * -3 - 1}deg)`, opacity: o }}>
      <div style={{ position: "absolute", top: -46, left: 36, width: 92, height: 92, borderRadius: 46, background: C.violet, color: "#fff", fontFamily: TITLE, fontWeight: 900,
        fontSize: 120, lineHeight: "128px", textAlign: "center", boxShadow: "0 10px 26px rgba(0,0,0,.3)" }}>“</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 56, lineHeight: 1.16, letterSpacing: -1.4, color: "#15181C",
          opacity: 0.18 + 0.82 * prog(t, l.at, 0.25), transform: `translateX(${(1 - prog(t, l.at, 0.3)) * 10}px)` }}>{l.t}</div>
      ))}
      <div style={{ marginTop: 18, fontFamily: BODY, fontWeight: 600, fontSize: 36, color: "#6B7078" }}>{who}</div>
    </div>
  );
};

/** Dos o tres cajas unidas por flechas que se dibujan (A → B). */
export const Flow: React.FC<{ from: number; to: number; items: { at: number; t: string; icon?: IconName }[]; top?: number }> = ({ from, to, items, top = 1050 }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.2);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: o }}>
      {items.map((it, i) => {
        const p = pop(t, it.at, 0.4);
        const first = i === 0;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={60} height={70} viewBox="0 0 60 70" style={{ filter: DROP, opacity: t >= it.at - 0.3 ? 1 : 0 }}>
                <path d="M30 4v54M12 42l18 18 18-18" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
                  strokeDasharray={1} strokeDashoffset={1 - prog(t, it.at - 0.3, 0.35)} />
              </svg>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 40px", borderRadius: 30, background: first ? C.lime : "rgba(18,22,26,.72)",
              border: first ? "none" : "4px solid rgba(255,255,255,.85)", color: first ? INK : "#fff", fontFamily: TITLE, fontWeight: 900, fontSize: 76, letterSpacing: -2.2,
              boxShadow: "0 12px 34px rgba(0,0,0,.4)", transform: `scale(${0.75 + 0.25 * p})`, opacity: Math.min(1, p * 2) }}>
              {it.icon && <Icon name={it.icon} at={it.at} size={78} color={first ? INK : "#fff"} sw={2.4} />}
              {it.t}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Ventana de video genérica (sin marca) que entra flotando: para «lo ven en un video en casa». */
export const PlayerMock: React.FC<{ from: number; to: number; top?: number; label?: string }> = ({ from, to, top = 300, label }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.5);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.25));
  const bar = Math.min(1, Math.max(0, (t - from) / Math.max(0.5, to - from)));
  return (
    <div style={{ position: "absolute", top, left: 150, width: 780, height: 470, borderRadius: 34, background: "#14171B", border: "4px solid rgba(255,255,255,.18)",
      boxShadow: "0 30px 80px rgba(0,0,0,.55)", transform: `rotate(${-4 + 2 * Math.sin(t * 1.3)}deg) translateY(${(1 - p) * -60}px) scale(${0.85 + 0.15 * p})`, opacity: o, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#2A2F36,#191C21)" }} />
      <div style={{ position: "absolute", left: 330, top: 150, width: 120, height: 120, borderRadius: 60, background: C.violet, display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${1 + 0.06 * Math.sin(t * 6)})` }}>
        <div style={{ width: 0, height: 0, borderLeft: "44px solid #fff", borderTop: "28px solid transparent", borderBottom: "28px solid transparent", marginLeft: 12 }} />
      </div>
      {label && <div style={{ position: "absolute", left: 34, top: 30, right: 34, fontFamily: BODY, fontWeight: 600, fontSize: 40, color: "#fff" }}>{label}</div>}
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 38, height: 12, borderRadius: 6, background: "rgba(255,255,255,.25)" }}>
        <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 6, background: C.violet }} />
      </div>
    </div>
  );
};

// ---------- cierre de anuncio ----------
/** Botón que late mientras se dice el llamado a la acción (anuncios: sin palabra clave). */
export const TapButton: React.FC<{ from: number; to: number; text?: string; top?: number }> = ({ from, to, text = "Toca el botón de abajo", top = 1330 }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.4);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.2));
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: o }}>
      <div style={{ padding: "26px 54px", borderRadius: 90, background: C.lime, color: INK, fontFamily: TITLE, fontWeight: 900, fontSize: 64, letterSpacing: -1.8,
        boxShadow: `0 14px 40px rgba(0,0,0,.4), 0 0 50px ${C.lime}55`, transform: `scale(${(0.7 + 0.3 * p) * (1 + 0.035 * Math.sin((t - from) * 7))})` }}>{text}</div>
      <Chevrons color={C.lime} />
    </div>
  );
};
export const Chevrons: React.FC<{ color?: string; size?: number }> = ({ color = "#fff", size = 84 }) => {
  const t = useT();
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 24 29" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ filter: DROP }}>
      {[0, 1, 2].map((i) => <path key={i} d={`M5 ${4 + i * 8}l7 7 7-7`} opacity={0.25 + 0.75 * Math.max(0, Math.sin(t * 7 - i * 1.1))} />)}
    </svg>
  );
};
/** Tarjeta final oscura: etiqueta + nombre + botón. Empieza cuando termina el habla. Solo datos verificados. */
export const EndCard: React.FC<{ from: number; tag: string; title: string[]; button: string }> = ({ from, tag, title, button }) => {
  const t = useT();
  if (t < from - 0.05) return null;
  const o = prog(t, from, 0.3);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 38%, ${C.cardSolid} 0%, ${C.bg} 70%)`, opacity: o }}>
      <div style={{ position: "absolute", top: 520, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ padding: "12px 30px", borderRadius: 40, border: `3px solid ${C.violet}`, color: C.violet, fontFamily: BODY, fontWeight: 600, fontSize: 44, letterSpacing: 1,
          transform: `translateY(${(1 - prog(t, from + 0.1, 0.4)) * 24}px)`, opacity: prog(t, from + 0.1, 0.3) }}>{tag}</div>
        <div style={{ textAlign: "center" }}>
          {title.map((l, i) => (
            <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: fit(l, 104, 920), letterSpacing: -3, lineHeight: 1.06, color: i === 0 ? C.lime : "#fff",
              transform: `translateY(${(1 - prog(t, from + 0.25 + i * 0.12, 0.4)) * 30}px)`, opacity: prog(t, from + 0.25 + i * 0.12, 0.3) }}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: "30px 64px", borderRadius: 90, background: C.lime, color: INK, fontFamily: TITLE, fontWeight: 900, fontSize: 66, letterSpacing: -1.8,
          boxShadow: `0 0 60px ${C.lime}55`, transform: `scale(${pop(t, from + 0.7, 0.45) * (1 + 0.03 * Math.sin((t - from) * 7))})` }}>{button}</div>
        <div style={{ opacity: prog(t, from + 1.0, 0.3) }}><Chevrons color={C.lime} size={100} /></div>
      </div>
    </AbsoluteFill>
  );
};

/** Destello corto en cada cambio de toma. */
export const Flash: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const t = useT();
  const c = cuts.find((x) => x > 0 && t >= x && t < x + 0.14);
  if (c === undefined) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: 0.2 * (1 - (t - c) / 0.14) }} />;
};
export const Shade: React.FC<{ top?: boolean }> = ({ top }) => (
  <AbsoluteFill style={{ background: top
    ? "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.22) 22%, rgba(0,0,0,0) 36%)"
    : "linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(0,0,0,.28) 66%, rgba(0,0,0,.34) 100%)" }} />
);
/** Barra fina de avance arriba. NO usar por defecto: solo si la persona la pide. */
export const Progress: React.FC<{ total: number }> = ({ total }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", top: 206, left: 60, right: 60, height: 7, borderRadius: 4, background: "rgba(255,255,255,.28)" }}>
      <div style={{ width: `${Math.min(1, t / total) * 100}%`, height: "100%", borderRadius: 4, background: C.lime }} />
    </div>
  );
};

// ---------- la cara manda: nada de texto sobre la boca ----------
export type Face = { at: number; top: number; bottom: number; cx: number };
const keyAt = (keys: CamKeyV[], t: number) => { let i = 0; while (i + 1 < keys.length && keys[i + 1].at <= t) i++; return keys[i]; };
const faceAt = (faces: Face[], t: number) => { let i = 0; while (i + 1 < faces.length && faces[i + 1].at <= t) i++; return faces[i]; };
/** y del mentón en pantalla en el segundo t (cuenta el zoom de la cámara). FACES sale de scripts/caras.py. */
export const chinAt = (faces: Face[], keys: CamKeyV[]) => (t: number) => {
  const k = keyAt(keys, t), f = faceAt(faces, t), oy = 1920 * (k.fy ?? 44) / 100;
  return oy + (f.bottom - oy) * (k.zoom ?? 1) * 1.012;
};
/** top para un bloque de texto: debajo del mentón (+gap), sin salirse de la zona segura. Usar el segundo del énfasis más fuerte del bloque. */
export const under = (faces: Face[], keys: CamKeyV[], gap = 80, min = 1040, max = 1300) => (t: number, t2?: number) =>
  Math.round(Math.min(max, Math.max(min, Math.max(chinAt(faces, keys)(t), t2 === undefined ? 0 : chinAt(faces, keys)(t2)) + gap)));
/** y de la coronilla en pantalla (para poner texto DETRÁS a la altura de la cabeza). */
export const headAt = (faces: Face[], keys: CamKeyV[]) => (t: number) => {
  const k = keyAt(keys, t), f = faceAt(faces, t), oy = 1920 * (k.fy ?? 44) / 100;
  return oy + (f.top - (f.bottom - f.top) * 0.28 - oy) * (k.zoom ?? 1);
};

// ---------- cámara con capa DETRÁS de la persona ----------
export type FgRange = { from: number; to: number; src: string };
/**
 * Igual que CamV (cámara completa con zoom por corte seco) pero con tres capas: video → `behind` → persona recortada.
 * fg = tramos recortados con scripts/matte.py (public/fg_N.webm); fuera de esos tramos `behind` no se muestra.
 * Lo que va en `behind` usa coordenadas de pantalla (no se agranda con el zoom).
 */
export const CamBehind: React.FC<{ keys: CamKeyV[]; until: number; fg: FgRange[]; behind: React.ReactNode; filter?: string }> = ({ keys, until, fg, behind, filter }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const k = keyAt(keys, t);
  const drift = 1.012 + 0.012 * Math.sin(t * 0.4); // nunca baja de 1: con zoom 1 dejaba ver bordes negros
  const st: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", transform: `scale(${(k.zoom ?? 1) * drift})`, transformOrigin: `50% ${k.fy ?? 44}%` };
  const on = fg.find((r) => t >= r.from && t < r.to);
  return (
    <>
      <Sequence durationInFrames={Math.ceil(until * fps)}>
        <AbsoluteFill style={{ filter }}><OffthreadVideo src={staticFile("cam.mp4")} style={st} /></AbsoluteFill>
      </Sequence>
      {on && behind}
      {fg.map((r, i) => (
        <Sequence key={i} from={Math.round(r.from * fps)} durationInFrames={Math.max(1, Math.round((r.to - r.from) * fps))}>
          <AbsoluteFill style={{ filter }}><OffthreadVideo muted transparent src={staticFile(r.src)} style={st} /></AbsoluteFill>
        </Sequence>
      ))}
    </>
  );
};
/** Texto enorme para la capa de atrás: cada línea entra en su segundo. Queda tapado en parte por la cabeza: 1–2 palabras por línea. */
export const BehindText: React.FC<{ from: number; to: number; top: number; lines: { at: number; t: string; color?: string; outline?: boolean }[]; size?: number }> = ({
  from, to, top, lines, size = 300,
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = 1 - prog(t, to - 0.18, 0.18);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      {lines.map((l, i) => {
        const fs = Math.min(size, Math.floor(980 / (l.t.length * 0.7)));
        const p = pop(t, l.at, 0.45);
        const col = l.color ?? "#fff";
        return (
          <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: fs, lineHeight: 0.92, letterSpacing: -fs * 0.04, textTransform: "uppercase", whiteSpace: "nowrap",
            color: l.outline ? "transparent" : col, WebkitTextStroke: l.outline ? `${Math.max(4, fs * 0.022)}px ${col}` : undefined,
            textShadow: l.outline ? "none" : "0 6px 30px rgba(0,0,0,.35)", opacity: t < l.at ? 0 : Math.min(1, p * 1.8),
            transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})` }}>{l.t}</div>
        );
      })}
    </div>
  );
};

// ---------- tomas de apoyo ----------
/** Foto o clip flotando sobre la cámara (cámara completa con inserts): entra girada y se asienta. src en public/broll/. */
export const Broll: React.FC<{ from: number; to: number; src: string; x: number; y: number; w: number; h: number; rot?: number; start?: number; label?: string }> = ({
  from, to, src, x, y, w, h, rot = -3, start = 0, label,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.5);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.22));
  const isVideo = /\.(mp4|mov|webm)$/i.test(src);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30, overflow: "hidden", border: "6px solid #fff", background: "#111",
      boxShadow: "0 26px 70px rgba(0,0,0,.5)", opacity: o, transform: `rotate(${rot * (0.4 + 0.6 * p) + 0.6 * Math.sin(t * 1.4)}deg) translateY(${(1 - p) * 70}px) scale(${0.82 + 0.18 * p})` }}>
      {isVideo
        ? <Sequence from={Math.round(from * fps)} layout="none"><OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(start * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Sequence>
        : <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.05 * Math.min(1, (t - from) / Math.max(0.5, to - from))})` }} />}
      {label && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 24px 16px", background: "linear-gradient(180deg,transparent,rgba(0,0,0,.75))",
        fontFamily: BODY, fontWeight: 600, fontSize: 34, color: "#fff" }}>{label}</div>}
    </div>
  );
};
/** Imagen suelta (PNG/WebP con transparencia) flotando con sombra: mockups, logos, recortes. */
export const Float: React.FC<{ from: number; to: number; src: string; x: number; y: number; w: number; rot?: number }> = ({ from, to, src, x, y, w, rot = -2 }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.55);
  return (
    <Img src={staticFile(src)} style={{ position: "absolute", left: x, top: y + 10 * Math.sin((t - from) * 1.6), width: w, filter: "drop-shadow(0 26px 40px rgba(0,0,0,.5))",
      opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.22)), transform: `rotate(${rot * (1 - p)}deg) translateY(${(1 - p) * 80}px) scale(${0.8 + 0.2 * p})` }} />
  );
};

// ---------- más piezas ----------
/** «2 de cada 3»: `total` personas, las primeras `on` en color y el resto apagadas. */
export const Ratio: React.FC<{ from: number; to: number; total: number; on: number; top: number; color?: string; size?: number; onAt?: number }> = ({
  from, to, total, on, top, color = C.lime, size = 150, onAt,
}) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.2);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26, opacity: o }}>
      {Array.from({ length: total }).map((_, i) => {
        const p = pop(t, from + i * 0.14, 0.42);
        const lit = i < on ? prog(t, (onAt ?? from + 0.5) + i * 0.12, 0.25) : 0;
        const fill = lit > 0.5 ? color : "rgba(255,255,255,.28)";
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ filter: DROP, transform: `translateY(${(1 - p) * 40}px) scale(${p * (1 + 0.12 * lit * (1 - prog(t, (onAt ?? from + 0.5) + 0.3 + i * 0.12, 0.3)))})`, opacity: Math.min(1, p * 2) }}>
            <circle cx={12} cy={7.5} r={4} fill={fill} stroke="#fff" strokeWidth={lit > 0.5 ? 0 : 0.8} />
            <path d="M4 21c0-4.6 3.6-7.5 8-7.5s8 2.9 8 7.5z" fill={fill} stroke="#fff" strokeWidth={lit > 0.5 ? 0 : 0.8} />
          </svg>
        );
      })}
    </div>
  );
};
/** Reloj con la aguja girando rápido («completar el tiempo»). */
export const SpinClock: React.FC<{ from: number; to: number; x: number; y: number; size?: number; color?: string }> = ({ from, to, x, y, size = 260, color = "#fff" }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.45);
  const a = (t - from) * 300;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"
      style={{ position: "absolute", left: x, top: y, filter: DROP, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.2)), transform: `scale(${0.6 + 0.4 * p})` }}>
      <circle cx={12} cy={12} r={9.5} fill="rgba(10,14,16,.45)" />
      {[0, 90, 180, 270].map((d) => <path key={d} d="M12 3.6v1.6" transform={`rotate(${d} 12 12)`} />)}
      <path d="M12 12V6.5" stroke={C.violet} strokeWidth={2.2} transform={`rotate(${a} 12 12)`} />
      <path d="M12 12h3.6" transform={`rotate(${a / 12} 12 12)`} />
      <circle cx={12} cy={12} r={1} fill={color} />
    </svg>
  );
};
/** Globos de pregunta que van saliendo. items = [segundo, x, y, tamaño, haciaLaIzquierda?]. */
export const Bubbles: React.FC<{ to: number; items: [number, number, number, number, boolean?][]; ch?: string; color?: string }> = ({ to, items, ch = "?", color = "#fff" }) => {
  const t = useT();
  if (t < items[0][0] - 0.05 || t > to + 0.25) return null;
  const out = 1 - prog(t, to, 0.2);
  return (
    <>
      {items.map(([at, x, y, size, flip], i) => {
        const p = pop(t, at, 0.45);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + 7 * Math.sin((t - at) * 3 + i), width: size, height: size, opacity: Math.min(1, p * 2) * out,
            transform: `scale(${p}) rotate(${(flip ? 6 : -6)}deg)`, filter: DROP }}>
            <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", transform: flip ? "scaleX(-1)" : undefined }}>
              <path d="M3 4h18v12.5H11l-5.5 4.5v-4.5H3z" fill={color} />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: size * 0.1, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: size * 0.5, lineHeight: 1, color: INK }}>{ch}</div>
          </div>
        );
      })}
    </>
  );
};
/** Tarjeta blanca con lista (gráfico claro). Cada fila entra en su segundo; `strikeAt` la tacha. */
export const ListCard: React.FC<{ from: number; to: number; top: number; title: string; rows: { at: number; t: string; strikeAt?: number }[]; tag?: string }> = ({ from, to, top, title, rows, tag }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  return (
    <div style={{ position: "absolute", top, left: 90, right: 90, padding: "36px 42px 38px", borderRadius: 38, background: "#F6F4F1", boxShadow: "0 24px 70px rgba(0,0,0,.45)",
      transform: `translateY(${(1 - p) * -50}px) rotate(${(1 - p) * 3 + 1}deg)`, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)) }}>
      {tag && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, letterSpacing: 2, color: "#8A8F96", textTransform: "uppercase", marginBottom: 8 }}>{tag}</div>}
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 60, letterSpacing: -1.8, lineHeight: 1.05, color: "#15181C", marginBottom: 22 }}>{title}</div>
      {rows.map((r, i) => {
        const rp = prog(t, r.at, 0.3);
        const st = r.strikeAt !== undefined ? prog(t, r.strikeAt, 0.3) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14, opacity: t < r.at ? 0.12 : 1, transform: `translateX(${(1 - rp) * 16}px)` }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, border: "5px solid #15181C", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: st > 0.5 ? C.violet : t >= r.at ? "#15181C" : "transparent" }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                {st > 0.5 ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 12.5l5 5L20 6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rp} />}
              </svg>
            </div>
            <div style={{ position: "relative", fontFamily: TITLE, fontWeight: 800, fontSize: 50, letterSpacing: -1.2, color: st > 0.5 ? "#9A9FA6" : "#15181C" }}>
              {r.t}
              {r.strikeAt !== undefined && <div style={{ position: "absolute", left: -4, right: -4, top: "54%", height: 6, borderRadius: 3, background: C.violet, transformOrigin: "left", transform: `scaleX(${st})` }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
/** Icono grande con una X encima que se dibuja en `xAt` («sin objetivo»). */
export const Crossed: React.FC<{ from: number; to: number; icon: IconName; x: number; y: number; size?: number; xAt: number }> = ({ from, to, icon, x, y, size = 240, xAt }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const d = prog(t, xAt, 0.3);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: 1 - prog(t, to, 0.2) }}>
      <Icon name={icon} at={from} size={size} color="#fff" sw={1.6} />
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.violet} strokeWidth={3} strokeLinecap="round" style={{ position: "absolute", left: 0, top: 0, filter: DROP }}>
        <path d="M4 4l16 16" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
        <path d="M20 4L4 20" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, xAt + 0.15, 0.3)} />
      </svg>
    </div>
  );
};
