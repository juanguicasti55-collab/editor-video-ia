// Piezas «editoriales» del menú (references/menu-efectos.md): C10 · H7 · A12–A15 · D8 · D10. (D9 y G5–G7 se retiraron el 8-nov-2026.)
// Salen del análisis de reels de un creador de edición con IA (7-nov-2026): se tomó la idea de cada efecto, no su código,
// sus textos ni su marca. Probadas en un reel vertical 1080×1920. Copiar a remotion/src/editorial.tsx del reel.
//
// Necesita de theme.ts: C, TITLE, BODY, FINA (las letras y los colores salen de la marca de cada video, nunca de aquí).
// D10 (Clones) usa el recorte de scripts/mascaras.py (public/fg/… y src/mascaras.ts).
// Si el reel no tiene recorte y usas otras piezas: crea src/mascaras.ts con
//   export const ULTIMA_MASCARA = 0; export const TOPS: number[] = [];
//
// Dónde va cada una:
// · en el `behind` de Cam2 (detrás de la persona): GanchoEstudio (H7), Clones (D10)
// · encima de la cámara, debajo de los textos: PalabraVentana (D8)
// · encima de todo: SubsKaraoke (C10), BarraPedido (A12), RelojMaterial (A13), ListaLateral (A14), CursorVivo (A15)
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, TITLE, BODY, FINA } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";
import { ULTIMA_MASCARA } from "./mascaras";

const SERIF_ED = FINA;

const CREMA = "#F4EEDF";
const TINTA = "#16130F";
const SOMBRA = "0 10px 30px rgba(0,0,0,.35)";
const sinPunto = (w: string) => w.replace(/[,.;:]$/, "");
const fuera = (t: number, r: [number, number][]) => r.some(([a, b]) => t >= a && t <= b);
const claro = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};
const fgSrc = (f: number) => staticFile(`fg/${String(Math.max(0, Math.min(ULTIMA_MASCARA, f))).padStart(5, "0")}.webp`);
const dentroDe = (t: number, from: number, to: number, cola = 0.3) => t >= from && t <= to + cola;
/** 1 → 0 al salir (los últimos `d` segundos). */
const sale = (t: number, to: number, d = 0.25) => 1 - prog(t, to - d, d);

// ---------- C10 · subtítulos karaoke en pastilla ----------
type W = (typeof WORDS)[number];
const bloques = (max: number) => {
  const out: { words: W[]; s: number; e: number }[] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const corte = /[.?!»]$/.test(w.w) || (/[,;:]$/.test(w.w) && cur.length >= 2) || (nx ? nx.s - w.e > 0.3 && cur.length >= 2 : true);
    if (cur.length >= max || corte || !nx) { out.push({ words: cur, s: cur[0].s, e: nx ? Math.min(nx.s, w.e + 0.35) : w.e + 0.5 }); cur = []; }
  });
  return out;
};
/**
 * C10 · Subtítulo karaoke: frase corta (2–4 palabras) en serif, chica, sobre una pastilla del color de la marca. Las palabras
 * ya dichas van en crema y las que faltan, apagadas: se lee al ritmo de la voz. Discreto y caro. Siempre bajo el mentón.
 * `ocultar` = tramos donde otra pieza ya muestra el texto.
 */
