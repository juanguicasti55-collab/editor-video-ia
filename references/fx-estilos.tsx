// Estilos con código del menú (references/menu-efectos.md): C subtítulos · H ganchos · K cierres · A apoyos · D detrás · T cámara · G look.
// T8, T9 y A11 salen de una lista de «códigos» de video de otro creador (6-nov-2026): solo la idea, armada aquí. Copiar a remotion/src/estilos.tsx.
// Agregados el 2026-11-06 a partir de un catálogo de estilos de creadora (Brand Nat Style Pack): se tomó la idea de cada
// estilo, no su código ni sus textos. Probados en un reel vertical 1080×1920 (anuncio BBE Black R5).
//
// Necesita de theme.ts: C, TITLE, BODY, HAND. Carga sus propias fuentes (Instrument Serif y Oswald).
// Lo que dice «detrás» (CifraDetras, GraficaDetras, Look en la capa de atrás) va en el `behind` de Cam2 (fx.tsx) y necesita
// el recorte de scripts/mascaras.py en esos tramos.
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile } from "remotion";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { C, TITLE, BODY, HAND } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";
import { CamKeyV } from "./reel";

const { fontFamily: FINA } = loadInstrumentSerif("normal", { weights: ["400"], subsets: ["latin"] });
loadInstrumentSerif("italic", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: ANGOSTA } = loadOswald("normal", { weights: ["300", "700"], subsets: ["latin"] });

const SOMBRA = "0 3px 12px rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.35)";
const limpia = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,;:¿?¡!«»"“”…]/g, "");
const sinPunto = (w: string) => w.replace(/[,.;:]$/, "");
const fuera = (t: number, ocultar: [number, number][]) => ocultar.some(([a, b]) => t >= a && t <= b);

// ---------- bloques de subtítulos (frases cortas que cortan en pausas y puntuación) ----------
type W = (typeof WORDS)[number];
type Bloque = { words: W[]; s: number; e: number };
const bloques = (max: number): Bloque[] => {
  const out: Bloque[] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const fin = /[.?!»]$/.test(w.w);
    const coma = /[,;:]$/.test(w.w);
    const pausa = nx ? nx.s - w.e > 0.3 : true;
    if (cur.length >= max || fin || ((coma || pausa) && cur.length >= 2) || !nx) {
      out.push({ words: cur, s: cur[0].s, e: nx ? Math.min(nx.s, w.e + 0.35) : w.e + 0.5 });
      cur = [];
    }
  });
  return out;
};
const B4 = bloques(4), B5 = bloques(5);

export type EstiloSubs = "c2" | "c4" | "c5" | "c6" | "c7" | "c8" | "c9";
/**
 * Subtítulos por código (C1 = SubsDoc de fx-documental, manuscrita + clave en gruesa):
 * c2 una palabra gigante · c4 chicas + CLAVE grande · c5 frase con la clave en pastilla blanca · c6 línea blanca + remate
 * de color que entra desenfocado · c7 mayúsculas espaciadas + clave en serif cursiva grande · c8 una línea en mayúsculas
 * pequeñas bajo el mentón · c9 escalera (cada palabra baja un escalón; la clave en serif cursiva subrayada).
 * `claves` sin tildes y en minúsculas. `y` = arriba del bloque (c9: arriba de la escalera). `x` solo para c9 (columna libre).
 */
