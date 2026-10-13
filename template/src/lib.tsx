// Biblioteca de piezas reutilizables. NO editar por video: cada video se arma en video.tsx.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, TITLE, BODY, MARCA } from "./theme";
import { WORDS } from "./words";

// ---------- tiempo y animación ----------
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const ease = Easing.bezier(0.22, 1, 0.36, 1);
/** 0→1 suave entre `at` y `at+dur` (segundos) */
export const prog = (t: number, at: number, dur = 0.4) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** 0→1 con rebote (para elementos que "saltan" a pantalla) */
export const pop = (t: number, at: number, dur = 0.45) =>
  interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- cámara / encuadres ----------
export type Box = { x: number; y: number; w: number; h: number; r: number; zoom: number };
export const FULL: Box = { x: 0, y: 0, w: 1920, h: 1080, r: 0, zoom: 1 };
/** Cámara chica abajo a la izquierda; la tarjeta va en CARD_AREA */
export const PIP: Box = { x: 56, y: 1080 - 56 - 300, w: 420, h: 300, r: 28, zoom: 1.25 };
/** Cámara a la izquierda en vertical; la tarjeta va a la derecha (SPLIT_CARD) */
export const SPLIT: Box = { x: 48, y: 48, w: 860, h: 984, r: 32, zoom: 1.05 };
/** Cámara centrada más chica, para la tarjeta de cierre */
export const END: Box = { x: 480, y: 330, w: 960, h: 540, r: 32, zoom: 1 };
export const punch = (zoom: number): Box => ({ ...FULL, zoom });

export const CARD_AREA: React.CSSProperties = { left: 540, top: 70, width: 1320 };
export const SPLIT_CARD: React.CSSProperties = { left: 960, top: 150, width: 900 };

export type CamKey = { at: number; box: Box };

export const cameraAt = (keys: CamKey[], t: number): Box => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= t) i++;
  const cur = keys[i];
  if (i === 0) return cur.box;
  const prev = keys[i - 1].box;
  // mismo tamaño de caja = punch-in: corte seco, como en un jump cut
  if (prev.w === cur.box.w && prev.h === cur.box.h) return cur.box;
  const p = prog(t, cur.at, 0.5);
  return {
    x: lerp(prev.x, cur.box.x, p),
    y: lerp(prev.y, cur.box.y, p),
    w: lerp(prev.w, cur.box.w, p),
    h: lerp(prev.h, cur.box.h, p),
    r: lerp(prev.r, cur.box.r, p),
    zoom: lerp(prev.zoom, cur.box.zoom, p),
  };
};

export const Camera: React.FC<{ keys: CamKey[]; objectPosition?: string }> = ({
  keys,
  objectPosition = "50% 35%",
}) => {
  const t = useT();
  const b = cameraAt(keys, t);
  const drift = 1 + 0.015 * Math.sin(t * 0.4); // movimiento leve para que nunca se vea estático
  return (
    <div
      style={{
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        borderRadius: b.r,
        overflow: "hidden",
        boxShadow: b.r > 0 ? "0 30px 80px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08)" : "none",
      }}
    >
      <OffthreadVideo
        src={staticFile("cut.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${b.zoom * drift})`,
          transformOrigin: "50% 38%",
        }}
      />
    </div>
  );
};

// ---------- bloques de tarjeta ----------
export const Card: React.FC<{
  from: number;
  to: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ from, to, style, children }) => {
  const t = useT();
  if (t < from - 0.05 || t > to + 0.4) return null;
  const pin = prog(t, from, 0.5);
  const pout = prog(t, to, 0.3);
  return (
    <div
      style={{
        position: "absolute",
        background: C.card,
        border: `1.5px solid ${C.line}`,
        borderRadius: 36,
        padding: "48px 56px",
        boxShadow: "0 40px 120px rgba(0,0,0,.5)",
        backdropFilter: "blur(20px)",
        opacity: pin * (1 - pout),
        transform: `translateY(${(1 - pin) * 60 + pout * -30}px) scale(${0.96 + 0.04 * pin})`,
        fontFamily: BODY,
        color: C.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 20px",
      borderRadius: 999,
      background: `${color}22`,
      border: `1.5px solid ${color}66`,
      color,
      fontFamily: TITLE,
      fontWeight: 800,
      fontSize: 24,
      letterSpacing: 3,
      textTransform: "uppercase",
    }}
  >
    <span style={{ width: 10, height: 10, borderRadius: 99, background: color }} />
    {children}
  </div>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 56 }) => (
  <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: -1, margin: "26px 0 34px" }}>
    {children}
  </div>
);

