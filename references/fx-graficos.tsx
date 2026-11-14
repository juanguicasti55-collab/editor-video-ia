// Piezas del menú sacadas del análisis de reels de 4 cuentas (7-nov-2026): H8–H9 · C11–C12 · D11–D13 · T10 · A16–A23 ·
// K5–K6 · I1–I4. Se tomó la idea de cada efecto, nunca su código, sus textos ni su marca. Probadas en un reel 1080×1920.
// Copiar a remotion/src/graficos.tsx del reel. Necesita de theme.ts: C, TITLE, BODY, FINA, ANGOSTA, SERIF_GRUESA.
// Letras y colores: salen del theme.ts de cada video (C.lime = acento, C.violet = segundo color), que se llena con la marca.
//
// Dónde va cada una:
// · en el `behind` de Cam2 (con recorte): NumeroSeccion (D11), VidrioAcanalado (D12), CintaDeLuz (D13)
// · pantalla completa (tapan la cámara; la voz sigue): AntesDespues (A17), Pictograma (I1), CifraGrafica (I2),
//   ArticuloResaltado (I3), PalabraPantalla (I4), BotonBrillo (K5)
// · encima de la cámara: el resto. CamaraSaltos (T10) va justo después de Cam2.
// Datos: A16, A19, A21, I2 e I3 muestran cifras, vistas, estudios o artículos: SOLO reales (con su fuente). H9 muestra un
// comentario: solo uno que alguien escribió de verdad.
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, TITLE, BODY, FINA, ANGOSTA, SERIF_GRUESA } from "./theme";
import { WORDS } from "./words";
import { useT, prog, pop } from "./lib";

const SERIF_G = FINA;
const ANGOSTA_G = ANGOSTA;