export const SubsEstilo: React.FC<{ estilo: EstiloSubs; claves: string[]; ocultar: [number, number][]; y?: number | ((t: number) => number); x?: number; color?: string }> = ({
  estilo, claves, ocultar, y = 1380, x = 90, color = C.lime,
}) => {
  const t = useT();
  if (fuera(t, ocultar)) return null;
  const k = new Set(claves);
  const es = (w: W) => k.has(limpia(w.w));
  const top = typeof y === "function" ? y(t) : y;

  if (estilo === "c2") {
    const w = WORDS.find((p, i) => t >= p.s && t < (WORDS[i + 1]?.s ?? p.e + 0.4));
    if (!w) return null;
    const p = pop(t, w.s, 0.18);
    const txt = sinPunto(w.w).toUpperCase();
    const fs = Math.min(150, Math.floor(940 / (txt.length * 0.62)));
    return (
      <div style={{ position: "absolute", top, left: 40, right: 140, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: fs, letterSpacing: -2,
        color: es(w) ? color : "#fff", textShadow: SOMBRA, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2) }}>{txt}</div>
    );
  }

  const lista = estilo === "c8" || estilo === "c9" ? B5 : B4;
  const b = lista.find((c) => t >= c.s && t < c.e);
  if (!b) return null;
  const p = pop(t, b.s, 0.25);

  if (estilo === "c4" || estilo === "c5") {
    return (
      <div style={{ position: "absolute", top, left: 40, right: 140, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px",
        opacity: Math.min(1, p * 2) }}>
        {b.words.map((w, i) => {
          const dicha = t >= w.s;
          const wp = pop(t, w.s, 0.22);
          const txt = sinPunto(w.w);
          if (estilo === "c4") {
            return es(w) ? (
              <span key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: -3, color, textShadow: SOMBRA,
                opacity: dicha ? 1 : 0.25, transform: `scale(${dicha ? 0.85 + 0.15 * wp : 0.85})` }}>{txt.toUpperCase()}</span>
            ) : (
              <span key={i} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 54, color: "#fff", textShadow: SOMBRA, opacity: dicha ? 1 : 0.35 }}>{txt.toLowerCase()}</span>
            );
          }
          return (
            <span key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 70, lineHeight: 1.15, letterSpacing: -1, opacity: dicha ? 1 : 0, transform: `translateY(${(1 - wp) * 18}px)`,
              ...(es(w) ? { background: "#fff", color: "#111", padding: "2px 22px 6px", borderRadius: 40, boxShadow: "0 8px 24px rgba(0,0,0,.35)" } : { color: "#fff", textShadow: SOMBRA }) }}>{txt}</span>
          );
        })}
      </div>
    );
  }

  if (estilo === "c6" || estilo === "c7") {
    const normales = b.words.filter((w) => !es(w));
    const remate = b.words.filter(es);
    const salida = prog(t, b.e - 0.18, 0.18);
    const rAt = remate[0]?.s ?? b.e;
    const rp = prog(t, rAt, 0.3);
    return (
      <div style={{ position: "absolute", top, left: 40, right: 140, textAlign: "center", opacity: Math.min(1, p * 2) * (1 - salida), filter: salida ? `blur(${salida * 10}px)` : undefined }}>
        {estilo === "c6" ? (
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 52, color: "#fff", textShadow: SOMBRA }}>{normales.map((w) => sinPunto(w.w).toLowerCase()).join(" ")}</div>
        ) : (
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, letterSpacing: 10, color: "#fff", textShadow: SOMBRA, textTransform: "uppercase" }}>{normales.map((w) => sinPunto(w.w)).join(" ")}</div>
        )}
        {remate.length > 0 && t >= rAt && (
          <div style={{ overflow: estilo === "c7" ? "hidden" : "visible", marginTop: 6 }}>
            <div style={estilo === "c6"
              ? { fontFamily: TITLE, fontWeight: 900, fontSize: 116, letterSpacing: -3, lineHeight: 1, color, textShadow: SOMBRA, filter: `blur(${(1 - rp) * 12}px)`, opacity: rp }
              : { fontFamily: FINA, fontStyle: "italic", fontSize: 150, lineHeight: 1, color: "#fff", textShadow: SOMBRA, transform: `translateY(${(1 - rp) * 100}%)` }}>
              {remate.map((w) => sinPunto(w.w)).join(" ")}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (estilo === "c8") {
    return (
      <div style={{ position: "absolute", top, left: 80, right: 140, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 40, letterSpacing: 3, textTransform: "uppercase",
        color: "#fff", textShadow: SOMBRA, opacity: Math.min(1, p * 2) }}>
        {b.words.map((w, i) => <span key={i} style={{ opacity: t >= w.s ? 1 : 0.35, color: es(w) ? color : "#fff" }}>{sinPunto(w.w)} </span>)}
      </div>
    );
  }

  // c9 escalera
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0 }}>
      {b.words.map((w, i) => {
        if (t < w.s) return null;
        const wp = pop(t, w.s, 0.25);
        const clave = es(w);
        const up = prog(t, w.s + 0.15, 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: x + i * 70, top: i * 92, whiteSpace: "nowrap", opacity: Math.min(1, wp * 2), transform: `translateY(${(1 - wp) * 24}px)` }}>
            <span style={clave
              ? { fontFamily: FINA, fontStyle: "italic", fontSize: 112, lineHeight: 0.9, color, textShadow: SOMBRA }
              : { fontFamily: TITLE, fontWeight: 800, fontSize: 64, letterSpacing: -1.5, color: "#fff", textShadow: SOMBRA }}>{sinPunto(w.w)}</span>
            {clave && <div style={{ height: 6, borderRadius: 3, background: color, width: `${up * 100}%`, marginTop: 2 }} />}
          </div>
        );
      })}
    </div>
  );
};

