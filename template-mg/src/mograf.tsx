// Piezas de MOTION GRAPHICS verticales (1080x1920) para videos SIN cámara: todo es gráfico + voz en off.
// NO editar por video: cada video se arma en video.tsx. Ver references/motion-graphics.md.
// Zonas: arriba ~220 px y abajo ~330 px los tapa Instagram. Rótulo de sección en y=262, contenido entre
// y≈330 y y≈1330, subtítulos en y=1398, pie (usuario + barra de progreso) en y=1510-1556.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, MONO, SERIF, SERIF_I, TITLE } from "./theme";
import { DURATION, WORDS } from "./words";
import { pop, prog, useT } from "./lib";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- utilidades ----------
/** 0→1→0: visible entre `a` y `b` con fundidos */
export const vis = (t: number, a: number, b: number, fin = 0.3, fout = 0.25) =>
  t < a - 0.01 || t > b + fout ? 0 : Math.min(a <= 0 ? 1 : prog(t, a, fin), 1 - prog(t, b, fout));
export const Abs: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", ...style }}>{children}</div>
);
/** Una escena = un bloque de ideas (una lámina del carrusel). Entra subiendo, sale subiendo. */
export const Scene: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const t = useT();
  const o = vis(t, a, b);
  if (o <= 0) return null;
  const y = (a <= 0 ? 0 : (1 - prog(t, a, 0.45)) * 40) - prog(t, b, 0.3) * 30; // a<=0: visible desde el fotograma 0
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};
export const mono = (size = 24, color = C.lime): React.CSSProperties => ({
  fontFamily: MONO, fontSize: size, letterSpacing: "0.18em", textTransform: "uppercase", color,
});
/** Tiempo de la n-ésima vez que se dice una palabra (sin tildes ni mayúsculas). Para palabras repetidas pasa `n`. */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const W = (word: string, n = 1, after = 0): number => {
  const k = norm(word);
  let c = 0;
  for (const w of WORDS) if (w.s >= after && norm(w.w) === k && ++c === n) return w.s;
  throw new Error(`W(): "${word}" #${n} no está en words.ts`);
};

