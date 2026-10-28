// Piezas del menú de efectos (references/menu-efectos.md). Probadas en un reel vertical 1080×1920 (anuncio BBE v2).
// Copiar a remotion/src/fx.tsx del reel. Funciona solo (trae sus iconos); BehindText y los subtítulos están en mg.tsx si lo tienes.
//
// Necesita en theme.ts, además de C / TITLE / BODY:
//   import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
//   import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
//   export const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["800", "900"], subsets: ["latin"] });
//   export const { fontFamily: TYPE } = loadCourier("normal", { weights: ["700"], subsets: ["latin"] });
// Lo que va DETRÁS de la persona usa las máscaras de scripts/mascaras.py (public/m/00000.png… y src/mascaras.ts).
//
// Cam2 = cámara → `behind` → persona recortada. Además: zoom-through (zt), vertigo y frame break (shrink).
// Capa de atrás: CoverStory, PaperWall, ThumbWall, WhiteOut, Orbit layer="back".
// Capa de adelante: GlassChecklist, FocusWord, ChatTestimonio, Orbit layer="front".
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C, TITLE, BODY, SERIF, TYPE } from "./theme";
import { useT, prog, pop } from "./lib";
import { CamKeyV } from "./reel";
import { WORDS } from "./words";
import { ULTIMA_MASCARA as LAST_MASK } from "./mascaras";

export const SHADOW = "0 2px 10px rgba(0,0,0,.75), 0 0 28px rgba(0,0,0,.45)";
export const DROP = "drop-shadow(0 3px 10px rgba(0,0,0,.6))";
export const INK = "#06302E";

// ---------- iconos de línea que se dibujan (los mismos del kit mg.tsx; aquí para que este archivo funcione solo) ----------
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

const keyAt = (keys: CamKeyV[], t: number) => { let i = 0; while (i + 1 < keys.length && keys[i + 1].at <= t) i++; return keys[i]; };
const inR = (t: number, r: [number, number][]) => r.some(([a, b]) => t >= a && t < b);


export type Shrink = { from: number; s: number };
/**
 * Cámara: video → `behind` → persona recortada (máscara) → resto.
 * zt = cortes con zoom-through (la cámara atraviesa la toma); vertigo = [desde, hasta, cuánto] (solo el fondo crece);
 * shrink = el plano se encoge a un marco y la persona se sale del borde (frame break).
 */