export const SubsKaraoke: React.FC<{ ocultar?: [number, number][]; y?: number | ((t: number) => number); fondo?: string; tinta?: string; apagada?: string; size?: number; max?: number }> = ({
  ocultar = [], y = 1400, fondo = C.bg, tinta = CREMA, apagada = "rgba(244,238,223,.38)", size = 46, max = 4,
}) => {
  const t = useT();
  const B = React.useMemo(() => bloques(max), [max]);
  if (fuera(t, ocultar)) return null;
  const b = B.find((c) => t >= c.s && t < c.e);
  if (!b) return null;
  const top = typeof y === "function" ? y(t) : y;
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, display: "flex", justifyContent: "center", opacity: prog(t, b.s, 0.1) }}>
      <div style={{ background: fondo, padding: "6px 20px 10px", borderRadius: 6, fontFamily: SERIF_ED, fontSize: size, lineHeight: 1.15, boxShadow: SOMBRA, textAlign: "center" }}>
        {b.words.map((w, i) => (
          <span key={i} style={{ color: t >= w.s - 0.02 ? tinta : apagada }}>{sinPunto(w.w)}{i < b.words.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};

// ---------- H7 · gancho en estudio ----------
export type LineaEstudio = { at: number; t: string; estilo: "serif" | "gruesa" | "cursiva"; color?: string; chica?: string };
/**
 * H7 · Gancho en estudio: el fondo se vuelve un color plano de la marca y detrás de la cabeza pasan 2–3 frases cortas,
 * cada una en otra letra (serif fina · gruesa en mayúsculas · serif cursiva de acento). Va en el `behind` de Cam2 con
 * recorte, desde el cuadro 0 hasta ~2,5 s. Cada línea reemplaza a la anterior (`apilar` las deja juntas).
 * `top` = arriba de la línea (con la cabeza en y≈350 funciona ≈ 120–200).
 */
export const GanchoEstudio: React.FC<{ from?: number; to: number; fondo?: string; lineas: LineaEstudio[]; top?: number; acento?: string; apilar?: boolean }> = ({
  from = 0, to, fondo = C.bg, lineas, top = 150, acento = "#C9A15A", apilar = false,
}) => {
  const t = useT();
  if (!dentroDe(t, from, to)) return null;
  const o = sale(t, to + 0.3, 0.3);
  const vis = lineas.map((l, i) => ({ l, i, on: t >= l.at && (apilar || i === lineas.length - 1 || t < lineas[i + 1].at) })).filter((x) => x.on);
  return (
    <AbsoluteFill style={{ background: fondo, opacity: o }}>
      <div style={{ position: "absolute", top, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {vis.map(({ l, i }) => {
          const p = pop(t, l.at, 0.4);
          const base: React.CSSProperties = { transform: `translateY(${(1 - p) * 40}px)`, opacity: Math.min(1, p * 1.6), textAlign: "center", lineHeight: 0.92 };
          const st: React.CSSProperties = l.estilo === "gruesa"
            ? { fontFamily: TITLE, fontWeight: 900, fontSize: 150, textTransform: "uppercase", letterSpacing: -4, color: l.color ?? CREMA }
            : l.estilo === "cursiva"
              ? { fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 165, color: l.color ?? acento }
              : { fontFamily: SERIF_ED, fontSize: 210, textTransform: "uppercase", letterSpacing: -2, color: l.color ?? CREMA };
          return (
            <div key={i} style={base}>
              {l.chica && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "rgba(244,238,223,.7)", marginBottom: 8 }}>{l.chica}</div>}
              <div style={st}>{l.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- A12 · barra de pedido ----------
/**
 * A12 · Barra de pedido: una barra tipo chat de IA escribe lo que la persona le pide («hazlo más elegante») y, en `hecho`,
 * se vuelve una palabra en serif cursiva con un visto. Para mostrar el pedido → resultado. `etiqueta` = a quién se le pide.
 */
export const BarraPedido: React.FC<{ from: number; to: number; texto: string; hecho?: { at: number; t: string }; etiqueta?: string; top?: number; vel?: number; color?: string }> = ({
  from, to, texto, hecho, etiqueta = "Tu pedido", top = 260, vel = 22, color = C.bg,
}) => {
  const t = useT();
  if (!dentroDe(t, from, to)) return null;
  const p = pop(t, from, 0.4);
  const n = Math.floor(Math.max(0, t - from - 0.25) * vel);
  const listo = hecho && t >= hecho.at;
  const hp = listo ? pop(t, hecho!.at, 0.4) : 0;
  return (
    <div style={{ position: "absolute", top, left: 90, right: 90, opacity: Math.min(1, p * 2) * sale(t, to), transform: `translateY(${(1 - p) * -40}px) scale(${listo ? 0.92 + 0.08 * hp : 1})` }}>
      <div style={{ background: CREMA, borderRadius: 28, padding: "16px 22px 18px 30px", boxShadow: "0 20px 50px rgba(0,0,0,.35)", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "rgba(22,19,15,.45)", marginBottom: 4 }}>{listo ? "Hecho" : etiqueta}</div>
          {listo
            ? <div style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 50, color: TINTA, lineHeight: 1.05 }}>{hecho!.t}</div>
            : <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 38, color: TINTA, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}>
                {texto.slice(0, n)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span>
              </div>}
        </div>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={CREMA} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            {listo ? <path d="M5 12.5l4.5 4.5L19 7" /> : <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>}
          </svg>
        </div>
      </div>
    </div>
  );
};

// ---------- A13 · reloj de material ----------
const mmss = (s: number) => { const v = Math.max(0, Math.round(s)); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`; };
/**
 * A13 · Reloj de material: un reloj de fichas cuenta de la duración cruda a la final (1:07 → 0:52) mientras se dice
 * cuánto se cortó. Solo duraciones reales (las da cut.py / reel_prep.py). Arriba, una etiqueta chica que cambia al terminar.
 */
export const RelojMaterial: React.FC<{ from: number; to: number; desde: number; hasta: number; etiquetaDesde?: string; etiquetaHasta?: string; top?: number; dur?: number; color?: string }> = ({
  from, to, desde, hasta, etiquetaDesde = "Material grabado", etiquetaHasta = "Video final", top = 260, dur = 1.2, color = C.bg,
}) => {
  const t = useT();
  if (!dentroDe(t, from, to)) return null;
  const p = pop(t, from, 0.4);
  const k = prog(t, from + 0.35, dur);
  const v = desde + (hasta - desde) * k;
  const txt = mmss(v);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 2) * sale(t, to), transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: CREMA, background: color, padding: "6px 16px", borderRadius: 6, marginBottom: 12 }}>{k >= 1 ? etiquetaHasta : etiquetaDesde}</div>
      <div style={{ display: "flex", gap: 10, padding: 14, background: color, borderRadius: 18, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
        {txt.split("").map((ch, i) => ch === ":"
          ? <div key={i} style={{ fontFamily: SERIF_ED, fontSize: 130, color: CREMA, lineHeight: 1, alignSelf: "center" }}>:</div>
          : <div key={i} style={{ width: 104, height: 150, borderRadius: 10, background: "rgba(255,255,255,.07)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: SERIF_ED, fontSize: 140, color: CREMA, lineHeight: 1 }}>
              {ch}
              <div style={{ position: "absolute", left: 0, right: 0, top: 74, height: 2, background: "rgba(0,0,0,.45)" }} />
            </div>)}
      </div>
    </div>
  );
};

// ---------- A14 · lista lateral que avanza ----------
/**
 * A14 · Lista lateral: un panel angosto a un costado con todos los puntos del video; el que se está diciendo se marca en
 * blanco y arriba va el contador «03 / 12». Para videos de lista larga (tips, herramientas, efectos). No va sobre la cara:
 * con la persona al centro, el panel cabe en los ~300 px del costado. `pie` = una pastilla al final (ej. «+ 10 más»).
 */
export const ListaLateral: React.FC<{ from: number; to: number; items: { at: number; t: string }[]; titulo?: string; lado?: "izq" | "der"; top?: number; ancho?: number; pie?: string; color?: string; acento?: string }> = ({
  from, to, items, titulo = "La lista", lado = "der", top = 300, ancho = 300, pie, color = C.bg, acento = "#C9A15A",
}) => {
  const t = useT();
  if (!dentroDe(t, from, to)) return null;
  const p = prog(t, from, 0.45);
  let act = -1;
  items.forEach((it, i) => { if (t >= it.at) act = i; });
  const pos: React.CSSProperties = lado === "der" ? { right: 30 } : { left: 30 };
  return (
    <div style={{ position: "absolute", top, width: ancho, ...pos, background: color, borderRadius: 14, padding: "14px 12px 16px", boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      opacity: p * sale(t, to), transform: `translateX(${(1 - p) * (lado === "der" ? 60 : -60)}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontWeight: 700, fontSize: 17, letterSpacing: 3, textTransform: "uppercase", color: "rgba(244,238,223,.6)", padding: "0 8px 10px" }}>
        <span>{titulo}</span><span>{String(Math.max(1, act + 1)).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
      </div>
      {items.map((it, i) => {
        const on = i === act;
        const hp = on ? pop(t, it.at, 0.3) : 0;
        return (
          <div key={i} style={{ fontFamily: BODY, fontWeight: on ? 700 : 500, fontSize: 22, lineHeight: 1.2, padding: "5px 10px", borderRadius: 6, marginBottom: 2,
            background: on ? CREMA : "transparent", color: on ? TINTA : i < act ? "rgba(244,238,223,.85)" : "rgba(244,238,223,.5)", transform: `scale(${on ? 0.96 + 0.04 * hp : 1})`, transformOrigin: "0% 50%" }}>
            {it.t}
          </div>
        );
      })}
      {pie && <div style={{ marginTop: 10, display: "inline-block", fontFamily: BODY, fontWeight: 700, fontSize: 18, color: TINTA, background: acento, padding: "4px 12px", borderRadius: 6 }}>{pie}</div>}
    </div>
  );
};

// ---------- A15 · cursor en vivo ----------
/**
 * A15 · Cursor en vivo: un cursor con una etiqueta («Claude», «Tú») se mueve por la pantalla como en un editor compartido y,
 * si hay `caja`, dibuja un recuadro de selección con sus medidas. Para «la IA lo hace sola» o para señalar algo.
 * `puntos` en px del cuadro 1080×1920, en orden de tiempo.
 */
export const CursorVivo: React.FC<{ from: number; to: number; puntos: { at: number; x: number; y: number }[]; etiqueta?: string; caja?: { at: number; x: number; y: number; w: number; h: number }; color?: string }> = ({
  from, to, puntos, etiqueta = "Claude", caja, color = "#C9A15A",
}) => {
  const t = useT();
  if (!dentroDe(t, from, to)) return null;
  let x = puntos[0].x, y = puntos[0].y;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1], b = puntos[i];
    if (t >= a.at) { const k = prog(t, a.at, Math.max(0.15, b.at - a.at)); x = a.x + (b.x - a.x) * k; y = a.y + (b.y - a.y) * k; }
  }
  const o = prog(t, from, 0.2) * sale(t, to);
  const cp = caja ? prog(t, caja.at, 0.45) : 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {caja && t >= caja.at && (
        <div style={{ position: "absolute", left: caja.x, top: caja.y, width: caja.w * cp, height: caja.h * cp, border: `3px solid ${color}` }}>
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], i) => (
            <div key={i} style={{ position: "absolute", left: `calc(${cx * 100}% - 9px)`, top: `calc(${cy * 100}% - 9px)`, width: 18, height: 18, background: "#fff", border: `3px solid ${color}` }} />
          ))}
          <div style={{ position: "absolute", left: "50%", top: -56, transform: "translateX(-50%)", fontFamily: BODY, fontWeight: 700, fontSize: 24, color: TINTA, background: color, padding: "4px 12px", borderRadius: 6, whiteSpace: "nowrap", opacity: prog(t, caja.at + 0.35, 0.2) }}>
            {Math.round(caja.w)} × {Math.round(caja.h)}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: x, top: y }}>
        <svg width={52} height={60} viewBox="0 0 24 28" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.5))" }}>
          <path d="M2 2l18 11-8 1.5L8 24z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: 40, top: 44, fontFamily: BODY, fontWeight: 700, fontSize: 24, color: TINTA, background: color, padding: "3px 12px", borderRadius: 6, whiteSpace: "nowrap" }}>{etiqueta}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- D8 · palabra ventana ----------