// ---------- fondo y marco ----------
/** Fondo técnico: grilla de puntos que se desliza, retícula, línea de escaneo y viñeta */
export const TechBg: React.FC = () => {
  const t = useT();
  const scan = ((t * 0.18) % 1) * 2200 - 140;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 38%, ${C.bg2} 0%, ${C.bg} 62%)` }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.grid} 1.6px, transparent 1.8px)`, backgroundSize: "54px 54px", backgroundPosition: `${(t * 6) % 54}px 0px`, opacity: 0.55 }} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.gridSoft} 1px, transparent 1px), linear-gradient(90deg, ${C.gridSoft} 1px, transparent 1px)`, backgroundSize: "216px 216px" }} />
      <Abs style={{ left: 0, right: 0, top: scan, height: 2, background: `linear-gradient(90deg, transparent, ${C.lime}55, transparent)` }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 60px rgba(0,0,0,.75)" }} />
    </AbsoluteFill>
  );
};

/** Esquinas tipo visor en la zona segura */
export const Brackets: React.FC = () => {
  const L = 46, s = 3, col = C.bracket;
  const corner = (st: React.CSSProperties) => <Abs style={{ width: L, height: L, ...st }} />;
  return (
    <>
      {corner({ left: 40, top: 232, borderLeft: `${s}px solid ${col}`, borderTop: `${s}px solid ${col}` })}
      {corner({ right: 40, top: 232, borderRight: `${s}px solid ${col}`, borderTop: `${s}px solid ${col}` })}
      {corner({ left: 40, top: 1546, borderLeft: `${s}px solid ${col}`, borderBottom: `${s}px solid ${col}` })}
      {corner({ right: 40, top: 1546, borderRight: `${s}px solid ${col}`, borderBottom: `${s}px solid ${col}` })}
    </>
  );
};

/** Rótulo de sección arriba ("03 — Qué pasa") + contador, y pie con el usuario y la barra de progreso */
export const Hud: React.FC<{ sections: [number, string][]; handle: string; label: string; hideFrom: number }> = ({ sections, handle, label, hideFrom }) => {
  const t = useT();
  let i = -1;
  sections.forEach(([at], k) => { if (t >= at) i = k; });
  const p = interpolate(t, [0, DURATION], [0, 1], clamp);
  const total = String(sections.length).padStart(2, "0");
  return (
    <>
      {i >= 0 && t < hideFrom && (
        <Abs style={{ left: 104, top: 262, right: 104, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: prog(t, sections[i][0], 0.3) }}>
          <div style={{ ...mono(24), display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.lime, boxShadow: `0 0 14px ${C.lime}` }} />
            {sections[i][1]}
          </div>
          <div style={mono(24, C.muted)}>{String(i + 1).padStart(2, "0")} / {total}</div>
        </Abs>
      )}
      <Abs style={{ left: 104, right: 104, top: 1510, display: "flex", justifyContent: "space-between", ...mono(20, C.muted) }}>
        <span>{handle}</span>
        <span>{label}</span>
      </Abs>
      <Abs style={{ left: 104, right: 104, top: 1556, height: 3, background: "rgba(255,255,255,.08)" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: C.lime, boxShadow: `0 0 12px ${C.lime}` }} />
      </Abs>
    </>
  );
};

// ---------- subtítulos ----------
type Wd = (typeof WORDS)[number];
const CHUNKS: { s: number; e: number; w: Wd[] }[] = (() => {
  const out: { s: number; e: number; w: Wd[] }[] = [];
  let cur: Wd[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    if (/[.,?!:;]$/.test(w.w) || cur.length >= 4 || !next || next.s - w.e > 0.35) {
      out.push({ s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.4) : w.e + 0.4, w: cur });
      cur = [];
    }
  });
  return out;
})();
/** Subtítulos de una línea (máx. 4 palabras), palabra activa encendida, palabras clave en el acento */
export const SubsMG: React.FC<{ keywords: string[]; hideFrom: number; top?: number }> = ({ keywords, hideFrom, top = 1398 }) => {
  const t = useT();
  if (t >= hideFrom) return null;
  const c = CHUNKS.find((c) => t >= c.s - 0.05 && t < c.e);
  if (!c) return null;
  const keys = keywords.map(norm);
  return (
    <Abs style={{ left: 90, right: 90, top, textAlign: "center", fontFamily: TITLE, fontWeight: 500, fontSize: 46, color: C.text, textShadow: "0 4px 18px rgba(0,0,0,.9)" }}>
      {c.w.map((w, i) => {
        const on = t >= w.s - 0.03;
        const k = keys.includes(norm(w.w));
        return (
          <span key={i} style={{ opacity: on ? 1 : 0.35, color: k && on ? C.lime : C.text, fontWeight: k ? 700 : 500 }}>
            {w.w.replace(/[.,:;]$/, "")}{" "}
          </span>
        );
      })}
    </Abs>
  );
};

// ---------- texto ----------
/** Línea de título que entra con desenfoque (serif editorial; `italic` para la segunda línea en acento) */
export const Linea: React.FC<{ at: number; size: number; children: React.ReactNode; italic?: boolean; color?: string; style?: React.CSSProperties }> = ({ at, size, children, italic, color = C.text, style }) => {
  const t = useT();
  const p = prog(t, at, 0.45);
  return (
    <div style={{ fontFamily: italic ? SERIF_I : SERIF, fontWeight: 600, fontStyle: italic ? "italic" : "normal", fontSize: size, lineHeight: 1.02, color, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 8}px)`, ...style }}>
      {children}
    </div>
  );
};

/** Palabra grande que se tacha (mito, "teoría", "desaparecen") */
export const Tachado: React.FC<{ at: number; strikeAt: number; size?: number; color?: string; children: React.ReactNode }> = ({ at, strikeAt, size = 130, color = C.text, children }) => {
  const t = useT();
  const s = prog(t, strikeAt, 0.35);
  return (
    <div style={{ position: "relative", display: "inline-block", opacity: prog(t, at, 0.3) }}>
      <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: size, color, letterSpacing: "-0.03em" }}>{children}</div>
      <div style={{ position: "absolute", left: -10, top: "53%", height: Math.max(8, size * 0.08), width: `${s * 104}%`, background: C.violet, borderRadius: 6, boxShadow: `0 0 20px ${C.violet}` }} />
    </div>
  );
};

/** Código grande solo en contorno (siglas, nombres cortos). Máx. ~5 letras a 250 px. */
export const Contorno: React.FC<{ at: number; text: string; top: number; size?: number }> = ({ at, text, top, size = 250 }) => {
  const t = useT();
  const p = prog(t, at, 0.5);
  return (
    <Abs style={{ left: 0, right: 0, top, textAlign: "center", fontFamily: TITLE, fontWeight: 800, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1, color: "transparent", WebkitTextStroke: `3px ${C.lime}`, transform: `scale(${1.15 - 0.15 * p})` }}>
      {text}
    </Abs>
  );
};