// ---------- ganchos (visibles desde el cuadro 0) ----------
export type EstiloGancho = "h3" | "h4" | "h5" | "h6";
/**
 * h3 mayúsculas crema con borde café + línea caramelo · h4 recorte (serif cursiva fina sobre palabra gruesa en minúscula)
 * · h5 etiqueta a mano en mayúsculas sobre título grueso en minúscula (con `fondo`, sobre una banda de color) · h6 dos pesos
 * (mayúsculas gruesas sobre mayúsculas finas angostas), sube y se va al terminar. (H1 = HookTitle de reel.tsx, H2 = BehindText.) `chica` = línea de arriba, `grande` = la que manda.
 */
export const GanchoEstilo: React.FC<{ estilo: EstiloGancho; chica: string; grande: string; to: number; from?: number; top?: number; color?: string; fondo?: string }> = ({
  estilo, chica, grande, to, from = 0, top = 260, color = C.lime, fondo,
}) => {
  const t = useT();
  if (t < from || t > to + 0.4) return null;
  const p = from <= 0 ? 1 : pop(t, from, 0.45);
  const sale = prog(t, to, 0.35);
  const base: React.CSSProperties = { position: "absolute", top, left: 50, right: 50, textAlign: "center", opacity: (1 - sale) * Math.min(1, p * 2),
    transform: `translateY(${-sale * 60 + (1 - p) * 30}px)` };
  const caja = fondo ? { background: fondo, borderRadius: 30, padding: "26px 34px 32px" } : {};
  if (estilo === "h6") {
    return (
      <div style={base}>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(118, Math.floor(1380 / chica.length)), letterSpacing: -2, lineHeight: 0.95, color: "#fff", textShadow: SOMBRA, textTransform: "uppercase", whiteSpace: "nowrap" }}>{chica}</div>
        <div style={{ fontFamily: ANGOSTA, fontWeight: 300, fontSize: Math.min(112, Math.floor(1900 / grande.length)), letterSpacing: 6, whiteSpace: "nowrap", lineHeight: 1.05, color: "#fff", textShadow: SOMBRA, textTransform: "uppercase" }}>{grande}</div>
      </div>
    );
  }
  if (estilo === "h4") {
    return (
      <div style={base}>
        <div style={{ fontFamily: FINA, fontStyle: "italic", fontSize: 68, color: "#fff", textShadow: SOMBRA, lineHeight: 1 }}>{chica}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(140, Math.floor(1500 / grande.length)), letterSpacing: -4, lineHeight: 0.95, color, textShadow: SOMBRA, textTransform: "lowercase" }}>{grande}</div>
      </div>
    );
  }
  if (estilo === "h5") {
    return (
      <div style={{ ...base, ...caja }}>
        <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 58, letterSpacing: 2, textTransform: "uppercase", color: fondo ? "#2a2116" : color, textShadow: fondo ? "none" : SOMBRA }}>{chica}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(110, Math.floor(1500 / grande.length)), letterSpacing: -3, lineHeight: 1, color: fondo ? "#111" : "#fff", textShadow: fondo ? "none" : SOMBRA, textTransform: "lowercase" }}>{grande}</div>
      </div>
    );
  }
  // h3
  return (
    <div style={base}>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(120, Math.floor(1600 / grande.length)), letterSpacing: 1, lineHeight: 1, color: "#F6E7C8", textTransform: "uppercase",
        WebkitTextStroke: "7px #3B2416", paintOrder: "stroke fill", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.35))" }}>{grande}</div>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 66, color: "#E3A15E", marginTop: 10, textShadow: "0 2px 0 #3B2416, 0 4px 14px rgba(0,0,0,.4)" }}>{chica}</div>
    </div>
  );
};

// ---------- cierres «Comenta PALABRA» (orgánico) ----------
const ARO = "conic-gradient(from 200deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5, #feda75)";
const DEGRADE = "linear-gradient(90deg, #fa7e1e, #d62976 45%, #962fbf 75%, #4f5bd5)";
const escribe = (txt: string, t: number, at: number, cps = 16) => txt.slice(0, Math.max(0, Math.floor((t - at) * cps)));