/**
 * D8 · Palabra ventana: la pantalla se vuelve un color plano con UNA palabra gigante y el video se ve solo DENTRO de las
 * letras. 0,8–1,5 s, en el remate de una frase («salta.», «nunca.»). No necesita recorte. Fondo claro o oscuro.
 * Palabras de 4–6 letras; más largas, bajar `size`.
 */
export const PalabraVentana: React.FC<{ from: number; to: number; palabra: string; fondo?: string; size?: number; y?: number }> = ({
  from, to, palabra, fondo = CREMA, size = 400, y = 960,
}) => {
  const t = useT();
  if (!dentroDe(t, from, to, 0.2)) return null;
  const luz = claro(fondo);
  const p = prog(t, from, 0.5);
  return (
    <AbsoluteFill style={{ background: fondo, mixBlendMode: luz ? "screen" : "multiply", opacity: prog(t, from, 0.12) * sale(t, to, 0.2) }}>
      <div style={{ position: "absolute", left: -200, right: -200, top: y, transform: `translateY(-50%) scale(${1.25 - 0.25 * p})`, textAlign: "center",
        fontFamily: SERIF_ED, fontSize: size, lineHeight: 1, letterSpacing: -8, color: luz ? "#000" : "#fff" }}>{palabra}</div>
    </AbsoluteFill>
  );
};