const AMARILLO = C.lime; // acento de la marca (el nombre quedó del primer ejemplo)
const CREMA = "#F4EEDF";
const SOMBRA = "0 3px 14px rgba(0,0,0,.55)";
const limpia = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,;:¿?¡!«»"“”…]/g, "");
const sinPunto = (w: string) => w.replace(/[,.;:]$/, "");
const fuera = (t: number, r: [number, number][]) => r.some(([a, b]) => t >= a && t <= b);
const en = (t: number, from: number, to: number, cola = 0.3) => t >= from && t <= to + cola;
const sale = (t: number, to: number, d = 0.25) => 1 - prog(t, to - d, d);
const CamFoto: React.FC<{ at: number; style?: React.CSSProperties }> = ({ at, style }) => {
  const { fps } = useVideoConfig();
  return <Freeze frame={Math.round(at * fps)}><OffthreadVideo src={staticFile("cam.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} /></Freeze>;
};

// =====================================================================  SUBTÍTULOS
/**
 * C11 · Palabra a palabra con cursiva: una sola palabra a la vez, blanca y gruesa; las palabras clave cambian a serif
 * cursiva amarilla más grande. Simple y muy legible (el estilo de los reels con más vistas de la muestra).
 * Opcional (estilo «Palabra grande», 13-nov-2026):
 *  · `mano`: tramos en letra a mano → [[desde, hasta, MANO.b, "#color"?], …] (la frase sale en esa letra, por defecto en el acento).
 *  · `lado`: tramos en que la palabra se va al costado de la cabeza → [[desde, hasta, "izq" | "der"], …], a la altura `yLado`.
 *    Elegir el lado libre de la cara (scripts/caras.py) y nunca encima de la cara.
 */
export const SubsPalabra: React.FC<{ claves: string[]; ocultar?: [number, number][]; y?: number; color?: string; size?: number;
  mano?: [number, number, string, string?][]; lado?: [number, number, "izq" | "der"][]; yLado?: number }> = ({
  claves, ocultar = [], y = 1180, color = AMARILLO, size = 96, mano = [], lado = [], yLado = 760,
}) => {
  const t = useT();
  if (fuera(t, ocultar)) return null;
  const i = WORDS.findIndex((w, k) => t >= w.s - 0.03 && t < (WORDS[k + 1] ? WORDS[k + 1].s - 0.03 : w.e + 0.4));
  if (i < 0) return null;
  const w = WORDS[i];
  const clave = claves.includes(limpia(w.w));
  const p = pop(t, w.s - 0.03, 0.22);
  const m = mano.find(([a, b]) => w.s >= a && w.s < b);
  const l = lado.find(([a, b]) => w.s >= a && w.s < b);
  const txt = w.w.replace(/[¿¡]/g, "").replace(/[,;:.?!…]+$/, "");
  const fs = l ? Math.min(size * 0.75, Math.floor(400 / (txt.length * 0.5))) : size;
  const pos: React.CSSProperties = l
    ? { top: yLado, ...(l[2] === "izq" ? { left: 60, textAlign: "left" as const } : { right: 60, textAlign: "right" as const }), width: 420 }
    : { top: y, left: 40, right: 40, textAlign: "center" };
  const sh = l ? "0 2px 6px rgba(0,0,0,.7), 0 0 26px rgba(0,0,0,.55), 0 0 60px rgba(0,0,0,.35)" : SOMBRA; // al costado suele caer sobre fondo claro
  if (m && !l) {
    // tramo a mano: la frase completa se va armando palabra por palabra (como «edits app on desktop» de la referencia). Tramos CORTOS: 3–5 palabras (con 10 queda chiquita)
    const frase = WORDS.filter((q) => q.s >= m[0] && q.s < m[1] && q.s <= t + 0.03).map((q) => q.w.replace(/[¿¡]/g, "").replace(/[,;:.?!…]+$/, "").toLowerCase()).join(" ");
    const total = WORDS.filter((q) => q.s >= m[0] && q.s < m[1]).map((q) => q.w).join(" ").length;
    const fsM = Math.min(size * 0.95, Math.floor(1800 / (Math.max(total, 10) * 0.55)));
    return (
      <div style={{ position: "absolute", top: y - fsM * 0.3, left: 70, right: 70, textAlign: "center", lineHeight: 1.05 }}>
        <span style={{ fontFamily: m[2], fontSize: fsM, color: m[3] ?? color, letterSpacing: fsM * 0.05, textShadow: SOMBRA, display: "inline-block", transform: "rotate(-2deg)" }}>{frase}</span>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", ...pos, transform: `scale(${0.88 + 0.12 * p})`, transformOrigin: l ? (l[2] === "izq" ? "0 50%" : "100% 50%") : "50% 50%" }}>
      <span style={clave
        ? { fontFamily: SERIF_G, fontStyle: "italic", fontSize: fs * 1.25, color, textShadow: sh }
        : m ? { fontFamily: m[2], fontSize: fs * 0.95, color: m[3] ?? color, letterSpacing: fs * 0.06, textShadow: sh, display: "inline-block", transform: "rotate(-2deg)" }
        : { fontFamily: TITLE, fontWeight: 800, fontSize: fs, color: "#fff", letterSpacing: -2, textShadow: sh }}>{m ? txt.toLowerCase() : txt}</span>
    </div>
  );
};

const bloques3 = () => {
  const out: { words: (typeof WORDS)[number][]; s: number; e: number }[] = [];
  let cur: (typeof WORDS)[number][] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (cur.length >= 3 || /[.,?!;:]$/.test(w.w) || !nx || nx.s - w.e > 0.3) { out.push({ words: cur, s: cur[0].s, e: nx ? Math.min(nx.s, w.e + 0.3) : w.e + 0.4 }); cur = []; }
  });
  return out;
};
const Esquinas: React.FC<{ color: string; p: number }> = ({ color, p }) => (
  <>{[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
    <span key={i} style={{ position: "absolute", width: 18, height: 18, left: x ? undefined : -14 - 8 * (1 - p), right: x ? -14 - 8 * (1 - p) : undefined,
      top: y ? undefined : -10 - 6 * (1 - p), bottom: y ? -10 - 6 * (1 - p) : undefined, borderColor: color, borderStyle: "solid",
      borderWidth: `${y ? 0 : 4}px ${x ? 4 : 0}px ${y ? 4 : 0}px ${x ? 0 : 4}px`, opacity: p }} />
  ))}</>
);
/** C12 · Corchetes: frase corta en mayúsculas blancas; la palabra clave en amarillo dentro de cuatro esquinas que se cierran sobre ella. */
export const SubsCorchetes: React.FC<{ claves: string[]; ocultar?: [number, number][]; y?: number; color?: string }> = ({ claves, ocultar = [], y = 1300, color = AMARILLO }) => {
  const t = useT();
  const B = React.useMemo(bloques3, []);
  if (fuera(t, ocultar)) return null;
  const b = B.find((c) => t >= c.s && t < c.e);
  if (!b) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 50, letterSpacing: 3, textTransform: "uppercase",
      color: "#fff", textShadow: SOMBRA, opacity: prog(t, b.s, 0.1) }}>
      {b.words.map((w, i) => {
        const k = claves.includes(limpia(w.w));
        return <span key={i} style={{ position: "relative", color: k ? color : undefined, margin: k ? "0 18px" : undefined }}>
          {sinPunto(w.w)}{k && <Esquinas color={color} p={prog(t, w.s, 0.25)} />}{i < b.words.length - 1 ? " " : ""}</span>;
      })}
    </div>
  );
};

// =====================================================================  GANCHOS
/**
 * H8 · Frase que se arma: el gancho aparece línea por línea arriba y se queda armado (3–5 líneas cortas). Las líneas con
 * `cursiva` van en serif cursiva amarilla y más grandes: lo que importa. Visible desde el cuadro 0.
 */
export const FraseQueSeArma: React.FC<{ from?: number; to: number; lineas: { at: number; t: string; cursiva?: boolean }[]; top?: number; color?: string }> = ({
  from = 0, to, lineas, top = 240, color = AMARILLO,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, textAlign: "center", opacity: sale(t, to + 0.3), lineHeight: 0.98 }}>
      {lineas.filter((l) => t >= l.at - 0.02).map((l, i) => {
        const p = pop(t, l.at, 0.3);
        return <div key={i} style={{ transform: `translateY(${(1 - p) * 20}px)`, opacity: Math.min(1, p * 2),
          ...(l.cursiva ? { fontFamily: SERIF_G, fontStyle: "italic", fontSize: 110, color } : { fontFamily: TITLE, fontWeight: 700, fontSize: 84, color: "#fff", letterSpacing: -2 }),
          textShadow: SOMBRA }}>{l.t}</div>;
      })}
    </div>
  );
};