/** K2 · Tarjeta blanca con aro de color: escribe «Comenta» y aparece la palabra grande en degradado. Nada más en la tarjeta. */
export const ComentaCTA: React.FC<{ from: number; palabra: string; to?: number; top?: number; verbo?: string }> = ({ from, palabra, to = 1e9, top = 1050, verbo = "Comenta" }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.5);
  const tv = from + 0.35;
  const tp = tv + verbo.length / 16 + 0.15;
  const kp = pop(t, tp, 0.45);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.3)) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30, background: "#fff", borderRadius: 44, padding: "28px 46px 28px 30px", boxShadow: "0 24px 70px rgba(0,0,0,.45)",
        transform: `scale(${0.7 + 0.3 * p})` }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: ARO, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(t - from) * 40}deg)` }}>
          <div style={{ width: 104, height: 104, borderRadius: 52, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${-(t - from) * 40}deg)` }}>
            <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth={2.2} strokeLinejoin="round"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5z" /></svg>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 46, color: "#111", minHeight: 56 }}>{escribe(verbo, t, tv)}</div>
          {t >= tp && (
            <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(128, Math.floor(1100 / palabra.length)), letterSpacing: -2, lineHeight: 1, backgroundImage: DEGRADE,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", transform: `scale(${0.7 + 0.3 * kp})`, transformOrigin: "0% 50%" }}>{palabra}</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * K3 · Hoja de comentarios oscura delante del pecho: la palabra se escribe en la caja, se publica y le cae un corazón. Sin logo de ninguna red.
 * `respuesta` (opcional): 0,6 s después del corazón aparece la respuesta de la cuenta («Te lo envío por mensaje»): muestra que
 * al comentar sí llega algo. Solo si esa respuesta automática existe de verdad.
 */
export const ComentarioEnVivo: React.FC<{ from: number; palabra: string; usuario?: string; to?: number; top?: number; respuesta?: { quien: string; texto: string } }> = ({ from, palabra, usuario = "tú", to = 1e9, top = 980, respuesta }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  const tw = from + 0.4;
  const publicado = tw + palabra.length / 10 + 0.35;
  const pub = t >= publicado;
  const cp = pop(t, publicado, 0.4);
  const corazon = t >= publicado + 0.6;
  return (
    <div style={{ position: "absolute", top, left: 90, right: 90, borderRadius: 36, background: "rgba(18,18,20,.94)", padding: "26px 30px", boxShadow: "0 30px 80px rgba(0,0,0,.5)",
      opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.3)), transform: `translateY(${(1 - p) * 120}px)` }}>
      <div style={{ textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,.75)", marginBottom: 18 }}>Comentarios</div>
      {pub && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, opacity: Math.min(1, cp * 2), transform: `translateY(${(1 - cp) * 30}px)` }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: ARO, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,.6)" }}>{usuario} · ahora</div>
            <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 52, color: "#fff" }}>{palabra}</div>
          </div>
          <svg width={54} height={54} viewBox="0 0 24 24" style={{ transform: `scale(${corazon ? 0.8 + 0.4 * pop(t, publicado + 0.6, 0.4) : 1})` }}>
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill={corazon ? "#ff3b5c" : "none"} stroke={corazon ? "#ff3b5c" : "#fff"} strokeWidth={2} />
          </svg>
        </div>
      )}
      {pub && respuesta && t >= publicado + 1.2 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "-6px 0 20px 82px", opacity: Math.min(1, pop(t, publicado + 1.2, 0.4) * 2),
          transform: `translateY(${(1 - pop(t, publicado + 1.2, 0.4)) * 24}px)` }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: C.lime, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,.6)" }}>{respuesta.quien} · ahora</div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, color: "#fff" }}>{respuesta.texto}</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 40, border: "2px solid rgba(255,255,255,.25)", padding: "14px 24px" }}>
        <div style={{ flex: 1, fontFamily: BODY, fontWeight: 600, fontSize: 40, color: pub ? "rgba(255,255,255,.4)" : "#fff" }}>
          {pub ? "Agrega un comentario…" : <>{escribe(palabra, t, tw, 10)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span></>}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: "#4f8cff", opacity: pub ? 0.4 : 1 }}>Publicar</div>
      </div>
    </div>
  );
};