/** Fila de lista con ✗ o ✓. `strikeAt` la tacha con una línea animada. */
export const Row: React.FC<{ at: number; icon: "x" | "check"; children: React.ReactNode; strikeAt?: number }> = ({
  at,
  icon,
  children,
  strikeAt,
}) => {
  const t = useT();
  const p = pop(t, at);
  const s = strikeAt !== undefined ? prog(t, strikeAt, 0.35) : 0;
  const col = icon === "x" ? C.red : C.lime;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "26px 30px",
        borderRadius: 22,
        background: "rgba(255,255,255,.035)",
        border: `1.5px solid ${C.line}`,
        opacity: Math.min(1, p * 1.5),
        transform: `translateX(${(1 - p) * -40}px)`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 16,
          background: `${col}1f`,
          border: `2px solid ${col}`,
          display: "grid",
          placeItems: "center",
          transform: `scale(${p})`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3.2" strokeLinecap="round">
          {icon === "x" ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 12.5l5 5L20 6.5" />}
        </svg>
      </div>
      <div style={{ position: "relative", fontSize: 44, fontWeight: 600, opacity: 1 - s * 0.45 }}>
        {children}
        {strikeAt !== undefined && (
          <div
            style={{
              position: "absolute",
              left: -6,
              top: "52%",
              height: 5,
              borderRadius: 4,
              width: `calc(${s * 100}% + 12px)`,
              background: C.red,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const Counter: React.FC<{ at: number; to: number; dur?: number; prefix?: string; suffix?: string }> = ({
  at,
  to,
  dur = 0.9,
  prefix = "",
  suffix = "",
}) => {
  const t = useT();
  const v = Math.round(to * prog(t, at, dur));
  return (
    <span>
      {prefix}
      {v.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
};

/** Mosaico de número grande. Usar 2-3 en fila dentro de <div style={{display:"flex",gap:22}}> */
export const Stat: React.FC<{ at: number; label: string; big: React.ReactNode; accent: string }> = ({
  at,
  label,
  big,
  accent,
}) => {
  const t = useT();
  const p = pop(t, at);
  const glow = interpolate(t, [at, at + 0.3, at + 1.4], [0, 1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        flex: 1,
        padding: "34px 34px 30px",
        borderRadius: 26,
        background: "rgba(255,255,255,.035)",
        border: `1.5px solid ${glow > 0.3 ? accent + "88" : C.line}`,
        boxShadow: `0 0 ${60 * glow}px ${accent}40`,
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 96, lineHeight: 1, color: accent }}>{big}</div>
      <div style={{ marginTop: 14, fontSize: 32, color: C.muted, fontWeight: 600 }}>{label}</div>
    </div>
  );
};

/** Barra que se llena de `left` a `right` entre `at` y `at+dur`. */
export const ProgressBar: React.FC<{ at: number; dur: number; left: string; right: string; showAt?: number }> = ({
  at,
  dur,
  left,
  right,
  showAt,
}) => {
  const t = useT();
  const bar = prog(t, at, dur);
  return (
    <div style={{ marginTop: 30, opacity: prog(t, showAt ?? at - 0.6, 0.4) }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: C.muted, fontWeight: 600 }}>
        <span>{left}</span>
        <span style={{ color: bar > 0.98 ? C.lime : C.muted }}>{right}</span>
      </div>
      <div style={{ marginTop: 14, height: 16, borderRadius: 99, background: "rgba(255,255,255,.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${bar * 100}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${C.violet}, ${C.lime})`,
            boxShadow: `0 0 24px ${C.lime}66`,
          }}
        />
      </div>
    </div>
  );
};

/** Medidor horizontal que se llena hasta `value` (0–100) en `at`. Para comparar tiempos/porcentajes. */
export const Meter: React.FC<{ at: number; label: string; value: number; color: string; dur?: number }> = ({
  at,
  label,
  value,
  color,
  dur = 0.9,
}) => {
  const t = useT();
  const p = prog(t, at, dur);
  const show = prog(t, at - 0.3, 0.3);
  return (
    <div style={{ opacity: show, transform: `translateY(${(1 - show) * 20}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 36, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 48, color }}>{Math.round(value * p)}%</span>
      </div>
      <div style={{ marginTop: 12, height: 22, borderRadius: 99, background: "rgba(255,255,255,.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${value * p}%`,
            borderRadius: 99,
            background: color,
            boxShadow: `0 0 24px ${color}55`,
          }}
        />
      </div>
    </div>
  );
};

/** Paso numerado de un flujo. Máx. 3 por tarjeta con <Arrow/> entre medio (etiquetas ≤ 14 letras). */
export const Node: React.FC<{ at: number; n: string; label: string; accent: string }> = ({ at, n, label, accent }) => {
  const t = useT();
  const p = pop(t, at);
  return (
    <div
      style={{
        width: 350,
        padding: "34px 20px",
        borderRadius: 28,
        textAlign: "center",
        background: p > 0.5 ? `${accent}14` : "rgba(255,255,255,.03)",
        border: `2px solid ${p > 0.5 ? accent : C.line}`,
        boxShadow: `0 0 ${50 * p}px ${accent}33`,
        opacity: 0.35 + 0.65 * Math.min(1, p),
        transform: `scale(${0.92 + 0.08 * p})`,
      }}
    >
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 30, color: accent, letterSpacing: 3 }}>{n}</div>
      <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 40, marginTop: 10 }}>{label}</div>
    </div>
  );
};

export const Arrow: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const p = prog(t, at, 0.35);
  return (
    <svg width="70" height="40" viewBox="0 0 90 40">
      <line x1="4" y1="20" x2={4 + 70 * p} y2="20" stroke={C.muted} strokeWidth="4" strokeLinecap="round" />
      {p > 0.9 && <path d="M66 8 L82 20 L66 32" fill="none" stroke={C.muted} strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
};

/** Etiqueta arriba a la izquierda (tipo "EN VIVO / ENTREVISTA · tema"), con cámara en FULL. */
export const LowerThird: React.FC<{ from: number; to: number; tag: string; text: string }> = ({ from, to, tag, text }) => {
  const t = useT();
  if (t < from - 0.1 || t > to + 0.4) return null;
  const o = prog(t, from, 0.5) * (1 - prog(t, to, 0.3));
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 64,
        opacity: o,
        transform: `translateX(${(1 - prog(t, from, 0.6)) * -80}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 30px 18px 22px",
        borderRadius: 20,
        background: C.card,
        border: `1.5px solid ${C.line}`,
        fontFamily: TITLE,
        color: C.text,
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: 99, background: C.red, boxShadow: `0 0 16px ${C.red}` }} />
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 2 }}>{tag.toUpperCase()}</div>
      <div style={{ color: C.muted, fontSize: 30, fontFamily: BODY, fontWeight: 600 }}>· {text}</div>
    </div>
  );
};

/** Barra de "viaje" arriba a la derecha (de A a B), con cámara en FULL. */
export const JourneyBar: React.FC<{ from: number; to: number; fillAt: number; fillDur: number; left: string; right: string }> = ({
  from,
  to,
  fillAt,
  fillDur,
  left,
  right,
}) => {
  const t = useT();
  if (t < from - 0.1 || t > to + 0.4) return null;
  const bar = prog(t, fillAt, fillDur);
  return (
    <div
      style={{
        position: "absolute",
        right: 64,
        top: 64,
        width: 720,
        opacity: prog(t, from, 0.4) * (1 - prog(t, to, 0.3)),
        padding: "24px 30px",
        borderRadius: 22,
        background: C.card,
        border: `1.5px solid ${C.line}`,
        fontFamily: TITLE,
        color: C.text,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 24, letterSpacing: 2 }}>
        <span style={{ color: C.violet }}>{left.toUpperCase()}</span>
        <span style={{ color: bar > 0.97 ? C.lime : C.muted }}>{right.toUpperCase()}</span>
      </div>
      <div style={{ position: "relative", marginTop: 16, height: 12, borderRadius: 99, background: "rgba(255,255,255,.08)" }}>
        <div style={{ height: "100%", width: `${bar * 100}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.violet}, ${C.lime})` }} />
        <div
          style={{
            position: "absolute",
            top: -8,
            left: `calc(${bar * 100}% - 14px)`,
            width: 28,
            height: 28,
            borderRadius: 99,
            background: bar > 0.97 ? C.lime : C.text,
            boxShadow: `0 0 20px ${C.lime}88`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Frase destacada grande abajo, palabra por palabra, con una palabra resaltada con marcador.
 * lines: [[palabra, tiempo], ...] por renglón. `mark` = palabra exacta que lleva marcador.
 * Ocultar los subtítulos en este tramo (hideSubs en video.tsx) para no duplicar texto.
 */
export const Quote: React.FC<{ from: number; to: number; lines: [string, number][][]; mark?: string }> = ({
  from,
  to,
  lines,
  mark,
}) => {
  const t = useT();
  if (t < from - 0.1 || t > to + 0.4) return null;
  const o = prog(t, from, 0.4) * (1 - prog(t, to, 0.3));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,10,16,0) 45%, rgba(11,10,16,.85) 100%)" }} />
      <div
        style={{
          position: "absolute",
          bottom: 90,
          width: "100%",
          textAlign: "center",
          fontFamily: TITLE,
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: -2,
          color: C.text,
          textShadow: "0 6px 30px rgba(0,0,0,.6)",
        }}
      >
        {lines.map((line, li) => (
          <div key={li}>
            {line.map(([w, at], wi) => {
              const isMark = mark && w.replace(/[“”".,]/g, "") === mark;
              const m = isMark ? prog(t, at, 0.45) : 0;
              return (
                <span
                  key={wi}
                  style={{ position: "relative", display: "inline-block", marginRight: 22, isolation: "isolate", opacity: prog(t, at, 0.25) }}
                >
                  {isMark && (
                    <span
                      style={{
                        position: "absolute",
                        left: -14,
                        right: -14,
                        top: 14,
                        bottom: 4,
                        background: C.lime,
                        borderRadius: 8,
                        transformOrigin: "left",
                        transform: `scaleX(${m}) skewX(-6deg)`,
                        zIndex: 0,
                        opacity: 0.95,
                      }}
                    />
                  )}
                  <span style={{ position: "relative", color: m > 0.5 ? C.bg : C.text, textShadow: m > 0.5 ? "none" : undefined }}>{w}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Texto de cierre arriba de la cámara en END. */
export const EndTitle: React.FC<{ from: number; chip: string; title: string }> = ({ from, chip, title }) => {
  const t = useT();
  if (t < from - 0.1) return null;
  const p = prog(t, from, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <Chip color={C.lime}>{chip}</Chip>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 64, color: C.text }}>{title}</div>
    </div>
  );
};

// ---------- subtítulos ----------
const clean = (w: string) => w.toLowerCase().replace(/[.,;:¿?¡!“”"]/g, "");

type Chunk = { words: typeof WORDS; s: number; e: number };
const buildChunks = (): Chunk[] => {
  const out: Chunk[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const punct = /[,;:]$/.test(w.w);
    const end = /[.?!]$/.test(w.w); // fin de oración: siempre corta, aunque quede una palabra sola
    const gap = next ? next.s - w.e > 0.35 : true;
    // cortar en 4 palabras, en fin de oración, o en coma/pausa (evitando dejar una palabra sola)
    if (cur.length >= 4 || end || ((punct || gap) && (cur.length >= 2 || (next && next.s - w.e > 0.6))) || !next) {
      out.push({ words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.4) : w.e + 0.5 });
      cur = [];
    }
  });
  return out;
};
const CHUNKS = buildChunks();

export const Subtitles: React.FC<{ keys: CamKey[]; keywords: string[]; hide: [number, number][] }> = ({ keys, keywords, hide }) => {
  const t = useT();
  if (hide.some(([a, b]) => t >= a && t <= b)) return null;
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch) return null;
  const kw = new Set(keywords.map((k) => k.toLowerCase()));
  const p = pop(t, ch.s, 0.25);
  const cam = cameraAt(keys, t);
  const pipLike = cam.w < 1920 && cam.x < 200 && cam.w < 1000;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: pipLike ? cam.x + cam.w + 30 : 0, // nunca encima de la cámara chica
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "14px 30px",
          borderRadius: 18,
          background: "rgba(11,10,16,.62)",
          backdropFilter: "blur(8px)",
          fontFamily: TITLE,
          fontWeight: 800,
          fontSize: 60,
          letterSpacing: -0.5,
          color: C.text,
          transform: `scale(${0.9 + 0.1 * p})`,
          opacity: Math.min(1, p * 2),
          display: "flex",
          gap: 18,
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

// ---------- fondo, marca, sonido ----------
export const Background = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          left: 300 + 120 * Math.sin(t * 0.3),
          top: -500,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${C.violet}40 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          right: -300,
          bottom: -500 + 80 * Math.cos(t * 0.25),
          borderRadius: 9999,
          background: `radial-gradient(circle, ${C.lime}1c 0%, transparent 65%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
    </AbsoluteFill>
  );
};

export const Brand: React.FC<{ text?: string }> = ({ text = MARCA.handle }) => (
  <div style={{ position: "absolute", right: 44, bottom: 30, fontFamily: TITLE, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: "rgba(255,255,255,.55)" }}>
    {text}
  </div>
);

export type Sfx = { at: number; f: "whoosh" | "pop" | "ding" | "click" | "boom"; v?: number };
export const Sounds: React.FC<{ list: Sfx[] }> = ({ list }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {list.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={fps}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={(s.v ?? 1) * 0.35} />
        </Sequence>
      ))}
    </>
  );
};