/**
 * H9 · Respuesta a comentario: arriba la burbuja blanca de un comentario REAL («Respondiendo a @usuario»), debajo un titular
 * condensado y una línea en serif cursiva que lo responde. Gancho de polémica o de objeción. Visible desde el cuadro 0.
 */
export const RespuestaComentario: React.FC<{ from?: number; to: number; usuario: string; comentario: string; titular: string; cursiva?: string; top?: number; etiqueta?: string }> = ({
  from = 0, to, usuario, comentario, titular, cursiva, top = 230, etiqueta,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = from <= 0 ? 1 : pop(t, from, 0.4);
  const p2 = from <= 0 ? 1 : pop(t, from + 0.25, 0.4);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, opacity: sale(t, to + 0.3) }}>
      <div style={{ background: "#fff", borderRadius: 22, padding: "16px 22px", display: "flex", gap: 16, alignItems: "center", boxShadow: "0 16px 40px rgba(0,0,0,.35)", transform: `scale(${0.9 + 0.1 * p})`, opacity: p }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: "linear-gradient(135deg,#ddd,#999)", flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "#777" }}>Respondiendo a @{usuario}</div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: "#111" }}>{comentario}</div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 22, opacity: p2, transform: `translateY(${(1 - p2) * 20}px)` }}>
        {etiqueta && <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, background: C.violet, color: "#fff", padding: "4px 12px", borderRadius: 8, marginRight: 10 }}>{etiqueta}</span>}
        <div style={{ fontFamily: ANGOSTA_G, fontWeight: 700, fontSize: 130, lineHeight: 0.95, color: CREMA, textTransform: "uppercase", textShadow: SOMBRA }}>{titular}</div>
        {cursiva && <div style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 64, color: CREMA, marginTop: -6, textShadow: SOMBRA }}>{cursiva}</div>}
      </div>
    </div>
  );
};