// ---------- D10 · clones ----------
/**
 * D10 · Clones en fila: copias de la persona aparecen a los lados (detrás de ella), para «todos hacen lo mismo», «otra vez»,
 * «x3». Va en el `behind` de Cam2 con recorte. `n` = copias por lado (1–2). Las copias van un poco más chicas y oscuras.
 */
export const Clones: React.FC<{ from: number; to: number; n?: number; sep?: number; escala?: number }> = ({ from, to, n = 1, sep = 330, escala = 0.82 }) => {
  const t = useT();
  const f = useCurrentFrame();
  if (!dentroDe(t, from, to, 0.2)) return null;
  const copias: { dx: number; k: number; i: number }[] = [];
  for (let i = 1; i <= n; i++) { copias.push({ dx: -sep * i, k: escala ** i, i }); copias.push({ dx: sep * i, k: escala ** i, i }); }
  return (
    <AbsoluteFill>
      {copias.map((c, j) => {
        const p = pop(t, from + 0.08 * j, 0.4);
        return (
          <Img key={j} src={fgSrc(f)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transformOrigin: "50% 100%",
            transform: `translateX(${c.dx * p}px) scale(${c.k})`, opacity: Math.min(1, p * 1.5) * sale(t, to, 0.2), filter: `brightness(${1 - 0.18 * c.i}) saturate(.9)` }} />
        );
      })}
    </AbsoluteFill>
  );
};