// ---------- imágenes ----------
/** Ilustración o foto en tarjeta clara, con rótulo arriba y una etiqueta opcional (sello) abajo */
export const Ficha: React.FC<{ src?: string; label?: string; at: number; w: number; h: number; style?: React.CSSProperties; tag?: string; tagAt?: number; fit?: "cover" | "contain" }> = ({ src, label, at, w, h, style, tag, tagAt, fit = "cover" }) => {
  const t = useT();
  const s = pop(t, at, 0.5);
  const tg = tagAt === undefined ? 0 : prog(t, tagAt, 0.25);
  return (
    <Abs style={{ width: w, height: h, transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.4), ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: C.paper, boxShadow: `0 24px 60px rgba(0,0,0,.55), 0 0 0 2px ${C.lime}55` }}>
        {src ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit }} /> : null}
      </div>
      {label && <div style={{ position: "absolute", left: 16, top: 14, padding: "6px 14px", borderRadius: 30, background: "rgba(6,10,23,.82)", ...mono(20, C.mint), letterSpacing: "0.12em" }}>{label}</div>}
      {tag && (
        <div style={{ position: "absolute", right: 14, bottom: 14, padding: "6px 14px", borderRadius: 8, background: C.violet, color: C.onViolet, fontFamily: MONO, fontSize: 20, letterSpacing: "0.12em", opacity: tg, transform: `scale(${0.7 + 0.3 * tg})` }}>
          {tag}
        </div>
      )}
    </Abs>
  );
};