// =====================================================================  DETRÁS DE LA PERSONA
/** D11 · Número de sección: un número gigante dorado en serif cursiva a un costado, con la cabeza tapándole una parte, al empezar cada punto («1», «2», «3»). `x` = borde izquierdo. */
export const NumeroSeccion: React.FC<{ from: number; to: number; n: string; top?: number; x?: number; size?: number }> = ({ from, to, n, top = 120, x = 90, size = 900 }) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = prog(t, from, 0.5);
  return (
    <div style={{ position: "absolute", top, left: x, fontFamily: SERIF_GRUESA, fontStyle: "italic", fontWeight: 800, fontSize: size, lineHeight: 1, opacity: p * sale(t, to),
      transform: `translateY(${(1 - p) * 60}px)`, background: `linear-gradient(160deg,#ffffff 0%,${C.lime} 35%,${C.lime} 70%,#ffffff 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      filter: "drop-shadow(0 10px 30px rgba(0,0,0,.35))" }}>{n}</div>
  );
};

/** D12 · Vidrio acanalado: el fondo se vuelve un panel oscuro de vidrio estriado con una palabra condensada gigante detrás de la cabeza. */
export const VidrioAcanalado: React.FC<{ from: number; to: number; palabra: string; top?: number; size?: number; tinte?: string }> = ({ from, to, palabra, top = 160, size = 300, tinte = "#0E1013" }) => {
  const t = useT();
  if (!en(t, from, to, 0.2)) return null;
  const o = prog(t, from, 0.3) * sale(t, to, 0.2);
  const barrido = ((t - from) * 260) % 1600 - 300;
  return (
    <AbsoluteFill style={{ opacity: o, background: tinte }}>
      <div style={{ position: "absolute", top, left: -100, right: -100, textAlign: "center", fontFamily: ANGOSTA_G, fontWeight: 700, fontSize: size, lineHeight: 0.9, letterSpacing: -4,
        textTransform: "uppercase", background: "linear-gradient(180deg,#fff 0%,#9aa3ad 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        transform: `scale(${1.08 - 0.08 * prog(t, from, 0.6)})` }}>{palabra}</div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 3px, rgba(255,255,255,0) 3px 22px, rgba(0,0,0,.35) 22px 30px)" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: barrido, width: 260, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.10), rgba(255,255,255,0))" }} />
    </AbsoluteFill>
  );
};

/** D13 · Cinta de luz: una cinta de color brillante se dibuja en curva detrás de la persona. Para «todo se conecta», momentos de energía. */
export const CintaDeLuz: React.FC<{ from: number; to: number; color?: string; color2?: string }> = ({ from, to, color = C.lime, color2 = C.violet }) => {
  const t = useT();
  if (!en(t, from, to, 0.2)) return null;
  const d = prog(t, from, 0.9);
  const w = Math.sin((t - from) * 2) * 30;
  const path = `M -120 ${1250 + w} C 200 ${700 - w}, 500 ${1500 + w}, 760 ${800 - w} S 1150 ${300 + w}, 1250 ${600 - w}`;
  return (
    <AbsoluteFill style={{ opacity: sale(t, to, 0.25) }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><linearGradient id="cinta" x1="0" x2="1"><stop offset="0" stopColor={color} /><stop offset="1" stopColor={color2} /></linearGradient></defs>
        <path d={path} fill="none" stroke="url(#cinta)" strokeWidth={150} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} opacity={0.35} style={{ filter: "blur(30px)" }} />
        <path d={path} fill="none" stroke="url(#cinta)" strokeWidth={70} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
        <path d={path} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} opacity={0.7} />
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================  CÁMARA
/** T10 · Cámara a saltos: el video baja a 12 cuadros por segundo (como stop motion) en ese tramo. Va justo después de Cam2 (sin zoom en ese tramo). */
export const CamaraSaltos: React.FC<{ from: number; to: number; fps?: number }> = ({ from, to, fps = 12 }) => {
  const t = useT();
  const f = useCurrentFrame();
  const { fps: FPS } = useVideoConfig();
  if (t < from || t >= to) return null;
  const paso = Math.max(1, Math.round(FPS / fps));
  return <AbsoluteFill><Freeze frame={Math.floor(f / paso) * paso}><OffthreadVideo src={staticFile("cam.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Freeze></AbsoluteFill>;
};

// =====================================================================  APOYOS
/** A16 · Contador que rueda: tarjeta con cada dígito en su casilla, girando como tragamonedas hasta la cifra real. */
export const ContadorRueda: React.FC<{ from: number; to: number; valor: number; prefijo?: string; titulo?: string; top?: number; color?: string; dur?: number }> = ({
  from, to, valor, prefijo = "$", titulo = "Total", top = 1050, color = C.violet, dur = 2.2,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const txt = Math.round(valor).toLocaleString("en-US");
  const p = pop(t, from, 0.4);
  let di = 0;
  const nd = txt.replace(/,/g, "").length;
  const H = 96;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 2) * sale(t, to), transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ background: color, borderRadius: 18, padding: "12px 18px 16px", boxShadow: "0 18px 40px rgba(0,0,0,.35)", textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: "#fff", textTransform: "uppercase", marginBottom: 8 }}>{titulo}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 64, color: "#fff", marginRight: 4 }}>{prefijo}</span>
          {txt.split("").map((ch, i) => {
            if (ch === ",") return <span key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 56, color: "#fff" }}>,</span>;
            const idx = di++;
            const k = prog(t, from + 0.2, dur + (nd - idx) * 0.12);
            const vueltas = 2 + (nd - idx);
            const pos = (vueltas * 10 + Number(ch)) * k;
            return (
              <div key={i} style={{ width: 66, height: H, background: "#fff", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: -pos * H }}>
                  {Array.from({ length: (vueltas + 1) * 10 }).map((_, j) => (
                    <div key={j} style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 70, color: "#111" }}>{j % 10}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * A17 · Antes y después: pantalla oscura con dos teléfonos inclinados, ANTES chico atrás y DESPUÉS grande adelante, con una
 * flecha que los une. Por defecto los dos muestran cam.mp4 (el de antes, apagado y sin color); con `srcDespues` se pone el
 * video editado. 1,5–3 s, para mostrar el cambio.
 */
export const AntesDespues: React.FC<{ from: number; to: number; srcAntes?: string; srcDespues?: string; antes?: string; despues?: string; fondo?: string }> = ({
  from, to, srcAntes = "cam.mp4", srcDespues = "cam.mp4", antes = "Antes", despues = "Después", fondo = `radial-gradient(80% 60% at 50% 55%, ${C.cardSolid} 0%, ${C.bg} 75%)`,
}) => {
  const t = useT();
  if (!en(t, from, to, 0.2)) return null;
  const p1 = pop(t, from, 0.5), p2 = pop(t, from + 0.25, 0.5), fl = prog(t, from + 0.5, 0.5);
  const tel = (src: string, w: number, h: number, rot: number, x: number, y: number, p: number, filtro: string, etiqueta: string, z: number) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 46, border: "8px solid #1b1b1b", overflow: "hidden", zIndex: z,
      transform: `rotate(${rot}deg) translateY(${(1 - p) * 300}px)`, opacity: Math.min(1, p * 1.5), boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: filtro }} />
      <div style={{ position: "absolute", top: 18, [z ? "right" : "left"]: 18, fontFamily: BODY, fontWeight: 800, fontSize: 22, letterSpacing: 2, textTransform: "uppercase",
        background: "rgba(0,0,0,.65)", color: "#fff", padding: "5px 12px", borderRadius: 20 } as React.CSSProperties}>{etiqueta}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: fondo, opacity: prog(t, from, 0.2) * sale(t, to, 0.2) }}>
      {tel(srcAntes, 380, 680, -9, 70, 760, p1, "saturate(.35) brightness(.75)", antes, 0)}
      {tel(srcDespues, 520, 930, 5, 450, 520, p2, "none", despues, 1)}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M 210 740 C 230 520, 380 430, 520 470" fill="none" stroke={CREMA} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fl} />
        {fl > 0.95 && <path d="M 492 446 L 524 470 L 490 494" fill="none" stroke={CREMA} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};

/** A18 · Camino de nodos: puntos que brillan unidos por líneas que se dibujan, cada uno con su etiqueta (decisión, proceso). Oscurece un poco la cámara. */
export const CaminoNodos: React.FC<{ from: number; to: number; nodos: { at: number; t: string; x: number; y: number }[]; color?: string }> = ({ from, to, nodos, color = C.lime }) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const o = prog(t, from, 0.25) * sale(t, to);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "rgba(5,8,12,.55)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {nodos.slice(1).map((n, i) => {
          const a = nodos[i]; const k = prog(t, n.at - 0.35, 0.35);
          return <line key={i} x1={a.x} y1={a.y} x2={a.x + (n.x - a.x) * k} y2={a.y + (n.y - a.y) * k} stroke={color} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
        })}
      </svg>
      {nodos.map((n, i) => {
        const p = pop(t, n.at, 0.35);
        return t >= n.at ? (
          <div key={i} style={{ position: "absolute", left: n.x - 18, top: n.y - 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: color, transform: `scale(${p})`, boxShadow: `0 0 24px 8px ${color}99` }} />
            <div style={{ position: "absolute", left: 50, top: -4, whiteSpace: "nowrap", fontFamily: SERIF_G, fontStyle: "italic", fontSize: 50, color: "#fff", opacity: prog(t, n.at + 0.1, 0.25), textShadow: SOMBRA }}>{n.t}</div>
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

/** A19 · Tarjetas de vistas: tarjetas que caen apiladas a un costado con un número grande (vistas, ventas, alumnas). Solo cifras reales. */
export const TarjetasVistas: React.FC<{ from: number; to: number; items: { at: number; valor: string; etiqueta: string; titulo?: string }[]; x?: number; top?: number }> = ({
  from, to, items, x = 700, top = 260,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  return (
    <div style={{ position: "absolute", left: x, top, opacity: sale(t, to) }}>
      {items.filter((it) => t >= it.at).map((it, i) => {
        const p = pop(t, it.at, 0.4);
        return (
          <div key={i} style={{ position: "absolute", top: i * 150, left: i * 12, width: 330, background: "#F3F1EC", borderRadius: 14, padding: "12px 16px", boxShadow: "0 18px 40px rgba(0,0,0,.4)",
            transform: `rotate(${i % 2 ? 3 : -2}deg) translateY(${(1 - p) * -60}px)`, opacity: Math.min(1, p * 2), textAlign: "center" }}>
            {it.titulo && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: "#666", textTransform: "uppercase" }}>{it.titulo}</div>}
            <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 72, color: "#111", lineHeight: 1 }}>{it.valor}</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: "#111", textTransform: "uppercase" }}>{it.etiqueta}</div>
          </div>
        );
      })}
    </div>
  );
};

/** A20 · Ficha de marca: tarjeta blanca con «Aa» en la letra de la marca y sus colores que aparecen uno por uno. Para hablar de identidad o estilo. */
export const FichaMarca: React.FC<{ from: number; to: number; colores: string[]; letra?: string; nombre?: string; etiqueta?: string; x?: number; top?: number }> = ({
  from, to, colores, letra = SERIF_G, nombre = "Tu letra", etiqueta = "tu marca", x = 80, top = 280,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = pop(t, from, 0.45);
  return (
    <div style={{ position: "absolute", left: x, top, width: 440, background: "#fff", borderRadius: 22, padding: "18px 22px 22px", boxShadow: "0 22px 50px rgba(0,0,0,.35)",
      transform: `rotate(-3deg) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2) * sale(t, to) }}>
      <div style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 30, color: "#444" }}>{etiqueta}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "6px 0 12px" }}>
        <div style={{ width: 150, height: 130, border: "2px solid #222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: letra, fontSize: 96, color: "#111" }}>Aa</div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: "#333" }}>{nombre}</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {colores.map((c, i) => <div key={i} style={{ width: 62, height: 62, borderRadius: 31, background: c, border: "2px solid rgba(0,0,0,.08)", transform: `scale(${pop(t, from + 0.3 + i * 0.15, 0.35)})` }} />)}
      </div>
    </div>
  );
};