// ======================= IA y herramientas =======================
// Logos: conseguirlos con scripts/logo.py → quedan en public/logos/<slug>.svg|png

/** Destello de 4 puntas, el símbolo universal de "IA". */
export const Sparkle: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
  size = 32,
  color = C.lime,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path d="M12 1.5c.6 5.2 3.3 7.9 8.5 8.5-5.2.6-7.9 3.3-8.5 8.5-.6-5.2-3.3-7.9-8.5-8.5 5.2-.6 7.9-3.3 8.5-8.5z" fill={color} />
    <path d="M19.5 15.5c.25 2 1.25 3 3.25 3.25-2 .25-3 1.25-3.25 3.25-.25-2-1.25-3-3.25-3.25 2-.25 3-1.25 3.25-3.25z" fill={color} opacity={0.7} />
  </svg>
);

/** Logo oficial. `file` = "gohighlevel.svg" (en public/logos). Sin archivo → destello de IA. */
export const Logo: React.FC<{ file?: string; height?: number; style?: React.CSSProperties }> = ({ file, height = 48, style }) =>
  file ? (
    <Img src={staticFile(`logos/${file}`)} style={{ height, width: "auto", objectFit: "contain", ...style }} />
  ) : (
    <Sparkle size={height} style={style} />
  );

