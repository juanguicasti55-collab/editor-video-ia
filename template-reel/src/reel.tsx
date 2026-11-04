// Base VERTICAL (1080x1920) para reels: cámara (CamV), pantalla grabada (ScreenV), subtítulos (SubsV), gancho
// textual (HookTitle, regla fija) y cierre Comenta PALABRA (CommentCTA). Los efectos van aparte (menu-efectos.md).
// Zonas seguras de Instagram: arriba ~220 px y abajo ~330 px los tapa la interfaz; a la derecha ~130 px
// están los botones. Textos entre y=220 y y=1590.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, BODY } from "./theme";
import { WORDS, SCREEN_H } from "./words";
import { useT, prog, pop, Sparkle } from "./lib";

export type VBox = { x: number; y: number; w: number; h: number; r: number };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// ---------- encuadres de la cámara ----------
export const CAM_FULL: VBox = { x: 0, y: 0, w: 1080, h: 1920, r: 0 };
/** Cámara abajo (arriba va la pantalla grabada, con ScreenV) */
export const CAM_BOTTOM: VBox = { x: 60, y: 1060, w: 960, h: 600, r: 40 };
/** Cámara en círculo chico abajo a la izquierda (la pantalla ocupa casi todo) */
export const CAM_CIRCLE: VBox = { x: 60, y: 1300, w: 300, h: 300, r: 150 };

// ---------- encuadres de la pantalla ----------
export const SCR_TOP: VBox = { x: 0, y: 230, w: 1080, h: 740, r: 0 };
export const SCR_TALL: VBox = { x: 0, y: 230, w: 1080, h: 1040, r: 0 };
export const SCR_HIDDEN: VBox = { x: 0, y: 230, w: 1080, h: 0, r: 0 };