/**
 * A21 · Cita de estudio: hoja tipo artículo científico (revista, título, autores) y la frase clave en serif cursiva que un
 * resaltador marca. Solo estudios reales, con su fuente tal cual. Debajo del mentón o a un costado.
 */
export const CitaEstudio: React.FC<{ from: number; to: number; revista: string; titulo: string; autores: string; frase: string; top?: number; x?: number; w?: number }> = ({
  from, to, revista, titulo, autores, frase, top = 980, x = 190, w = 700,
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = pop(t, from, 0.45);
  const r = prog(t, from + 0.7, 0.6);
  return (
    <div style={{ position: "absolute", left: x, top, width: w, background: "#F7F3EA", padding: "24px 30px 28px", boxShadow: "0 22px 50px rgba(0,0,0,.4)", color: "#1b1b1b",
      transform: `rotate(1.5deg) translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 2) * sale(t, to) }}>
      <div style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 22, color: "#555" }}>{revista}</div>
      <div style={{ fontFamily: SERIF_G, fontSize: 38, lineHeight: 1.08, margin: "8px 0", textAlign: "center" }}>{titulo}</div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: "center", textTransform: "uppercase", color: "#444" }}>{autores}</div>
      {[0, 1, 2].map((i) => <div key={i} style={{ height: 7, background: "rgba(0,0,0,.14)", margin: "12px 0", width: i === 2 ? "70%" : "100%" }} />)}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <span style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 50, padding: "0 10px", backgroundImage: `linear-gradient(${AMARILLO}, ${AMARILLO})`, backgroundRepeat: "no-repeat",
          backgroundSize: `${r * 100}% 55%`, backgroundPosition: "0 85%" }}>{frase}</span>
      </div>
    </div>
  );
};

/** A22 · Tira de video: una tira de cuadros del propio video y un marco que selecciona «la parte buena». Para hablar de cortar, elegir el mejor tramo. */
export const TiraVideo: React.FC<{ from: number; to: number; desde: number; hasta: number; etiqueta?: string; top?: number; n?: number; sel?: [number, number] }> = ({
  from, to, desde, hasta, etiqueta = "La parte buena", top = 280, n = 7, sel = [2, 4],
}) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = pop(t, from, 0.4);
  const W = 120, G = 8, ancho = n * W + (n - 1) * G;
  const s = prog(t, from + 0.6, 0.4);
  return (
    <div style={{ position: "absolute", top, left: (1080 - ancho) / 2 - 16, width: ancho + 32, background: "#F3F1EC", borderRadius: 16, padding: "12px 16px 16px", boxShadow: "0 18px 40px rgba(0,0,0,.4)",
      opacity: Math.min(1, p * 2) * sale(t, to), transform: `scale(${0.9 + 0.1 * p})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: "#333", textTransform: "uppercase", marginBottom: 8 }}>
        <span>Tu video</span><span>{Math.round(hasta - desde)} s</span>
      </div>
      <div style={{ position: "relative", display: "flex", gap: G }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} style={{ width: W, height: 170, overflow: "hidden", borderRadius: 6, background: "#000", opacity: s > 0 && (i < sel[0] || i > sel[1]) ? 1 - 0.55 * s : 1 }}>
            <CamFoto at={desde + ((hasta - desde) * i) / (n - 1)} />
          </div>
        ))}
        <div style={{ position: "absolute", top: -6, height: 182, left: sel[0] * (W + G) - 6, width: (sel[1] - sel[0] + 1) * (W + G) - G + 12, border: `5px solid ${AMARILLO}`, borderRadius: 10, opacity: s, transform: `scale(${1.1 - 0.1 * s})` }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontFamily: TITLE, fontWeight: 900, fontSize: 30, letterSpacing: 2, textTransform: "uppercase", color: "#111", opacity: s }}>{etiqueta}</div>
    </div>
  );
};