/**
 * Insignia flotante "herramienta mencionada": logo + nombre, entra con rebote.
 * Usar cuando la persona nombra una herramienta y la cámara está en FULL (no tapa la cara: va arriba).
 * `wordmark` = el logo ya incluye el nombre (ej. HighLevel): no se repite el texto.
 */
export const ToolBadge: React.FC<{
  from: number;
  to: number;
  logo?: string;
  name: string;
  sub?: string;
  wordmark?: boolean;
  side?: "left" | "right";
}> = ({ from, to, logo, name, sub, wordmark, side = "right" }) => {
  const t = useT();
  if (t < from - 0.1 || t > to + 0.4) return null;
  const p = pop(t, from, 0.5);
  const out = prog(t, to, 0.3);
  const shine = interpolate(t, [from + 0.2, from + 1.0], [-120, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        [side]: 64,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "20px 30px 20px 22px",
        borderRadius: 26,
        background: C.card,
        border: `1.5px solid ${C.lime}55`,
        boxShadow: `0 20px 60px rgba(0,0,0,.45), 0 0 40px ${C.lime}22`,
        opacity: Math.min(1, p * 1.5) * (1 - out),
        transform: `scale(${0.8 + 0.2 * p}) translateY(${out * -20}px)`,
        transformOrigin: side === "right" ? "right top" : "left top",
        overflow: "hidden",
        fontFamily: TITLE,
        color: C.text,
      } as React.CSSProperties}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shine}%`,
          width: "40%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)",
          transform: "skewX(-20deg)",
        }}
      />
      <Logo file={logo} height={wordmark ? 46 : 56} />
      {(!wordmark || sub) && (
        <div>
          {!wordmark && <div style={{ fontWeight: 800, fontSize: 38 }}>{name}</div>}
          {sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: C.muted, marginTop: 2 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
};

/** Paso de flujo con logo en lugar de número (misma medida que Node). */
export const LogoNode: React.FC<{ at: number; logo?: string; label: string; accent: string; wordmark?: boolean }> = ({
  at,
  logo,
  label,
  accent,
  wordmark,
}) => {
  const t = useT();
  const p = pop(t, at);
  return (
    <div
      style={{
        width: 350,
        padding: "28px 20px",
        borderRadius: 28,
        textAlign: "center",
        background: p > 0.5 ? `${accent}14` : "rgba(255,255,255,.03)",
        border: `2px solid ${p > 0.5 ? accent : C.line}`,
        boxShadow: `0 0 ${50 * p}px ${accent}33`,
        opacity: 0.35 + 0.65 * Math.min(1, p),
        transform: `scale(${0.92 + 0.08 * p})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ height: 54, display: "flex", alignItems: "center" }}>
        <Logo file={logo} height={wordmark ? 40 : 54} />
      </div>
      {!wordmark && <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 38 }}>{label}</div>}
      {wordmark && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 26, color: C.muted }}>{label}</div>}
    </div>
  );
};

