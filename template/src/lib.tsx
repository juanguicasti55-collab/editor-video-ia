// Base común: tiempo y animación, cámara con zooms, subtítulos, marca de agua, sonidos y logos.
// La skill no trae piezas de diseño propias: los efectos salen del menú (references/menu-efectos.md)
// y se copian al proyecto (fx.tsx, mg.tsx, doc.tsx…). NO editar por video: cada video se arma en video.tsx.
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
export const punch = (zoom: number): Box => ({ ...FULL, zoom });

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

// ---------- marca, sonido, logos ----------
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