type Key<T> = { at: number } & T;
function interp<T extends Record<string, number>>(keys: Key<T>[], t: number, dur = 0.55): T {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= t) i++;
  const cur = keys[i];
  if (i === 0) return cur;
  const prev = keys[i - 1];
  const p = interpolate(t, [cur.at, cur.at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const out: Record<string, number> = {};
  for (const k of Object.keys(cur)) out[k] = lerp((prev as any)[k], (cur as any)[k], p);
  return out as T;
}

export type CamKeyV = { at: number; box: VBox; zoom?: number; fy?: number };
/**
 * Cámara vertical (public/cam.mp4, ya en 1080x1920 con la cara centrada).
 * zoom = acercamiento extra (punch-in); fy = altura de la cara en % para encuadres apaisados (default 44).
 * Cambio de caja = animado; mismo tamaño con otro zoom = corte seco.
 */
export const CamV: React.FC<{ keys: CamKeyV[]; until: number }> = ({ keys, until }) => {
  const t = useT();
  const flat = keys.map((k) => ({ at: k.at, ...k.box, zoom: k.zoom ?? 1, fy: k.fy ?? 44 }));
  // punch-in: si solo cambia el zoom, sin animación
  let i = 0;
  while (i + 1 < flat.length && flat[i + 1].at <= t) i++;
  const sameBox = i > 0 && flat[i].w === flat[i - 1].w && flat[i].h === flat[i - 1].h && flat[i].y === flat[i - 1].y;
  const b = sameBox ? flat[i] : interp(flat, t);
  const { fps } = useVideoConfig();
  const drift = 1.012 + 0.012 * Math.sin(t * 0.4); // nunca baja de 1: con zoom 1 dejaba ver bordes negros
  return (
    <Sequence durationInFrames={Math.ceil(until * fps)}>
      <div
        style={{
          position: "absolute",
          left: b.x,
          top: b.y,
          width: b.w,
          height: b.h,
          borderRadius: b.r,
          overflow: "hidden",
          boxShadow: b.r > 0 ? "0 30px 80px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.1)" : "none",
        }}
      >
        <OffthreadVideo
          src={staticFile("cam.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `50% ${b.fy}%`,
            transform: `scale(${b.zoom * drift})`,
            transformOrigin: `50% ${b.fy}%`,
          }}
        />
      </div>
    </Sequence>
  );
};

export type ScrKeyV = { at: number; box: VBox; cx?: number; cy?: number; zoom?: number };
/**
 * Pantalla (public/screen.mp4). cx/cy = punto de la pantalla (0–1) que queda al centro del panel;
 * zoom 1 = el ancho completo de la pantalla entra en el panel; 2 = el doble de cerca.
 */
export const ScreenV: React.FC<{ keys: ScrKeyV[]; until: number; srcW?: number; srcH?: number }> = ({
  keys,
  until,
  srcW = 1920,
  srcH = SCREEN_H,
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const flat = keys.map((k) => ({ at: k.at, ...k.box, cx: k.cx ?? 0.5, cy: k.cy ?? 0.5, zoom: k.zoom ?? 1 }));
  const b = interp(flat, t, 0.7);
  if (b.h < 2) return null;
  const vw = b.w * b.zoom;
  const vh = vw * (srcH / srcW);
  // centrar (cx,cy) y no mostrar fuera de la pantalla
  let left = b.w / 2 - b.cx * vw;
  let top = b.h / 2 - b.cy * vh;
  left = Math.min(0, Math.max(b.w - vw, left));
  top = vh > b.h ? Math.min(0, Math.max(b.h - vh, top)) : (b.h - vh) / 2;
  return (
    <Sequence durationInFrames={Math.ceil(until * fps)}>
      <div
        style={{
          position: "absolute",
          left: b.x,
          top: b.y,
          width: b.w,
          height: b.h,
          borderRadius: b.r,
          overflow: "hidden",
          background: "#000",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)",
        }}
      >
        <OffthreadVideo
          muted
          src={staticFile("screen.mp4")}
          style={{ position: "absolute", left, top, width: vw, height: vh }}
        />
      </div>
    </Sequence>
  );
};

// ---------- subtítulos verticales ----------
const clean = (w: string) => w.toLowerCase().replace(/[.,;:¿?¡!“”"]/g, "");
type Chunk = { words: typeof WORDS; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: typeof WORDS = [];
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

/** Subtítulos grandes, 1–3 palabras. `yAt(t)` = posición vertical (centro) según el encuadre. */
export const SubsV: React.FC<{ keywords: string[]; hide: [number, number][]; yAt: (t: number) => number }> = ({
  keywords,
  hide,
  yAt,
}) => {
  const t = useT();
  if (hide.some(([a, b]) => t >= a && t <= b)) return null;
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch) return null;
  const kw = new Set(keywords.map((k) => k.toLowerCase()));
  const p = pop(t, ch.s, 0.25);
  return (
    <div style={{ position: "absolute", bottom: 1920 - (yAt(t) + 50), left: 40, right: 40, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "12px 28px",
          borderRadius: 20,
          background: "rgba(11,10,16,.7)",
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: -1,
          color: C.text,
          textAlign: "center",
          transform: `scale(${0.85 + 0.15 * p})`,
          opacity: Math.min(1, p * 2),
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 20px",
          maxWidth: 1000,
        }}
      >
        {ch.words.map((w, i) => {
          const spoken = t >= w.s;
          const key = kw.has(clean(w.w));
          return (
            <span key={i} style={{ color: key && spoken ? C.lime : spoken ? C.text : "rgba(244,242,248,.45)" }}>
              {w.w.replace(/[.,]$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Posición típica de subtítulos: cámara completa → abajo del mentón; con panel arriba → entre panel y cámara. */
export const subsY = (keys: CamKeyV[]) => (t: number) => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= t) i++;
  const b = keys[i].box;
  return b.h > 1500 ? 1480 : Math.max(300, b.y - 70);
};

// ---------- gancho inicial ----------
/** Gancho textual (OBLIGATORIO en todo reel, ver references/gancho-textual.md): frase corta arriba que dice de qué
 * trata el video, legible desde el primer fotograma (`from` 0 = sin fundido) y al menos hasta el segundo 3.
 * `mark` = palabra resaltada con marcador · `sub` = línea chica debajo que se escribe letra por letra
 * · `recall` = tramos donde vuelve chico, en un recuadro, cuando la persona se refiere al tema. */
export const HookTitle: React.FC<{ to: number; lines: string[]; mark?: string; from?: number; sub?: string; recall?: [number, number][] }> = ({
  from = 0,
  to,
  lines,
  mark,
  sub,
  recall = [],
}) => {
  const t = useT();
  const r = recall.find(([a, b]) => t >= a - 0.1 && t <= b + 0.3);
  if (r) {
    const ro = prog(t, r[0], 0.25) * (1 - prog(t, r[1], 0.25));
    return (
      <AbsoluteFill style={{ opacity: ro }}>
        <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: TITLE, fontWeight: 900, fontSize: 40, lineHeight: 1.05, letterSpacing: -0.8, textAlign: "center",
              color: C.text, padding: "10px 22px", border: `3px solid ${C.text}`, borderRadius: 10,
              textShadow: "0 4px 18px rgba(0,0,0,.55)", transform: `scale(${0.9 + 0.1 * pop(t, r[0])})`,
            }}
          >
            {lines.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (t > to + 0.4) return null;
  const o = (from <= 0 ? 1 : prog(t, from, 0.35)) * (1 - prog(t, to, 0.3));
  const subTxt = sub ? sub.slice(0, Math.floor(Math.max(0, t - from - 0.3) / 0.045)) : "";
  const m = prog(t, from + 0.5, 0.45);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,10,16,.85) 0%, rgba(11,10,16,.55) 20%, rgba(11,10,16,0) 34%)" }} />
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 50,
          right: 50,
          textAlign: "center",
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          color: C.text,
          textShadow: "0 6px 30px rgba(0,0,0,.6)",
          transform: `translateY(${from <= 0 ? 0 : (1 - prog(t, from, 0.5)) * -30}px)`,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>
            {line.split(" ").map((w, j) => {
              const isMark = mark && w.replace(/[.,¿?¡!]/g, "") === mark;
              return (
                <span key={j} style={{ position: "relative", display: "inline-block", margin: "0 11px", isolation: "isolate" }}>
                  {isMark && (
                    <span
                      style={{
                        position: "absolute",
                        left: -10,
                        right: -10,
                        top: 10,
                        bottom: 2,
                        background: C.lime,
                        borderRadius: 8,
                        transformOrigin: "left",
                        transform: `scaleX(${m}) skewX(-6deg)`,
                        zIndex: 0,
                      }}
                    />
                  )}
                  <span style={{ position: "relative", color: isMark && m > 0.5 ? C.bg : C.text, textShadow: isMark && m > 0.5 ? "none" : undefined }}>
                    {w}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
        {sub && (
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, letterSpacing: 0.5, marginTop: 10, color: C.text, opacity: 0.92 }}>
            {subTxt}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------- cierre con CTA ----------
/** Tarjeta final "Comenta PALABRA". Empieza en `from` (fin del habla). */
export const CommentCTA: React.FC<{ from: number; keyword: string; sub: string }> = ({ from, keyword, sub }) => {
  const t = useT();
  if (t < from - 0.1) return null;
  const p = prog(t, from, 0.5);
  const kp = pop(t, from + 0.35, 0.6);
  const pulse = 1 + 0.04 * Math.sin((t - from) * 6);
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <AbsoluteFill style={{ background: "rgba(11,10,16,.9)" }} />
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          textAlign: "center",
          transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        <Sparkle size={90} />
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 96, color: C.text, letterSpacing: -2 }}>Comenta</div>
        <div
          style={{
            padding: "26px 70px",
            borderRadius: 36,
            background: C.lime,
            color: C.bg,
            fontFamily: TITLE,
            fontWeight: 900,
            fontSize: 130,
            letterSpacing: 4,
            transform: `scale(${kp * pulse})`,
            boxShadow: `0 0 80px ${C.lime}66`,
          }}
        >
          {keyword}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 52, color: C.text, lineHeight: 1.25, maxWidth: 900, opacity: prog(t, from + 0.7, 0.4) }}>
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};