/**
 * Caja de chat de un agente/LLM donde se "escribe" la instrucción letra por letra.
 * Para cuando la persona le pide algo a una IA. typeFrom→typeTo = tramo en que se tipea.
 */
export const PromptCard: React.FC<{
  from: number;
  to: number;
  typeFrom: number;
  typeTo: number;
  text: string;
  agent?: string;
  logo?: string;
  style?: React.CSSProperties;
}> = ({ from, to, typeFrom, typeTo, text, agent = "Agente IA", logo, style }) => {
  const t = useT();
  const n = Math.round(text.length * prog(t, typeFrom, typeTo - typeFrom));
  const done = t > typeTo + 0.15;
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  const sent = prog(t, typeTo + 0.15, 0.3);
  return (
    <Card from={from} to={to} style={{ ...CARD_AREA, top: 120, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: `${C.violet}22`,
            border: `1.5px solid ${C.violet}66`,
          }}
        >
          <Logo file={logo} height={38} />
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 36 }}>{agent}</div>
        <div style={{ marginLeft: "auto" }}>
          <Chip color={C.lime}>Instrucción</Chip>
        </div>
      </div>
      <div
        style={{
          marginTop: 30,
          padding: "30px 34px",
          minHeight: 200,
          borderRadius: 24,
          background: "rgba(255,255,255,.04)",
          border: `1.5px solid ${done ? C.lime + "88" : C.line}`,
          fontSize: 40,
          lineHeight: 1.35,
          fontWeight: 600,
          position: "relative",
        }}
      >
        {text.slice(0, n)}
        <span style={{ opacity: !done && cursor ? 1 : 0, color: C.lime }}>▍</span>
        <div
          style={{
            position: "absolute",
            right: 22,
            bottom: 22,
            width: 64,
            height: 64,
            borderRadius: 99,
            display: "grid",
            placeItems: "center",
            background: done ? C.lime : "rgba(255,255,255,.08)",
            transform: `scale(${1 + 0.25 * Math.sin(sent * Math.PI)})`,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={done ? C.bg : C.muted} strokeWidth="3" strokeLinecap="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
    </Card>
  );
};