/** Ícono abstracto (anillos que giran con una sigla al centro): cuando NO hay ilustración real de algo */
export const Orbita: React.FC<{ size: number; text: string; style?: React.CSSProperties }> = ({ size, text, style }) => {
  const t = useT();
  return (
    <Abs style={{ width: size, height: size, ...style }}>
      {[1, 0.74, 0.48].map((k, i) => (
        <div key={i} style={{ position: "absolute", left: (size * (1 - k)) / 2, top: (size * (1 - k)) / 2, width: size * k, height: size * k, borderRadius: "50%", border: `3px solid ${i === 1 ? C.violet : C.lime}`, borderTopColor: "transparent", transform: `rotate(${(i % 2 ? -1 : 1) * t * 70 + i * 40}deg)`, opacity: 0.9 }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE, fontWeight: 800, fontSize: size * 0.2, color: C.text }}>{text}</div>
    </Abs>
  );
};

// ---------- datos y diagramas ----------
export type ItemLista = { code: string; name: string; at: number; img?: string };
/** Panel de lista con siglas y contador "03 / 05"; la fila que se nombra se enciende y su imagen salta al visor */
export const PanelLista: React.FC<{ title: string; items: ItemLista[]; top?: number; visor?: boolean }> = ({ title, items, top = 640, visor = true }) => {
  const t = useT();
  let cur = -1;
  items.forEach((r, i) => { if (t >= r.at) cur = i; });
  const n = Math.max(0, cur + 1);
  return (
    <>
      {visor && (
        <Abs style={{ right: 104, top: 330, width: 300, height: 250 }}>
          {items.map((r, i) => {
            const o = i === cur ? prog(t, r.at, 0.3) : 0;
            if (o <= 0) return null;
            return r.img ? (
              <Abs key={r.code} style={{ inset: 0, opacity: o, transform: `scale(${0.85 + 0.15 * o})` }}>
                <div style={{ width: 300, height: 250, borderRadius: 22, overflow: "hidden", background: C.paper, boxShadow: `0 0 0 2px ${C.lime}66, 0 20px 50px rgba(0,0,0,.5)` }}>
                  <Img src={staticFile(r.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </Abs>
            ) : (
              <Orbita key={r.code} size={230} text={r.code} style={{ left: 35, top: 10, opacity: o }} />
            );
          })}
        </Abs>
      )}
      <Abs style={{ left: 104, right: 104, top, padding: "34px 40px", borderRadius: 28, background: C.card, border: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono(22, C.muted), marginBottom: 18 }}>
          <span>{title}</span>
          <span style={{ color: C.lime }}>{String(n).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        </div>
        {items.map((r, i) => {
          const p = pop(t, r.at, 0.4);
          const on = i === cur;
          return (
            <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 26, height: 108, borderTop: i ? `1px solid ${C.line}` : "none", opacity: Math.min(1, p * 1.3), transform: `translateX(${(1 - p) * -40}px)` }}>
              <div style={{ width: 128, textAlign: "center", padding: "8px 0", borderRadius: 10, border: `2px solid ${on ? C.lime : C.line}`, background: on ? `${C.lime}22` : "transparent", fontFamily: MONO, fontSize: 24, color: on ? C.lime : C.mint }}>{r.code}</div>
              <div style={{ fontFamily: TITLE, fontWeight: on ? 700 : 500, fontSize: 42, color: on ? C.text : C.dim }}>{r.name}</div>
            </div>
          );
        })}
      </Abs>
    </>
  );
};

/**
 * Gráfico ESQUEMÁTICO de dos curvas que se cruzan (algo baja mientras otra cosa sube). Sin números: lleva
 * el rótulo "Esquema · sin escala". Si hay datos reales, usar Stat/Counter/Meter de lib.tsx, no esto.
 */
export const Esquema: React.FC<{ at: number; crossAt: number; labelA: string; labelB: string; eje?: string; top?: number }> = ({ at, crossAt, labelA, labelB, eje = "tiempo →", top = 560 }) => {
  const t = useT();
  const Wd = 872, H = 470;
  const pA = prog(t, at, 1.6), pB = prog(t, crossAt - 0.8, 1.4);
  const A = (x: number) => (x < 0.32 ? 0.84 : 0.84 - 0.7 * Math.pow((x - 0.32) / 0.68, 0.9));
  const B = (x: number) => 0.08 + 0.78 * Math.pow(Math.max(0, x - 0.12) / 0.88, 1.15);
  const path = (f: (x: number) => number, until: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) { const x = (i / 80) * until; pts.push(`${(x * Wd).toFixed(1)},${((1 - f(x)) * H).toFixed(1)}`); }
    return "M" + pts.join(" L");
  };
  const lim = pB > 0 ? 0.32 + 0.68 * pB : 0.32 * pA;
  const lab = pop(t, crossAt, 0.45);
  return (
    <Abs style={{ left: 104, top, width: Wd, padding: "30px 0 0", borderRadius: 28, background: C.card, border: `1px solid ${C.line}` }}>
      <div style={{ ...mono(20, C.muted), padding: "0 34px 18px", display: "flex", justifyContent: "space-between" }}>
        <span>Esquema · sin escala</span><span>{eje}</span>
      </div>
      <svg width={Wd} height={H + 40} style={{ display: "block" }}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={Wd} y1={g * H} y2={g * H} stroke={C.gridSoft} />)}
        <path d={path(A, Math.min(lim, 1))} fill="none" stroke={C.violet} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.violet}88)` }} />
        {pB > 0 && <path d={path(B, 0.12 + 0.88 * pB)} fill="none" stroke={C.lime} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.lime}88)` }} />}
        {lab > 0 && <circle cx={0.62 * Wd} cy={(1 - A(0.62)) * H} r={12 + 10 * lab} fill="none" stroke={C.text} strokeWidth={3} opacity={lab} />}
      </svg>
      <div style={{ display: "flex", gap: 34, padding: "4px 34px 28px", fontFamily: TITLE, fontSize: 30, color: C.text }}>
        <span style={{ opacity: pA }}><b style={{ color: C.violet }}>━</b> {labelA}</span>
        <span style={{ opacity: prog(t, crossAt - 0.8, 0.4) }}><b style={{ color: C.lime }}>━</b> {labelB}</span>
      </div>
    </Abs>
  );
};