// ---------- apoyos tipo iPhone ----------
/** A5 · Notificación que baja desde arriba con lo que se acaba de decir. `icono` = 1–2 letras o emoji (sin logos ajenos). */
export const Notificacion: React.FC<{ from: number; to: number; app: string; titulo: string; texto: string; icono?: string; top?: number; colorIcono?: string }> = ({
  from, to, app, titulo, texto, icono = "•", top = 250, colorIcono = C.lime,
}) => {
  const t = useT();
  if (t < from || t > to + 0.4) return null;
  const p = pop(t, from, 0.45);
  const y = (1 - p) * -260 - prog(t, to, 0.35) * 300;
  return (
    <div style={{ position: "absolute", top, left: 60, right: 140, transform: `translateY(${y}px)` }}>
      <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "24px 28px", borderRadius: 40, background: "rgba(245,245,247,.86)", backdropFilter: "blur(24px)",
        boxShadow: "0 20px 50px rgba(0,0,0,.35)" }}>
        <div style={{ width: 84, height: 84, borderRadius: 20, background: colorIcono, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: TITLE, fontWeight: 900, fontSize: 40, color: "#fff" }}>{icono}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontWeight: 600, fontSize: 26, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
            <span>{app}</span><span style={{ textTransform: "none" }}>ahora</span></div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 36, color: "#111" }}>{titulo}</div>
          <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 32, color: "#222", lineHeight: 1.2 }}>{texto}</div>
        </div>
      </div>
    </div>
  );
};

/** A6 · Anillo de vidrio que cuenta hasta el número que se dice (en ~1,8 s) y se va. */
export const AnilloCuenta: React.FC<{ from: number; to: number; valor: number; sufijo?: string; etiqueta?: string; x?: number; y?: number; color?: string }> = ({
  from, to, valor, sufijo = "", etiqueta, x = 540, y = 1050, color = C.lime,
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.4);
  const k = prog(t, from + 0.1, 1.8);
  const ease = 1 - Math.pow(1 - k, 3);
  const R = 150, L = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: x - 190, top: y - 190, width: 380, height: 380, borderRadius: 190, background: "rgba(255,255,255,.16)", backdropFilter: "blur(20px)",
      border: "2px solid rgba(255,255,255,.3)", opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.3)), transform: `scale(${0.7 + 0.3 * p})` }}>
      <svg width={380} height={380} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={190} cy={190} r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={18} />
        <circle cx={190} cy={190} r={R} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - ease)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textShadow: SOMBRA }}>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 110, letterSpacing: -3, lineHeight: 1 }}>{Math.round(valor * ease)}{sufijo}</div>
        {etiqueta && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32 }}>{etiqueta}</div>}
      </div>
    </div>
  );
};

/** A7 · Widget de calendario que pasa los años para un salto en el tiempo («hace 10 años»). */
export const Calendario: React.FC<{ from: number; to: number; desde: number; hasta: number; mes?: string; top?: number }> = ({ from, to, desde, hasta, mes = "ENERO", top = 980 }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  const k = prog(t, from + 0.3, 1.2);
  const anio = Math.round(desde + (hasta - desde) * (1 - Math.pow(1 - k, 2)));
  const flip = (t * 14) % 1;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.3)) }}>
      <div style={{ width: 380, borderRadius: 48, background: "#fff", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.4)", transform: `scale(${0.7 + 0.3 * p})` }}>
        <div style={{ background: "#ff3b30", color: "#fff", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 40, padding: "14px 0", letterSpacing: 4 }}>{mes}</div>
        <div style={{ textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 130, color: "#111", padding: "20px 0 30px", letterSpacing: -4,
          transform: k < 1 ? `rotateX(${flip * 60}deg)` : undefined }}>{anio}</div>
      </div>
    </div>
  );
};

/** A8 · Línea fija arriba durante todo el video (el llamado a la acción desde el segundo 1). */
export const BannerFijo: React.FC<{ texto: string; to: number; from?: number; top?: number; color?: string }> = ({ texto, to, from = 0, top = 232, color = "#fff" }) => {
  const t = useT();
  if (t < from || t > to) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 58, color, textShadow: SOMBRA,
      opacity: prog(t, from, 0.3) * (1 - prog(t, to - 0.2, 0.2)) }}>{texto}</div>
  );
};