/**
 * Panel "agente trabajando": tareas que pasan de ⟳ girando a ✓ en su segundo.
 * tasks: [{label, at}] con `at` = cuándo se completa. Aparece cada tarea 0,8 s antes de completarse.
 */
export const AgentTasks: React.FC<{
  from: number;
  to: number;
  title?: string;
  logo?: string;
  tasks: { label: string; at: number; logo?: string }[];
  style?: React.CSSProperties;
}> = ({ from, to, title = "Agente trabajando", logo, tasks, style }) => {
  const t = useT();
  const doneCount = tasks.filter((k) => t >= k.at).length;
  const all = doneCount === tasks.length;
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  return (
    <Card from={from} to={to} style={{ ...CARD_AREA, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: `${C.violet}22`,
            border: `1.5px solid ${C.violet}66`,
            boxShadow: all ? "none" : `0 0 ${20 + 14 * Math.sin(t * 5)}px ${C.violet}66`,
          }}
        >
          <Logo file={logo} height={38} />
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 40 }}>
          {all ? "¡Listo!" : title}
          {!all && <span style={{ color: C.muted }}>{dots}</span>}
        </div>
        <div style={{ marginLeft: "auto", fontFamily: TITLE, fontWeight: 900, fontSize: 40, color: all ? C.lime : C.muted }}>
          {doneCount}/{tasks.length}
        </div>
      </div>
      <div style={{ marginTop: 22, height: 10, borderRadius: 99, background: "rgba(255,255,255,.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${(doneCount / tasks.length) * 100}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${C.violet}, ${C.lime})`,
          }}
        />
      </div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        {tasks.map((k, i) => {
          const appear = pop(t, k.at - 0.8, 0.4);
          const ok = t >= k.at;
          const okP = pop(t, k.at, 0.35);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "20px 26px",
                borderRadius: 20,
                background: ok ? `${C.lime}0f` : "rgba(255,255,255,.035)",
                border: `1.5px solid ${ok ? C.lime + "55" : C.line}`,
                opacity: Math.min(1, appear * 1.5),
                transform: `translateY(${(1 - appear) * 20}px)`,
              }}
            >
              <div style={{ width: 44, height: 44, display: "grid", placeItems: "center" }}>
                {ok ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" style={{ transform: `scale(${okP})` }}>
                    <circle cx="12" cy="12" r="11" fill={C.lime} />
                    <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke={C.bg} strokeWidth="2.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" style={{ transform: `rotate(${t * 360}deg)` }}>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="3" />
                    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={C.violet} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              {k.logo && <Logo file={k.logo} height={34} />}
              <div style={{ fontSize: 36, fontWeight: 600, color: ok ? C.text : C.muted }}>{k.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// red neuronal decorativa: nodos fijos (deterministas) y pulsos que viajan por las conexiones
const NN_NODES = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1920, y: r(2) * 1080, s: 3 + r(3) * 4, ph: r(4) * 6.28 };
});
const NN_EDGES: [number, number][] = [];
NN_NODES.forEach((a, i) =>
  NN_NODES.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 360) NN_EDGES.push([i, j]);
  })
);