/** A23 · Título fijo en serif: el tema del video en 1–2 líneas de serif blanca con borde negro, fijo arriba TODO el video. Lo más simple que funciona. */
export const TituloFijo: React.FC<{ lineas: string[]; to: number; from?: number; top?: number; size?: number }> = ({ lineas, to, from = 0, top = 230, size = 74 }) => {
  const t = useT();
  if (t < from || t > to) return null;
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", fontFamily: SERIF_G, fontSize: size, lineHeight: 1.0, color: "#fff",
      WebkitTextStroke: "6px #000", paintOrder: "stroke fill", letterSpacing: -1 }}>
      {lineas.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
};

// =====================================================================  CIERRES
/** K5 · Botón que brilla: pantalla oscura, ondas que salen del centro y un botón con brillo que se «presiona». Anuncios: «toca el botón». */
export const BotonBrillo: React.FC<{ from: number; to: number; texto: string; color?: string; top?: number }> = ({ from, to, texto, color = C.violet, top = 900 }) => {
  const t = useT();
  if (!en(t, from, to, 0.2)) return null;
  const p = pop(t, from + 0.2, 0.45);
  const press = t > from + 1.1 && t < from + 1.3 ? 0.94 : 1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% ${(top + 60) / 19.2}%, ${color}55 0%, ${C.bg} 70%)`, opacity: prog(t, from, 0.2) * sale(t, to, 0.2) }}>
      {[0, 1, 2].map((i) => {
        const k = ((t - from) * 0.6 + i / 3) % 1;
        return <div key={i} style={{ position: "absolute", left: 540 - 150 - 500 * k, top: top + 60 - 60 - 200 * k, width: 300 + 1000 * k, height: 120 + 400 * k, borderRadius: 999, border: `2px solid ${color}`, opacity: 0.6 * (1 - k) }} />;
      })}
      <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 48, color: "#fff", padding: "26px 70px", borderRadius: 999, background: `linear-gradient(180deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 40px 10px ${color}88, inset 0 2px 0 rgba(255,255,255,.4)`, transform: `scale(${p * press})` }}>{texto} ›</div>
      </div>
    </AbsoluteFill>
  );
};

/** K6 · Comenta con destellos: «COMENTA» chico y espaciado, la palabra grande en amarillo, una línea chica debajo y destellos que titilan. */
export const ComentaDestellos: React.FC<{ from: number; to: number; palabra: string; linea?: string; top?: number; color?: string }> = ({ from, to, palabra, linea, top = 1150, color = AMARILLO }) => {
  const t = useT();
  if (!en(t, from, to)) return null;
  const p = pop(t, from + 0.15, 0.45);
  const estrella = (x: number, y: number, s: number, d: number) => (
    <svg key={`${x}${y}`} width={s} height={s} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, opacity: 0.5 + 0.5 * Math.sin((t - from) * 5 + d), transform: `scale(${0.7 + 0.3 * Math.sin((t - from) * 5 + d)})` }}>
      <path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0Z" fill="#fff" />
    </svg>
  );
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: prog(t, from, 0.2) * sale(t, to) }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, letterSpacing: 12, color: "#fff", textShadow: SOMBRA }}>COMENTA</div>
      <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 170, lineHeight: 1, color, textShadow: SOMBRA, transform: `scale(${0.8 + 0.2 * p})` }}>{palabra}</div>
      {linea && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: "#fff", textTransform: "uppercase", textShadow: SOMBRA, marginTop: 6 }}>{linea}</div>}
      {estrella(170, 40, 40, 0)}{estrella(870, 10, 30, 1.7)}{estrella(220, 230, 26, 3.1)}{estrella(830, 210, 44, 4.4)}
    </div>
  );
};

// =====================================================================  INSERTOS A PANTALLA COMPLETA (I)
const CALIDO = `radial-gradient(90% 70% at 50% 35%, ${C.cardSolid} 0%, ${C.bg} 100%)`; // fondo de la marca
const ICONOS: Record<string, string[]> = {
  monitor: ["M3 4h18v12H3z", "M9 20h6", "M12 16v4", "M6 13c2-3 4-3 6-1s4 2 6-1"],
  silla: ["M6 3v18", "M18 3v18", "M6 9h12", "M6 14h12", "M6 14l12 7", "M18 14L6 21"],
  play: ["M3 5h18v14H3z", "M10 9l5 3-5 3z"],
  olla: ["M4 11h14v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z", "M18 13h4", "M8 8c0-2 2-2 2-4", "M12 8c0-2 2-2 2-4"],
  grafico: ["M3 3v18h18", "M6 16c3 0 4-8 7-8s3 4 6 4"],
  persona: ["M9 7a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M5 21c0-4 3-7 7-7s7 3 7 7"],
  documento: ["M6 2h9l4 4v16H6z", "M15 2v4h4", "M9 11h7", "M9 14h7", "M9 17h5"],
  reloj: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M12 7v5l3 2"],
};
/**
 * I1 · Pictograma: la pantalla se vuelve un fondo cálido con un dibujo de líneas blancas que se traza solo (monitor, silla de
 * director, play, olla, gráfico, persona, documento, reloj) y abajo una línea chica + la palabra en serif cursiva.
 * Reemplaza tomas de apoyo cuando no hay material: explica una idea con un dibujo. 1,2–2,5 s.
 */
export const Pictograma: React.FC<{ from: number; to: number; icono: keyof typeof ICONOS | string; chica?: string; cursiva?: string; fondo?: string; color?: string }> = ({
  from, to, icono, chica, cursiva, fondo = CALIDO, color = AMARILLO,
}) => {
  const t = useT();
  if (!en(t, from, to, 0.15)) return null;
  const d = prog(t, from + 0.1, 0.8);
  return (
    <AbsoluteFill style={{ background: fondo, opacity: prog(t, from, 0.15) * sale(t, to, 0.15) }}>
      <svg width={560} height={560} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={0.45} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 260, top: 520 }}>
        {(ICONOS[icono] ?? ICONOS.monitor).map((p, i) => <path key={i} d={p} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />)}
      </svg>
      <div style={{ position: "absolute", top: 1180, left: 60, right: 60, textAlign: "center" }}>
        {chica && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: "#fff", textTransform: "uppercase", opacity: prog(t, from + 0.2, 0.3) }}>{chica}</div>}
        {cursiva && <div style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 120, color, lineHeight: 1, opacity: prog(t, from + 0.5, 0.3) }}>{cursiva}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** I2 · Cifra con gráfica: pantalla oscura, un número enorme que sube y una línea que se dispara al final con su etiqueta. Solo datos reales. */
export const CifraGrafica: React.FC<{ from: number; to: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; nota?: string; puntos?: number[]; color?: string; decimales?: number }> = ({
  from, to, valor, prefijo = "$", sufijo = "", etiqueta, nota, puntos = [5, 6, 6, 8, 9, 12, 18, 35, 60, 100], color = C.violet, decimales = 1,
}) => {
  const t = useT();
  if (!en(t, from, to, 0.15)) return null;
  const k = prog(t, from + 0.1, 1.2);
  const max = Math.max(...puntos);
  const pts = puntos.map((v, i) => [80 + (i * 920) / (puntos.length - 1), 1650 - (v / max) * 520]);
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const ult = pts[pts.length - 1];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#0c0d10 0%,#15171c 100%)", opacity: prog(t, from, 0.15) * sale(t, to, 0.15) }}>
      <div style={{ position: "absolute", top: 380, left: 80, fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,.6)" }}>{etiqueta}</div>
      <div style={{ position: "absolute", top: 430, left: 70, fontFamily: TITLE, fontWeight: 900, fontSize: 230, color: "#fff", letterSpacing: -6, lineHeight: 1 }}>
        <span style={{ fontSize: 120, verticalAlign: "top" }}>{prefijo}</span>{(valor * k).toFixed(decimales)}<span style={{ fontSize: 140 }}>{sufijo}</span>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {[0, 1, 2, 3].map((i) => <line key={i} x1={80} x2={1000} y1={1130 + i * 173} y2={1130 + i * 173} stroke="rgba(255,255,255,.08)" strokeWidth={2} />)}
        <path d={d} fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
        {k >= 1 && <circle cx={ult[0]} cy={ult[1]} r={16} fill={color} />}
      </svg>
      {nota && k >= 1 && <div style={{ position: "absolute", left: ult[0] - 420, top: ult[1] - 80, width: 380, textAlign: "right", fontFamily: BODY, fontWeight: 800, fontSize: 28, color, opacity: prog(t, from + 1.3, 0.3) }}>{nota}</div>}
    </AbsoluteFill>
  );
};

/**
 * I3 · Artículo resaltado: una página de periódico sobre un fondo oscuro, con el titular y el párrafo real; un resaltador
 * marca la frase que importa. Solo artículos reales (`medio`, `titular` y `texto` tal cual). 1,5–3 s.
 */
export const ArticuloResaltado: React.FC<{ from: number; to: number; medio: string; titular: string; texto: string; resaltar: string }> = ({ from, to, medio, titular, texto, resaltar }) => {
  const t = useT();
  if (!en(t, from, to, 0.15)) return null;
  const p = prog(t, from, 0.6);
  const r = prog(t, from + 0.8, 0.8);
  const [a, b] = texto.includes(resaltar) ? texto.split(resaltar) : [texto + " ", ""];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #2a2622 0%, #0b0a09 80%)", opacity: prog(t, from, 0.15) * sale(t, to, 0.15) }}>
      <div style={{ position: "absolute", left: 110, top: 360, width: 860, background: "#FBF9F4", padding: "40px 48px 48px", color: "#141414", boxShadow: "0 40px 90px rgba(0,0,0,.6)",
        transform: `perspective(1600px) rotateX(${(1 - p) * 25}deg) rotate(${-4 + 2 * p}deg) scale(${0.9 + 0.1 * p})` }}>
        <div style={{ fontFamily: SERIF_G, fontSize: 64, borderBottom: "2px solid #141414", paddingBottom: 10 }}>{medio}</div>
        <div style={{ fontFamily: SERIF_G, fontSize: 64, lineHeight: 1.05, margin: "22px 0 18px" }}>{titular}</div>
        <div style={{ fontFamily: SERIF_G, fontSize: 36, lineHeight: 1.35 }}>
          {a}{b !== undefined && texto.includes(resaltar) && <span style={{ backgroundImage: `linear-gradient(${C.lime},${C.lime})`, backgroundRepeat: "no-repeat", backgroundSize: `${r * 100}% 100%` }}>{resaltar}</span>}{b}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * I4 · Palabra a pantalla completa (fondo cálido oscuro): `conteo` = números que cambian en sus segundos (1, 2, 3) ·
 * `repite` = la palabra se apila 3 veces («BAM BAM BAM») · `escribe` = máquina de escribir con cursor · `brillo` = una palabra
 * que se enciende con resplandor. Golpes de 0,6–1,5 s entre frases.
 */
export const PalabraPantalla: React.FC<{ from: number; to: number; modo: "conteo" | "repite" | "escribe" | "brillo"; texto: string; numeros?: { at: number; n: string }[]; color?: string }> = ({
  from, to, modo, texto, numeros = [], color = AMARILLO,
}) => {
  const t = useT();
  if (!en(t, from, to, 0.1)) return null;
  const fondo = `radial-gradient(90% 60% at 50% 30%, ${C.cardSolid} 0%, ${C.bg} 100%)`;
  let cont: React.ReactNode = null;
  if (modo === "conteo") {
    const act = [...numeros].reverse().find((x) => t >= x.at) ?? numeros[0];
    const p = act ? pop(t, act.at, 0.25) : 1;
    cont = <div style={{ fontFamily: SERIF_G, fontStyle: "italic", fontSize: 700, color, lineHeight: 1, transform: `scale(${0.8 + 0.2 * p})` }}>{act?.n}</div>;
  } else if (modo === "repite") {
    cont = <div>{[0, 1, 2].map((i) => t >= from + i * 0.25 && <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 220, lineHeight: 0.95, color: i === 2 ? color : "#fff", transform: `scale(${0.8 + 0.2 * pop(t, from + i * 0.25, 0.25)})` }}>{texto}</div>)}</div>;
  } else if (modo === "escribe") {
    const n = Math.floor(Math.max(0, t - from - 0.15) * 14);
    cont = <div style={{ fontFamily: "Courier New, monospace", fontWeight: 700, fontSize: 130, color: "#fff", letterSpacing: 8 }}>{texto.slice(0, n)}<span style={{ background: "#fff", opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>&nbsp;</span></div>;
  } else {
    const g = prog(t, from, 0.5);
    cont = <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 260, color, letterSpacing: -6, textShadow: `0 0 ${60 * g}px ${color}, 0 0 ${120 * g}px ${color}88`, opacity: 0.3 + 0.7 * g }}>{texto}</div>;
  }
  return <AbsoluteFill style={{ background: fondo, opacity: prog(t, from, 0.1) * sale(t, to, 0.1), alignItems: "center", justifyContent: "center", textAlign: "center" }}>{cont}</AbsoluteFill>;
};