/** Flujo vertical de 3 pasos (cajas + flecha que se dibuja); el último paso queda encendido */
export const Flujo: React.FC<{ nodes: { at: number; label: string }[]; top?: number; gap?: number }> = ({ nodes, top = 420, gap = 330 }) => {
  const t = useT();
  return (
    <>
      {nodes.map((nd, i) => {
        const p = pop(t, nd.at, 0.45);
        const last = i === nodes.length - 1;
        const y = top + i * gap;
        const arrow = prog(t, nd.at + 0.35, 0.5);
        return (
          <React.Fragment key={i}>
            <Abs style={{ left: 150, right: 150, top: y, height: 190, borderRadius: 26, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", background: last ? `${C.lime}26` : C.card, border: `2px solid ${last ? C.lime : C.line}`, boxShadow: last ? `0 0 50px ${C.lime}44` : "0 20px 50px rgba(0,0,0,.4)", opacity: Math.min(1, p * 1.3), transform: `scale(${0.8 + 0.2 * p})` }}>
              <div style={mono(30, last ? C.lime : C.muted)}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: SERIF_I, fontStyle: "italic", fontWeight: 600, fontSize: 60, lineHeight: 1.0, color: C.text }}>{nd.label}</div>
            </Abs>
            {!last && <Abs style={{ left: 538, top: y + 200, width: 4, height: (gap - 210) * arrow, background: `linear-gradient(${C.lime}, ${C.lime}00)` }} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Red: un nodo central que late y hasta 6 factores alrededor, unidos con líneas que se dibujan */
export const Red: React.FC<{ at: number; centro: [string, string]; factores: { at: number; l: [string, string] }[]; cx?: number; cy?: number }> = ({ at, centro, factores, cx = 540, cy = 930 }) => {
  const t = useT();
  const rx = 300, ry = 360;
  const c = pop(t, at, 0.5);
  const pulse = 1 + 0.06 * Math.sin(t * 5);
  const step = 360 / factores.length;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {factores.map((f, i) => {
          const a = (-90 + i * step) * (Math.PI / 180);
          const p = prog(t, f.at - 0.1, 0.45);
          return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * rx * p} y2={cy + Math.sin(a) * ry * p} stroke={C.lime} strokeWidth={2.5} strokeDasharray="8 8" opacity={0.7 * p} />;
        })}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.gridSoft} strokeWidth={2} />
      </svg>
      <Abs style={{ left: cx - 130, top: cy - 130, width: 260, height: 260, borderRadius: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `${C.violet}22`, border: `3px solid ${C.violet}`, boxShadow: `0 0 ${50 * pulse}px ${C.violet}66`, transform: `scale(${c * pulse})` }}>
        <div style={mono(22, C.violet)}>{centro[0]}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 46, color: C.text }}>{centro[1]}</div>
      </Abs>
      {factores.map((f, i) => {
        const a = (-90 + i * step) * (Math.PI / 180);
        const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        const p = pop(t, f.at, 0.45);
        const on = t >= f.at && (i === factores.length - 1 || t < factores[i + 1].at);
        return (
          <Abs key={i} style={{ left: x - 150, top: y - 62, width: 300, height: 124, borderRadius: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: on ? `${C.lime}2a` : C.cardSolid, border: `2px solid ${on ? C.lime : C.line}`, opacity: Math.min(1, p * 1.4), transform: `scale(${0.6 + 0.4 * p})` }}>
            <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 33, color: C.text, lineHeight: 1.05, textAlign: "center" }}>{f.l[0]}</div>
            <div style={{ fontFamily: TITLE, fontWeight: 500, fontSize: 30, color: C.mint, lineHeight: 1.05 }}>{f.l[1]}</div>
          </Abs>
        );
      })}
    </>
  );
};