/** A9 · Serie numerada: título fijo arriba, contador 01/10 y la etiqueta grande de cada ítem cuando se dice. */
export const Serie: React.FC<{ titulo: string; items: { at: number; t: string }[]; to: number; top?: number; color?: string }> = ({ titulo, items, to, top = 240, color = C.lime }) => {
  const t = useT();
  if (t < items[0].at - 0.4 || t > to) return null;
  const i = Math.max(0, items.filter((x) => t >= x.at).length - 1);
  const cur = items[i];
  const p = pop(t, cur.at, 0.35);
  const n = (v: number) => String(v).padStart(2, "0");
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", opacity: prog(t, items[0].at - 0.4, 0.3) * (1 - prog(t, to - 0.2, 0.2)) }}>
      <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 46, color: "#fff", textShadow: SOMBRA }}>{titulo}</div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,.8)", letterSpacing: 4, marginTop: 6 }}>{n(i + 1)}/{n(items.length)}</div>
      {t >= cur.at && <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: Math.min(110, Math.floor(1500 / cur.t.length)), letterSpacing: -2, color, textShadow: SOMBRA,
        transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2) }}>{cur.t}</div>}
    </div>
  );
};

/** A10 · Nota a mano con flecha dibujada que apunta a algo (x,y de la nota; ax,ay a dónde apunta). */
export const NotaFlecha: React.FC<{ from: number; to: number; texto: string; x: number; y: number; ax: number; ay: number; color?: string }> = ({ from, to, texto, x, y, ax, ay, color = "#fff" }) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.35);
  const d = prog(t, from + 0.2, 0.45);
  const sx = x + 60, sy = y + 70;
  const mx = (sx + ax) / 2 + (ay - sy) * 0.25, my = (sy + ay) / 2 - (ax - sx) * 0.25;
  const ang = Math.atan2(ay - my, ax - mx);
  const head = (a: number) => `${ax - 34 * Math.cos(ang + a)},${ay - 34 * Math.sin(ang + a)}`;
  const o = 1 - prog(t, to, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: x, top: y, fontFamily: HAND, fontWeight: 700, fontSize: 60, color, textTransform: "uppercase", textShadow: SOMBRA,
        transform: `rotate(-4deg) scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2), whiteSpace: "nowrap" }}>{texto}</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
        <path d={`M${sx},${sy} Q${mx},${my} ${ax},${ay}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
        {d >= 1 && <polyline points={`${head(0.5)} ${ax},${ay} ${head(-0.5)}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- detrás de la persona (en el `behind` de Cam2) ----------
/** D5 · Número gigante que cuenta detrás de la cabeza al decir la cifra. Solo cifras reales. */
export const CifraDetras: React.FC<{ from: number; to: number; valor: number; prefijo?: string; sufijo?: string; top: number; size?: number; color?: string; dur?: number }> = ({
  from, to, valor, prefijo = "", sufijo = "", top, size = 360, color = "#fff", dur = 1.2,
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const k = prog(t, from, dur);
  const v = Math.round(valor * (1 - Math.pow(1 - k, 3)));
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.05, lineHeight: 0.9,
      color, textShadow: "0 10px 50px rgba(0,0,0,.4)", opacity: prog(t, from, 0.2) * (1 - prog(t, to - 0.2, 0.2)) }}>{prefijo}{v.toLocaleString("es-CO")}{sufijo}</div>
  );
};

/** D6 · Gráfica de línea que se dibuja en la pared y se dispara al final con brillo. `puntos` 0–1 (datos reales o forma ilustrativa sin números). */
export const GraficaDetras: React.FC<{ from: number; to: number; top?: number; puntos?: number[]; etiqueta?: string; color?: string }> = ({
  from, to, top = 240, puntos = [0.2, 0.25, 0.22, 0.32, 0.3, 0.45, 0.95], etiqueta, color = "#FFE14D",
}) => {
  const t = useT();
  if (t < from || t > to) return null;
  const W = 960, H = 520, x0 = 60;
  const pts = puntos.map((v, i) => [x0 + (i / (puntos.length - 1)) * W, top + H - v * H]);
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  const k = prog(t, from + 0.15, Math.max(0.6, (to - from) * 0.6));
  const ult = pts[pts.length - 1];
  return (
    <AbsoluteFill style={{ opacity: prog(t, from, 0.25) * (1 - prog(t, to - 0.2, 0.2)) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3].map((r) => <line key={r} x1={x0} x2={x0 + W} y1={top + (r * H) / 3} y2={top + (r * H) / 3} stroke="rgba(255,255,255,.18)" strokeWidth={2} />)}
        <path d={d} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k}
          style={{ filter: `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 30px ${color}88)` }} />
        {k >= 1 && <circle cx={ult[0]} cy={ult[1]} r={18 * pop(t, from + 0.15 + Math.max(0.6, (to - from) * 0.6), 0.3)} fill={color} />}
      </svg>
      {etiqueta && k >= 1 && (
        <div style={{ position: "absolute", left: ult[0] - 300, top: ult[1] - 110, width: 280, textAlign: "right" }}>
          <span style={{ background: color, color: "#111", fontFamily: TITLE, fontWeight: 900, fontSize: 46, padding: "8px 24px", borderRadius: 40 }}>{etiqueta} ↗</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- cámara, transición y look ----------
/**
 * T5 · Zoom digital: salto seco a la cara en la palabra clave (sin desenfoque) y vuelta. Devuelve los keys de cámara nuevos.
 * Usar con <Vineta golpes={...}/>: la viñeta acompaña el salto. `fy` = altura de la cara en % (caras.py: (top+bottom)/2/1920*100).
 */
export const conZoomDigital = (keys: CamKeyV[], golpes: { at: number; to: number; zoom?: number; fy?: number }[]): CamKeyV[] => {
  const out = [...keys];
  for (const g of golpes) {
    const prev = [...out].filter((k) => k.at <= g.at).pop() ?? out[0];
    out.push({ ...prev, at: g.at, zoom: g.zoom ?? 1.35, fy: g.fy ?? 32 });
    const despues = [...out].filter((k) => k.at <= g.to && k.at !== g.at).pop() ?? prev;
    out.push({ ...despues, at: g.to });
  }
  return out.sort((a, b) => a.at - b.at);
};
export const Vineta: React.FC<{ golpes: { at: number; to: number }[] }> = ({ golpes }) => {
  const t = useT();
  const g = golpes.find((x) => t >= x.at && t < x.to);
  if (!g) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 35%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)" }} />;
};

/** T6 · Barrido circular del color de la marca para cambiar de sección (el círculo crece, cubre y se abre al siguiente plano). */
export const CirculoWipe: React.FC<{ at: number; color?: string; x?: number; y?: number }> = ({ at, color = C.lime, x = 540, y = 960 }) => {
  const t = useT();
  if (t < at - 0.3 || t > at + 0.35) return null;
  const crece = prog(t, at - 0.3, 0.3);
  const abre = prog(t, at, 0.35);
  const r = 2300 * (1 - Math.pow(1 - crece, 2));
  return (
    <AbsoluteFill style={{ WebkitMaskImage: abre > 0 ? `radial-gradient(circle at ${x}px ${y}px, transparent ${abre * 2300}px, #000 ${abre * 2300 + 2}px)` : undefined }}>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: color }} />
    </AbsoluteFill>
  );
};

export type EstiloLook = "g1" | "g2" | "g3";
/**
 * Look de color encima de la cámara y debajo de los textos: g1 cálido de cine (tono cálido + viñeta) · g2 sepia suave cálido
 * (va bien con la órbita y una línea en serif cursiva) · g3 editorial oscuro (sala oscurecida, tono petróleo, viñeta).
 * (G4 = documental cálido de fx-documental.tsx.) g3 se ve mejor dentro del `behind` de Cam2 con recorte: la sala se oscurece y la persona queda iluminada.
 */
export const Look: React.FC<{ estilo: EstiloLook; until: number; from?: number }> = ({ estilo, until, from = 0 }) => {
  const t = useT();
  if (t < from || t > until) return null;
  if (estilo === "g1") return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(255,150,70,.12)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 42%, rgba(0,0,0,0) 55%, rgba(25,10,0,.5) 100%)" }} />
    </AbsoluteFill>
  );
  if (estilo === "g2") return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backdropFilter: "sepia(.35) saturate(.85) contrast(1.04)" }} />
      <AbsoluteFill style={{ background: "rgba(255,225,180,.14)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 42%, rgba(0,0,0,0) 60%, rgba(40,25,10,.4) 100%)" }} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,.38)" }} />
      <AbsoluteFill style={{ background: "rgba(0,110,120,.16)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 40%, rgba(0,0,0,0) 35%, rgba(0,0,0,.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- congelar, barrido de color y ranking ----------
/**
 * T8 · Congelar imagen: el cuadro del segundo `at` se queda quieto como foto con borde blanco, girada, sobre el video
 * oscurecido, con una etiqueta («Esa era yo»). La voz sigue. Sonido: click al congelar. Dura 0,6–1,2 s.
 */
export const Congelar: React.FC<{ at: number; to: number; etiqueta?: string; fps?: number; color?: string }> = ({ at, to, etiqueta, fps = 30, color = C.lime }) => {
  const t = useT();
  if (t < at || t > to) return null;
  const p = pop(t, at, 0.3);
  const o = 1 - prog(t, to - 0.15, 0.15);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "rgba(0,0,0,.55)" }} />
      <div style={{ position: "absolute", left: 120, top: 250, width: 840, height: 1300, border: "16px solid #fff", borderRadius: 8, overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,.55)", transform: `rotate(${-3 * p}deg) scale(${1.25 - 0.25 * p})` }}>
        <Freeze frame={Math.round(at * fps)}>
          <OffthreadVideo src={staticFile("cam.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.85) contrast(1.05)" }} />
        </Freeze>
      </div>
      {etiqueta && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", opacity: prog(t, at + 0.15, 0.2) }}>
          <span style={{ background: color, color: "#111", fontFamily: TITLE, fontWeight: 900, fontSize: 64, padding: "10px 34px", borderRadius: 14, display: "inline-block",
            transform: `rotate(-3deg) scale(${0.8 + 0.2 * pop(t, at + 0.15, 0.3)})` }}>{etiqueta}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * T9 · Barrido de color: desde `from` la imagen va en blanco y negro; en `at` una línea de luz cruza la pantalla y deja el
 * color detrás (el «antes» gris y el «después» a color). Va encima de la cámara y debajo de los textos.
 */
export const BarridoColor: React.FC<{ from: number; at: number; dur?: number; color?: string }> = ({ from, at, dur = 0.6, color = "#fff" }) => {
  const t = useT();
  if (t < from || t > at + dur + 0.1) return null;
  const k = prog(t, at, dur);
  const x = 1080 * (1 - Math.pow(1 - k, 2));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: x, right: 0, backdropFilter: "grayscale(1) contrast(1.08) brightness(.95)" }} />
      {t >= at && k < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: x - 4, width: 8, background: color, boxShadow: `0 0 30px 10px ${color}aa` }} />}
    </AbsoluteFill>
  );
};