/**
 * Fondo de IA: red neuronal tenue con pulsos. Va DETRÁS de la cámara (poner justo después de <Background/>),
 * así solo se ve cuando la cámara está en PIP / SPLIT / END. `strength` 0–1.
 */
export const NeuralBg: React.FC<{ strength?: number }> = ({ strength = 1 }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ opacity: 0.55 * strength }}>
      <svg width="1920" height="1080">
        {NN_EDGES.map(([i, j], k) => {
          const a = NN_NODES[i];
          const b = NN_NODES[j];
          const q = ((t * 0.35 + k * 0.137) % 1 + 1) % 1;
          return (
            <g key={k}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.violet} strokeOpacity={0.26} strokeWidth={1.2} />
              {k % 3 === 0 && <circle cx={a.x + (b.x - a.x) * q} cy={a.y + (b.y - a.y) * q} r={2.6} fill={C.lime} opacity={0.7} />}
            </g>
          );
        })}
        {NN_NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.s * (0.8 + 0.25 * Math.sin(t * 1.6 + n.ph))} fill={C.violet} opacity={0.55} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ======================= Tomas de apoyo (b-roll) =======================
/**
 * Clip a pantalla completa DETRÁS de la cámara (ponerlo antes de <Camera/>): la cámara pasa a PIP.
 * src = archivo en public/broll. start = segundo del clip donde arranca. tag = etiqueta arriba a la izquierda.
 * credit = crédito arriba a la derecha (fuente del material).
 */