export const Cam2: React.FC<{ keys: CamKeyV[]; until: number; on: [number, number][]; behind: React.ReactNode; zt?: number[]; vertigo?: [number, number, number][]; shrink?: Shrink }> = ({
  keys, until, on, behind, zt = [], vertigo = [], shrink,
}) => {
  const t = useT();
  const f = useCurrentFrame();
  const k = keyAt(keys, t);
  const drift = 1.012 + 0.012 * Math.sin(t * 0.4);
  // zoom-through
  let zs = 1, blur = 0;
  for (const c of zt) {
    if (t >= c - 0.22 && t < c) { const p = (t - (c - 0.22)) / 0.22; zs = 1 + 2.6 * p * p; blur = 14 * p; }
    if (t >= c && t < c + 0.22) { const p = 1 - (t - c) / 0.22; zs = 1 + 1.3 * p * p; blur = 10 * p; }
  }
  let vz = 1;
  for (const [a, b, amt] of vertigo) if (t >= a && t < b + 0.3) vz = 1 + amt * prog(t, a, b - a);
  const sh = shrink && t >= shrink.from ? 1 - (1 - shrink.s) * prog(t, shrink.from, 0.5) : 1;
  const shrinking = shrink && t >= shrink.from;
  const showFg = inR(t, on) || shrinking || vertigo.some(([a, b]) => t >= a && t < b + 0.3);
  const base: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", objectFit: "cover", transformOrigin: `50% ${k.fy ?? 40}%` };
  const camSt: React.CSSProperties = { ...base, transform: `scale(${(k.zoom ?? 1) * drift * vz})` };
  const fgSt: React.CSSProperties = { ...base, transform: `scale(${(k.zoom ?? 1) * drift})` };
  const mf = Math.min(LAST_MASK, f);
  const mask = staticFile(`m/${String(mf).padStart(5, "0")}.png`);
  const cp = shrinking ? prog(t, shrink!.from, 0.5) : 0;
  if (t >= until) return null;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 30%, #12383A 0%, #081315 70%)" }}>
      <AbsoluteFill style={{ transform: `scale(${sh})`, transformOrigin: "50% 62%" }}>
        <AbsoluteFill style={{ transform: `scale(${zs})`, transformOrigin: "50% 68%", filter: blur ? `blur(${blur}px)` : undefined }}>
          <AbsoluteFill style={{ clipPath: cp ? `inset(${4 * cp}% ${7 * cp}% ${3 * cp}% ${7 * cp}% round ${48 * cp}px)` : undefined }}>
            <OffthreadVideo src={staticFile("cam.mp4")} style={camSt} />
          </AbsoluteFill>
          {inR(t, on) && behind}
          {showFg && (
            <>
              <Img src={mask} style={{ display: "none" }} />
              <OffthreadVideo muted src={staticFile("cam.mp4")} style={{ ...fgSt, WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" } as React.CSSProperties} />
            </>
          )}
        </AbsoluteFill>
        {shrinking && <ReelChrome p={cp} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Iconos de reel genéricos (sin marca) en el borde derecho del marco encogido. */
const ReelChrome: React.FC<{ p: number }> = ({ p }) => {
  const t = useT();
  const ic = (d: string, y: number, fill = false) => (
    <svg width={86} height={86} viewBox="0 0 24 24" fill={fill ? "#fff" : "none"} stroke="#fff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      style={{ position: "absolute", right: 7 * 10.8 + 30, top: y, filter: DROP, opacity: p }}><path d={d} /></svg>
  );
  return (
    <>
      {ic("M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z", 1080, true)}
      {ic("M4 5h16v11H10l-5 4v-4H4z", 1210)}
      {ic("M21 3L3 10l7 3 3 7z", 1340)}
      <div style={{ position: "absolute", left: 7 * 10.8 + 40, right: 7 * 10.8 + 40, top: 1920 * 0.97 - 30, height: 6, borderRadius: 3, background: "rgba(255,255,255,.35)", opacity: p }}>
        <div style={{ width: `${Math.min(100, 40 + (t % 10) * 6)}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
      </div>
    </>
  );
};

/** Portada de revista: título serif gigante detrás de la cabeza + marco fino. */
export const CoverStory: React.FC<{ from: number; to: number; top: number; lines: { at: number; t: string; color?: string }[]; size?: number; kicker?: string }> = ({
  from, to, top, lines, size = 250, kicker,
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = 1 - prog(t, to - 0.18, 0.18);
  const fp = prog(t, from, 0.45);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", inset: 34, border: `3px solid rgba(255,255,255,${0.85 * fp})`, borderRadius: 6 }} />
      {kicker && <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 34, letterSpacing: 10,
        color: "#fff", opacity: fp, textShadow: SHADOW }}>{kicker}</div>}
      <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lines.map((l, i) => {
          const fs = Math.min(size, Math.floor(1000 / (l.t.length * 0.68)));
          const p = pop(t, l.at, 0.5);
          return (
            <div key={i} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: fs, lineHeight: 0.9, letterSpacing: -fs * 0.03, textTransform: "uppercase", whiteSpace: "nowrap",
              color: l.color ?? "#fff", textShadow: "0 8px 40px rgba(0,0,0,.35)", opacity: t < l.at ? 0 : Math.min(1, p * 1.8), transform: `translateY(${(1 - p) * 90}px)` }}>{l.t}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Notas de papel pegadas en la pared (detrás de la persona), una por una. */
export const PaperWall: React.FC<{ to: number; notes: { at: number; t: string; x: number; y: number; rot: number; w?: number; tape?: string }[] }> = ({ to, notes }) => {
  const t = useT();
  if (t < notes[0].at - 0.05 || t > to) return null;
  const o = 1 - prog(t, to - 0.18, 0.18);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {notes.map((n, i) => {
        const p = pop(t, n.at, 0.4);
        if (t < n.at) return null;
        return (
          <div key={i} style={{ position: "absolute", left: n.x, top: n.y, width: n.w ?? 360, padding: "34px 30px 30px", background: "#FBF7EE", boxShadow: "0 18px 40px rgba(0,0,0,.35)",
            transform: `rotate(${n.rot}deg) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2), fontFamily: TYPE, fontWeight: 700, fontSize: 48, lineHeight: 1.05, color: "#1C2120", textAlign: "center" }}>
            <div style={{ position: "absolute", top: -18, left: "50%", width: 120, height: 36, marginLeft: -60, background: n.tape ?? `${C.lime}AA`, transform: "rotate(-4deg)" }} />
            {n.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Pared de miniaturas de video genéricas (detrás de la persona), apareciendo una tras otra. */
export const ThumbWall: React.FC<{ from: number; to: number; step?: number; cols?: number; rows?: number; top?: number }> = ({ from, to, step = 0.12, cols = 3, rows = 4, top = 60 }) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = 1 - prog(t, to - 0.18, 0.18);
  const W = 300, H = 210, G = 28;
  const left = (1080 - cols * W - (cols - 1) * G) / 2;
  const hues = ["#F8C8C0", "#BFE6E3", "#F6E3A8", "#CFC7F2", "#F5B9C8", "#B9DCF5"];
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {cells.map(({ r, c }, i) => {
        const at = from + i * step;
        const p = pop(t, at, 0.35);
        if (t < at) return null;
        return (
          <div key={i} style={{ position: "absolute", left: left + c * (W + G), top: top + r * (H + G), width: W, height: H, borderRadius: 22, overflow: "hidden",
            background: `linear-gradient(135deg, ${hues[i % hues.length]}, ${hues[(i + 2) % hues.length]})`, boxShadow: "0 12px 30px rgba(0,0,0,.3)",
            transform: `scale(${p}) rotate(${((i * 37) % 7) - 3}deg)`, opacity: Math.min(1, p * 2) }}>
            <div style={{ position: "absolute", left: W / 2 - 34, top: H / 2 - 40, width: 68, height: 68, borderRadius: 34, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 0, height: 0, borderLeft: "24px solid #fff", borderTop: "15px solid transparent", borderBottom: "15px solid transparent", marginLeft: 6 }} />
            </div>
            <div style={{ position: "absolute", left: 16, bottom: 12, fontFamily: BODY, fontWeight: 700, fontSize: 26, color: "rgba(0,0,0,.6)" }}>Actividad {i + 1}</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "rgba(0,0,0,.15)" }}><div style={{ width: `${30 + ((i * 23) % 60)}%`, height: "100%", background: "#E5484D" }} /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** El fondo se queda en blanco (la persona sigue delante) con un texto hueco gigante. */
export const WhiteOut: React.FC<{ from: number; to: number; word: string; top: number }> = ({ from, to, word, top }) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = prog(t, from, 0.25) * (1 - prog(t, to - 0.2, 0.2));
  const fs = Math.min(300, Math.floor(1000 / (word.length * 0.66)));
  return (
    <AbsoluteFill style={{ background: "#F7F7F5", opacity: o }}>
      <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: fs, lineHeight: 0.9, letterSpacing: -fs * 0.04,
        textTransform: "uppercase", color: "transparent", WebkitTextStroke: "5px #C9CCCB", transform: `translateY(${(1 - prog(t, from, 0.5)) * 40}px)` }}>{word}</div>
    </AbsoluteFill>
  );
};

/** Chips girando alrededor de la persona: los de atrás van en la capa `back`, los de adelante en `front`. */
type Orb = { t: string; icon: IconName; at: number };
export const Orbit: React.FC<{ from: number; to: number; items: Orb[]; layer: "back" | "front"; cy?: number; rx?: number; ry?: number }> = ({
  from, to, items, layer, cy = 640, rx = 330, ry = 120,
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const o = prog(t, from, 0.3) * (1 - prog(t, to - 0.2, 0.2));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {items.map((it, i) => {
        const th = (i / items.length) * Math.PI * 2 + (t - from) * 1.1;
        const z = Math.sin(th);
        if ((layer === "back") !== (z < 0)) return null;
        if (t < it.at) return null;
        const p = pop(t, it.at, 0.4);
        const s = (0.8 + 0.25 * z) * p;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + rx * Math.cos(th), top: cy + ry * z, transform: `translate(-50%,-50%) scale(${s})`,
            display: "flex", alignItems: "center", gap: 16, padding: "18px 34px", borderRadius: 60, background: z < 0 ? "rgba(255,255,255,.9)" : "#fff",
            boxShadow: "0 14px 36px rgba(0,0,0,.35)", fontFamily: TITLE, fontWeight: 900, fontSize: it.t.length > 12 ? 46 : 58, letterSpacing: -1.5, color: INK, whiteSpace: "nowrap" }}>
            <Icon name={it.icon} at={it.at} size={62} color="#0E8F88" sw={2.4} />{it.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Checklist de vidrio: «Tu sesión · n de 3», cada fila se marca al decirla. */
export const GlassChecklist: React.FC<{ from: number; to: number; top: number; title: string; rows: { at: number; t: string; sub?: string }[] }> = ({ from, to, top, title, rows }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  const done = rows.filter((r) => t >= r.at).length;
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, padding: "30px 38px 34px", borderRadius: 40, background: "rgba(12,22,24,.62)", backdropFilter: "blur(18px)",
      border: "2px solid rgba(255,255,255,.18)", boxShadow: "0 24px 60px rgba(0,0,0,.4)", opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)), transform: `translateY(${(1 - p) * 40}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: "rgba(255,255,255,.75)", textTransform: "uppercase" }}>{title}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 40, color: C.lime, transform: `scale(${1 + 0.25 * (1 - prog(t, rows[Math.max(0, done - 1)].at, 0.3))})` }}>{done} de {rows.length}</div>
      </div>
      {rows.map((r, i) => {
        const on = t >= r.at;
        const rp = prog(t, r.at, 0.3);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16, opacity: on ? 1 : 0.35 }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, flexShrink: 0, background: on ? C.lime : "transparent", border: `4px solid ${on ? C.lime : "rgba(255,255,255,.6)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 0.85 + 0.15 * pop(t, r.at, 0.35) : 1})` }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rp} />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 60, letterSpacing: -1.6, color: "#fff", lineHeight: 1 }}>{r.t}</div>
              {r.sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,.75)", marginTop: 4, opacity: rp }}>{r.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Palabra clave que entra desenfocada y se enfoca (para los remates). */
export const FocusWord: React.FC<{ at: number; to: number; t: string; top: number; color?: string; size?: number }> = ({ at, to, t: txt, top, color = C.lime, size = 150 }) => {
  const t = useT();
  if (t < at || t > to + 0.2) return null;
  const p = prog(t, at, 0.3);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(size, Math.floor(980 / (txt.length * 0.58))),
      letterSpacing: -4, color, filter: `blur(${(1 - p) * 14}px)`, opacity: Math.min(1, p * 1.5) * (1 - prog(t, to, 0.2)), textShadow: `${SHADOW}, 0 0 44px ${color}66`, transform: `scale(${1.15 - 0.15 * p})` }}>{txt}</div>
  );
};

// ---------- testimonio en chat (el texto se escribe al ritmo en que se lee) ----------
const norm = (s: string) => s.toLowerCase().replace(/[.,;:¿?¡!«»"“”…]/g, "");
/**
 * Testimonio tipo chat (sin nombre ni foto si no son reales: no se inventan). `who` = quién lo escribe.
 * El texto del mensaje se va escribiendo con las palabras que ella lee (desde `startWord` hasta `to`).
 */
export const ChatTestimonio: React.FC<{ from: number; to: number; readFrom: number; text: string; top: number; who?: string }> = ({ from, to, readFrom, text, top, who = "Alumna" }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.55);
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.25));
  // palabras leídas hasta ahora (sincronizadas con la voz)
  const spoken = WORDS.filter((w) => w.s >= readFrom - 0.05 && w.s <= to);
  const target = text.split(" ");
  const said = spoken.filter((w) => w.s <= t).length;
  const shown = Math.min(target.length, Math.round((said / Math.max(1, spoken.length)) * target.length));
  const typing = t < readFrom;
  return (
    <div style={{ position: "absolute", top, left: 56, right: 56, borderRadius: 38, overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,.5)", opacity: o,
      transformOrigin: "100% 0%", transform: `translate(${(1 - p) * 160}px, ${(1 - p) * -380}px) scale(${0.55 + 0.45 * p}) rotate(${(1 - p) * 6}deg)` }}>
      {/* cabecera */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 30px", background: "#0E5E59" }}>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: "#CFE9E7", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
          <svg width={64} height={64} viewBox="0 0 24 24"><circle cx={12} cy={9} r={4.4} fill="#7FA8A5" /><path d="M3.5 24c0-5 3.8-8.3 8.5-8.3s8.5 3.3 8.5 8.3z" fill="#7FA8A5" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 42, color: "#fff" }}>{who}</div>
          <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 30, color: "rgba(255,255,255,.75)" }}>{typing ? "escribiendo…" : "en línea"}</div>
        </div>
      </div>
      {/* conversación */}
      <div style={{ background: "#EDE6DC", padding: "30px 30px 34px", minHeight: 150 }}>
        <div style={{ maxWidth: "92%", background: "#fff", borderRadius: "8px 30px 30px 30px", padding: "24px 30px 18px", boxShadow: "0 2px 4px rgba(0,0,0,.12)" }}>
          {typing ? (
            <div style={{ display: "flex", gap: 12, padding: "10px 4px" }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#9AA3A2", opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i)) }} />)}
            </div>
          ) : (
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 47, lineHeight: 1.22, letterSpacing: -0.6, color: "#1A1F1E" }}>
              {target.map((w, i) => (
                <span key={i} style={{ opacity: i < shown ? 1 : 0.12, color: i < shown && /desorden|empezar|conecto/.test(norm(w)) ? "#0E8F88" : undefined }}>{w} </span>
              ))}
            </div>
          )}
          {!typing && <div style={{ textAlign: "right", fontFamily: BODY, fontSize: 28, color: "#8B9493", marginTop: 6 }}>✓✓</div>}
        </div>
      </div>
    </div>
  );
};