/**
 * A11 · Ranking (tabla por niveles) que se llena mientras se dice: cada ítem cae en su fila cuando se nombra.
 * Ocupa ~520 px de alto: usarlo con la cara abajo (plano abierto o la cámara en la mitad de abajo), nunca sobre la cara.
 */
export const Ranking: React.FC<{ from: number; to: number; top?: number; filas?: { n: string; color: string }[]; items: { at: number; fila: number; t: string }[]; titulo?: string }> = ({
  from, to, top = 240, items, titulo,
  filas = [{ n: "S", color: "#FF7F7F" }, { n: "A", color: "#FFBF7F" }, { n: "B", color: "#FFDF7F" }, { n: "C", color: "#BFFF7F" }],
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.4);
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.3)), transform: `translateY(${(1 - p) * -40}px)` }}>
      {titulo && <div style={{ textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 54, color: "#fff", textShadow: SOMBRA, marginBottom: 12 }}>{titulo}</div>}
      <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
        {filas.map((f, i) => (
          <div key={i} style={{ display: "flex", height: 116, background: "rgba(20,20,22,.92)", borderTop: i ? "3px solid #000" : undefined }}>
            <div style={{ width: 116, flexShrink: 0, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 60, color: "#111" }}>{f.n}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", overflow: "hidden" }}>
              {items.filter((x) => x.fila === i && t >= x.at).map((x, j) => {
                const q = pop(t, x.at, 0.35);
                return (
                  <div key={j} style={{ background: "#fff", color: "#111", fontFamily: TITLE, fontWeight: 800, fontSize: 38, padding: "10px 20px", borderRadius: 14, whiteSpace: "nowrap",
                    transform: `translateY(${(1 - q) * -90}px) scale(${0.85 + 0.15 * q})`, opacity: Math.min(1, q * 2) }}>{x.t}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