export type BrollItem = { from: number; to: number; src: string; start?: number; tag?: string; credit?: string; zoom?: number; origin?: string };
const BrollOne: React.FC<{ b: BrollItem }> = ({ b }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const pin = prog(t, b.from, 0.35);
  const pout = prog(t, b.to - 0.05, 0.25);
  const zoom = 1.08 - 0.08 * pin + 0.05 * ((t - b.from) / Math.max(1, b.to - b.from));
  const tagP = pop(t, b.from + 0.25, 0.45);
  return (
    <AbsoluteFill style={{ opacity: pin * (1 - pout) }}>
      <Sequence from={Math.round(b.from * fps)} durationInFrames={Math.round((b.to - b.from + 0.4) * fps)} layout="none">
        <OffthreadVideo
          muted
          src={staticFile(`broll/${b.src}`)}
          startFrom={Math.round((b.start ?? 0) * fps)}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom * (b.zoom ?? 1)})`, transformOrigin: b.origin ?? "50% 50%" }}
        />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,10,16,.55) 0%, rgba(11,10,16,0) 22%, rgba(11,10,16,0) 62%, rgba(11,10,16,.75) 100%)" }} />
      {b.tag && (
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 52,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 26px 14px 20px",
            borderRadius: 18,
            background: "rgba(11,10,16,.78)",
            border: `1.5px solid ${C.line}`,
            fontFamily: TITLE,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 1.5,
            color: C.text,
            opacity: Math.min(1, tagP * 1.5),
            transform: `translateX(${(1 - tagP) * -40}px)`,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 99, background: C.red, boxShadow: `0 0 14px ${C.red}`, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />
          {b.tag.toUpperCase()}
        </div>
      )}
      <div style={{ position: "absolute", right: 48, top: 60, fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,.6)" }}>
        {b.credit ?? "Imágenes: OpenAI"}
      </div>
    </AbsoluteFill>
  );
};
export const Broll: React.FC<{ list: BrollItem[] }> = ({ list }) => {
  const t = useT();
  return (
    <>
      {list.filter((b) => t >= b.from - 0.1 && t <= b.to + 0.35).map((b, i) => <BrollOne key={b.from + i} b={b} />)}
    </>
  );
};

/** Fila de logos que entran uno por uno (arriba a la derecha). items: [archivo, momento] */
export const LogoRow: React.FC<{ from: number; to: number; items: [string, number][]; label?: string }> = ({ from, to, items, label }) => {
  const t = useT();
  if (t < from - 0.1 || t > to + 0.4) return null;
  const o = prog(t, from, 0.35) * (1 - prog(t, to, 0.3));
  return (
    <div
      style={{
        position: "absolute",
        right: 56,
        top: 120,
        opacity: o,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "22px 30px",
        borderRadius: 26,
        background: C.card,
        border: `1.5px solid ${C.lime}44`,
        fontFamily: TITLE,
        color: C.text,
      }}
    >
      {label && <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.lime, marginRight: 6 }}>{label.toUpperCase()}</div>}
      {items.map(([f, at], i) => {
        const p = pop(t, at, 0.45);
        return (
          <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p})` }}>
            <Logo file={f} height={60} />
          </div>
        );
      })}
    </div>
  );
};

/** Opciones cerradas (API de decisiones): píldoras que aparecen y una queda elegida en `pickAt`. */
export const Options: React.FC<{ items: [string, number][]; pick: number; pickAt: number }> = ({ items, pick, pickAt }) => {
  const t = useT();
  const pk = prog(t, pickAt, 0.3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map(([label, at], i) => {
        const p = pop(t, at, 0.4);
        const chosen = i === pick && pk > 0.5;
        const dim = i !== pick && pk > 0.5;
        return (
          <div
            key={i}
            style={{
              width: 420,
              padding: "22px 30px",
              borderRadius: 999,
              fontFamily: TITLE,
              fontWeight: 800,
              fontSize: 36,
              textAlign: "center",
              background: chosen ? C.lime : "rgba(255,255,255,.04)",
              color: chosen ? C.bg : C.text,
              border: `2px solid ${chosen ? C.lime : C.line}`,
              boxShadow: chosen ? `0 0 40px ${C.lime}66` : "none",
              opacity: Math.min(1, p * 1.5) * (dim ? 0.4 : 1),
              transform: `translateX(${(1 - p) * 40}px) scale(${chosen ? 1 + 0.06 * Math.sin(pk * Math.PI) : 1})`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

/** Tarjeta de apertura de sección (va en SPLIT_CARD con la cámara en SPLIT). */
export const SectionCard: React.FC<{ from: number; to: number; n: number; total?: number; title: string; titleAt?: number }> = ({
  from,
  to,
  n,
  total = 4,
  title,
  titleAt,
}) => {
  const t = useT();
  const p = pop(t, titleAt ?? from + 0.2, 0.5);
  return (
    <Card from={from} to={to} style={{ ...SPLIT_CARD, top: 220 }}>
      <Chip color={C.violet}>{`Parte ${n} de ${total}`}</Chip>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 30 }}>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 200, lineHeight: 0.8, color: C.lime, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: "left bottom" }}>
          {String(n).padStart(2, "0")}
        </div>
      </div>
      <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 64, lineHeight: 1.06, letterSpacing: -1, marginTop: 30, opacity: Math.min(1, p * 1.4) }}>{title}</div>
    </Card>
  );
};