/** Fichas que se reemplazan una tras otra: sigla gigante en contorno + imagen (u Orbita) + frase con triángulo */
export const Fichas: React.FC<{ items: { a: number; b: number; code: string; img?: string; what: string }[] }> = ({ items }) => {
  const t = useT();
  return (
    <>
      {items.map((s, i) => {
        const o = vis(t, s.a, s.b, 0.22, 0.18);
        if (o <= 0) return null;
        const p = prog(t, s.a, 0.5);
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <Contorno at={s.a} text={s.code} top={330} />
            <Abs style={{ left: 104, top: 600, ...mono(22, C.muted) }}>Ficha {i + 1}/{items.length}</Abs>
            {s.img ? (
              <Abs style={{ left: 190, top: 650, width: 700, height: 450, borderRadius: 30, overflow: "hidden", background: C.paper, boxShadow: `0 0 0 2px ${C.lime}66, 0 30px 70px rgba(0,0,0,.6)`, transform: `translateY(${(1 - p) * 60}px)` }}>
                <Img src={staticFile(s.img)} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scale(${1 + 0.05 * prog(t, s.a, 3)})` }} />
              </Abs>
            ) : (
              <Orbita size={420} text={s.code} style={{ left: 330, top: 660 }} />
            )}
            <Abs style={{ left: 104, right: 104, top: 1150, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 0, height: 0, flexShrink: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderLeft: `40px solid ${C.lime}` }} />
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 1.0, color: C.text, opacity: prog(t, s.a + 0.15, 0.4) }}>{s.what}</div>
            </Abs>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/** Cuadrícula de 2 columnas: una primera ficha en naranja ("el dato") y las demás se encienden al nombrarlas.
 *  La última, si es larga, ocupa las dos columnas. */
export const Tablero: React.FC<{ first: { at: number; l: string; tag: string }; items: { at: number; l: string }[]; top?: number }> = ({ first, items, top = 600 }) => {
  const t = useT();
  const all = [first, ...items];
  const wideLast = all.length % 2 === 0;
  return (
    <Abs style={{ left: 104, right: 104, top, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      {all.map((c, i) => {
        const p = pop(t, c.at, 0.4);
        const isFirst = i === 0;
        const wide = wideLast && i === all.length - 1;
        return (
          <div key={i} style={{ gridColumn: wide ? "1 / span 2" : undefined, height: 150, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: isFirst ? `${C.violet}22` : `${C.lime}1c`, border: `2px solid ${isFirst ? C.violet : C.lime}`, opacity: Math.min(1, p * 1.3), transform: `scale(${0.7 + 0.3 * p})` }}>
            <span style={{ fontFamily: TITLE, fontWeight: 700, fontSize: wide ? 44 : 46, color: C.text }}>{c.l}</span>
            <span style={mono(22, isFirst ? C.violet : C.lime)}>{isFirst ? first.tag : "✓"}</span>
          </div>
        );
      })}
    </Abs>
  );
};

/** Barra de N segmentos con `lit` encendidos ("una pista, no la historia completa") */
export const Segmentos: React.FC<{ at: number; n: number; lit: number; top: number }> = ({ at, n, lit, top }) => {
  const t = useT();
  const p = prog(t, at, 0.5);
  return (
    <Abs style={{ left: 150, right: 150, top, display: "flex", gap: 14 }}>
      {Array.from({ length: n }).map((_, k) => (
        <div key={k} style={{ flex: 1, height: 26, borderRadius: 6, background: k < lit ? C.lime : "rgba(255,255,255,.08)", border: `1px solid ${C.line}`, boxShadow: k < lit ? `0 0 18px ${C.lime}` : "none", opacity: k < lit ? 1 : p }} />
      ))}
    </Abs>
  );
};

/** Bloques que caen y arman una cuadrícula 3x3 (al decir "estructura", "sistema", "orden") */
export const Bloques: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 34px)", gap: 6 }}>
      {Array.from({ length: 9 }).map((_, k) => {
        const p = prog(t, at + k * 0.05, 0.2);
        return <div key={k} style={{ width: 34, height: 34, borderRadius: 6, background: C.lime, opacity: p, transform: `translateY(${(1 - p) * -30}px)` }} />;
      })}
    </div>
  );
};

/** Cierre: foto redonda + nombre + rol, "Comenta" y la palabra en botón que brilla */
export const CierreCTA: React.FC<{ at: number; foto?: string; nombre: string; rol?: string; palabra: string; texto: string }> = ({ at, foto, nombre, rol, palabra, texto }) => {
  const t = useT();
  if (t < at - 0.05) return null;
  const p = pop(t, at, 0.5);
  const k = pop(t, at + 0.25, 0.5);
  const glow = 0.5 + 0.5 * Math.sin((t - at) * 5);
  return (
    <AbsoluteFill style={{ opacity: prog(t, at, 0.25) }}>
      <Abs style={{ left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {foto && (
          <div style={{ width: 230, height: 230, borderRadius: 115, overflow: "hidden", border: `4px solid ${C.lime}`, boxShadow: `0 0 50px ${C.lime}55`, transform: `scale(${p})` }}>
            <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 46, color: C.text, marginTop: 26, opacity: p }}>{nombre}</div>
        {rol && <div style={{ ...mono(22, C.mint), marginTop: 6, opacity: p }}>{rol}</div>}
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 84, color: C.text, marginTop: 70, opacity: prog(t, at + 0.1, 0.3) }}>Comenta</div>
        <div style={{ marginTop: 18, padding: "26px 70px", borderRadius: 80, background: C.violet, color: C.onViolet, fontFamily: TITLE, fontWeight: 800, fontSize: 104, letterSpacing: "0.02em", transform: `scale(${k})`, boxShadow: `0 0 ${40 + 40 * glow}px ${C.violet}aa` }}>
          {palabra}
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 500, fontSize: 46, color: C.text, marginTop: 40, opacity: prog(t, at + 0.6, 0.4), textAlign: "center" }}>{texto}</div>
      </Abs>
    </AbsoluteFill>
  );
};
