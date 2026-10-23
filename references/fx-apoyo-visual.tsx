// Efectos del catálogo efectos-17 para el lote DJI del 23-oct (marca personal de Juan, dorado #e1b85a).
// #9 zoom que atraviesa (ZoomThrough), #7 checklist de vidrio (Checklist), #8 titulares en la pared (Headline),
// #16 portada de revista detrás de la persona (CamBehind + BehindText de mg.tsx), cierre Sígueme (FollowSave).
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, BODY } from "./theme";
import { useT, prog, pop } from "./lib";
import { Icon, SHADOW } from "./mg";

/** #9 Zoom que atraviesa: envuelve la cámara. En cada `at`, 0,26 s entrando (escala ×4 + desenfoque) y 0,26 s saliendo. */
export const ZoomThrough: React.FC<{ at: number[]; children: React.ReactNode; dur?: number }> = ({ at, children, dur = 0.26 }) => {
  const t = useT();
  let s = 1, b = 0, oy = 50;
  for (const x of at) {
    if (t >= x - dur && t < x) { const p = (t - (x - dur)) / dur; s = 1 + 3 * p * p; b = 16 * p; oy = 55; }
    if (t >= x && t < x + dur) { const p = 1 - (t - x) / dur; s = 1 + 1.6 * p * p; b = 12 * p; oy = 42; }
  }
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `50% ${oy}%`, filter: b > 0.2 ? `blur(${b}px)` : undefined }}>{children}</AbsoluteFill>;
};

/** Destello blanco corto (va con el zoom que atraviesa y con los golpes fuertes). */
export const Flashes: React.FC<{ at: number[]; v?: number }> = ({ at, v = 0.35 }) => {
  const t = useT();
  const c = at.find((x) => t >= x && t < x + 0.16);
  if (c === undefined) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: v * (1 - (t - c) / 0.16) }} />;
};

/** #7 Checklist: tarjeta oscura de vidrio arriba con contador «n de N». Cada paso aparece y se marca en su segundo. */
export const Checklist: React.FC<{ from: number; to: number; title: string; items: { at: number; t: string }[]; top?: number; compactAfter?: number }> = ({
  from, to, title, items, top = 250,
}) => {
  const t = useT();
  if (t < from || t > to + 0.3) return null;
  const p = pop(t, from, 0.45);
  const done = items.filter((i) => t >= i.at).length;
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, padding: "28px 36px 30px", borderRadius: 34, background: "rgba(14,16,21,.72)",
      backdropFilter: "blur(18px)", border: "1.5px solid rgba(255,255,255,.12)", boxShadow: "0 24px 60px rgba(0,0,0,.45)",
      transform: `translateY(${(1 - p) * -40}px) scale(${0.94 + 0.06 * p})`, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>{title}</div>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 40, color: C.lime, transform: `scale(${1 + 0.25 * (1 - prog(t, items[Math.max(0, done - 1)]?.at ?? from, 0.3))})` }}>
          {done} de {items.length}
        </div>
      </div>
      {items.map((it, i) => {
        const on = t >= it.at;
        const rp = prog(t, it.at, 0.3);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12, opacity: on ? 1 : 0.28 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, border: `4px solid ${on ? C.lime : "rgba(255,255,255,.5)"}`,
              background: on ? C.lime : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 0.8 + 0.2 * pop(t, it.at, 0.35) : 1})` }}>
              {on && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#0b0c0f" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rp} /></svg>}
            </div>
            <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 44, letterSpacing: -1, color: "#fff", transform: `translateX(${on ? (1 - rp) * 14 : 0}px)` }}>
              {on ? it.t : "· · ·"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** #8 Titular pegado en la pared (va DETRÁS de la persona, dentro de `behind`): tarjeta de papel con leve giro. */
export const Headline: React.FC<{ at: number; to: number; x: number; y: number; w: number; rot?: number; tag: string; title: string; src?: string; dark?: boolean; size?: number }> = ({
  at, to, x, y, w, rot = -4, tag, title, src, dark, size,
}) => {
  const t = useT();
  if (t < at || t > to + 0.25) return null;
  const p = pop(t, at, 0.4);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "22px 26px 20px", borderRadius: 8, background: dark ? "#14161c" : "#F3EFE6",
      boxShadow: "0 18px 40px rgba(0,0,0,.45)", transform: `rotate(${rot + (1 - p) * 8}deg) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)) }}>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: dark ? C.lime : "#9A7A2E", marginBottom: 8 }}>{tag}</div>
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: size ?? Math.round(w / 11.5), lineHeight: 1.12, color: dark ? "#fff" : "#16181c" }}>{title}</div>
      {src && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 19, marginTop: 10, color: dark ? "rgba(255,255,255,.55)" : "#7d7f86" }}>{src}</div>}
    </div>
  );
};

/** Cierre: botón dorado «Sígueme» + «y guarda este video». */
export const FollowSave: React.FC<{ at: number; saveAt: number; top?: number; save?: string }> = ({ at, saveAt, top = 1080, save = "y guarda este video" }) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at, 0.4);
  const done = prog(t, at + 0.55, 0.25);
  const s = prog(t, saveAt, 0.25);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 54px 22px 40px", borderRadius: 90, background: C.lime,
        boxShadow: `0 14px 40px rgba(0,0,0,.4), 0 0 50px ${C.lime}55`, transform: `scale(${(0.7 + 0.3 * p) * (1 + 0.03 * Math.sin((t - at) * 6))})`, opacity: Math.min(1, p * 2) }}>
        <svg width={84} height={84} viewBox="0 0 24 24" fill="none" stroke="#0b0c0f" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" opacity={1 - done} />
          <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - done} />
        </svg>
        <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 100, letterSpacing: -3, color: "#0b0c0f", lineHeight: 1 }}>Sígueme</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: s, transform: `translateY(${(1 - s) * 14}px)` }}>
        <Icon name="bookmark" at={saveAt} size={66} color="#fff" />
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 56, letterSpacing: -0.8, color: "#fff", textShadow: SHADOW }}>{save}</div>
      </div>
    </div>
  );
};

/** Cierre con palabra para comentar (reel de clonar apps). */
export const CommentWord: React.FC<{ at: number; word: string; sub: string; top?: number }> = ({ at, word, sub, top = 1060 }) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at, 0.4);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: Math.min(1, p * 2) }}>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 52, color: "#fff", textShadow: SHADOW }}>Comenta</div>
      <div style={{ padding: "14px 46px", borderRadius: 22, background: C.lime, fontFamily: TITLE, fontWeight: 900, fontSize: 130, letterSpacing: -3, color: "#0b0c0f",
        boxShadow: `0 14px 40px rgba(0,0,0,.4), 0 0 50px ${C.lime}66`, transform: `scale(${(0.7 + 0.3 * p) * (1 + 0.03 * Math.sin((t - at) * 6))}) rotate(-2deg)` }}>{word}</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 46, color: "#fff", textShadow: SHADOW, opacity: prog(t, at + 0.5, 0.3) }}>{sub}</div>
    </div>
  );
};

/** Cierre con pregunta abierta (reel de renta universal). */
export const AskComment: React.FC<{ at: number; to: number; q: string[]; top?: number }> = ({ at, to, q, top = 1060 }) => {
  const t = useT();
  if (t < at || t > to + 0.25) return null;
  const p = pop(t, at, 0.4);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, padding: "30px 36px", borderRadius: 30, background: "rgba(14,16,21,.78)", border: `2px solid ${C.lime}`,
      display: "flex", gap: 24, alignItems: "center", transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.25)) }}>
      <Icon name="chat" at={at} size={96} color={C.lime} />
      <div>{q.map((l, i) => <div key={i} style={{ fontFamily: TITLE, fontWeight: 900, fontSize: i ? 50 : 34, letterSpacing: -1, lineHeight: 1.1, color: i ? "#fff" : C.lime,
        textTransform: i ? "none" : "uppercase" }}>{l}</div>)}</div>
    </div>
  );
};

// ======================= Apoyo visual (modelado de tenfoldmarc, itsmegkilgore y jessijeanhome, 23-oct) =======================
// Regla de las tres cuentas: lo que se dice se MUESTRA (clip, foto, captura o interfaz) y nunca pasan más de 3-4 s sin algo nuevo.

/** Corte a toma de apoyo a pantalla completa (la voz sigue). Entra con zoom seco, Ken Burns lento, crédito abajo. */
export const Cutaway: React.FC<{ from: number; to: number; src: string; start?: number; credit?: string; zoom?: number; pos?: string }> = ({
  from, to, src, start = 0, credit, zoom = 1.12, pos = "50% 50%",
}) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < from || t > to) return null;
  const k = (t - from) / Math.max(0.5, to - from);
  const s = (1 + 0.25 * (1 - prog(t, from, 0.22))) * (1 + (zoom - 1) * k);
  const isVideo = /\.(mp4|mov|webm)$/i.test(src);
  const st: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${s})` };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {isVideo
        ? <Sequence from={Math.round(from * fps)} layout="none"><OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(start * fps)} style={st} /></Sequence>
        : <Img src={staticFile(src)} style={st} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 25%,transparent 60%,rgba(0,0,0,.55) 100%)" }} />
      {credit && <div style={{ position: "absolute", left: 40, bottom: 120, fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,.7)", textShadow: SHADOW }}>{credit}</div>}
    </AbsoluteFill>
  );
};

/** Captura real (noticia, web) como tarjeta flotante, con subrayado tipo marcador que se pinta en su segundo.
 *  hl: rectángulos en % de la imagen (x, y, w, h) que se resaltan en amarillo a partir de `at`. */
export const ArticleCard: React.FC<{ from: number; to: number; src: string; x: number; y: number; w: number; rot?: number;
  hl?: { at: number; x: number; y: number; w: number; h: number }[]; tag?: string; zoomTo?: number }> = ({ from, to, src, x, y, w, rot = -2, hl = [], tag, zoomTo = 1.06 }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.5);
  const k = Math.min(1, (t - from) / Math.max(0.5, to - from));
  const o = Math.min(1, p * 2) * (1 - prog(t, to, 0.22));
  return (
    <div style={{ position: "absolute", left: x, top: y + 8 * Math.sin((t - from) * 1.5), width: w, opacity: o,
      transform: `rotate(${rot * (0.3 + 0.7 * p)}deg) translateY(${(1 - p) * 90}px) scale(${(0.8 + 0.2 * p) * (1 + (zoomTo - 1) * k)})` }}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,.55)", border: "3px solid rgba(255,255,255,.9)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
        {hl.map((h, i) => {
          const q = prog(t, h.at, 0.35);
          return <div key={i} style={{ position: "absolute", left: `${h.x}%`, top: `${h.y}%`, width: `${h.w * q}%`, height: `${h.h}%`, background: "rgba(255,214,0,.45)", mixBlendMode: "multiply", borderRadius: 4 }} />;
        })}
      </div>
      {tag && <div style={{ marginTop: 14, display: "inline-block", padding: "8px 18px", borderRadius: 30, background: C.lime, fontFamily: BODY, fontWeight: 600, fontSize: 26, color: "#0b0c0f" }}>{tag}</div>}
    </div>
  );
};

/** Ícono de app o logo oficial dentro de un cuadro redondeado (public/logos/<file>). */
export const AppIcon: React.FC<{ from: number; to: number; file: string; x: number; y: number; size?: number; bg?: string }> = ({ from, to, file, x, y, size = 150, bg = "#fff" }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y + 6 * Math.sin((t - from) * 2), width: size, height: size, borderRadius: size * 0.24, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px rgba(0,0,0,.45)",
      opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.2)), transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -14}deg)` }}>
      <Img src={staticFile(`logos/${file}`)} style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain" }} />
    </div>
  );
};

/** Ventana oscura de vidrio (base de los mockups de interfaz). */
const Win: React.FC<{ from: number; to: number; top: number; title?: string; children: React.ReactNode; left?: number; right?: number; mono?: boolean }> = ({
  from, to, top, title, children, left = 70, right = 70, mono,
}) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const p = pop(t, from, 0.45);
  return (
    <div style={{ position: "absolute", top, left, right, borderRadius: 30, overflow: "hidden", background: mono ? "rgba(10,11,14,.9)" : "rgba(20,22,28,.86)",
      backdropFilter: "blur(18px)", border: "1.5px solid rgba(255,255,255,.14)", boxShadow: "0 30px 80px rgba(0,0,0,.55)",
      opacity: Math.min(1, p * 2) * (1 - prog(t, to, 0.22)), transform: `translateY(${(1 - p) * -50}px) scale(${0.92 + 0.08 * p})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        {title && <div style={{ marginLeft: 14, fontFamily: mono ? "Menlo, monospace" : BODY, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,.6)" }}>{title}</div>}
      </div>
      <div style={{ padding: "22px 30px 26px" }}>{children}</div>
    </div>
  );
};

const typed = (t: number, at: number, s: string, cps = 28) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

/** Chat tipo asistente: burbujas que se escriben solas. who: "tu" (derecha, dorado) | "ia" (izquierda) | "info" (línea de estado).
 *  mark: sello ✗ rojo o ✓ verde sobre la burbuja en su segundo. */
export const ChatMock: React.FC<{ from: number; to: number; top?: number; title?: string; logo?: string;
  msgs: { at: number; who: "tu" | "ia" | "info"; t: string; mark?: { at: number; ok: boolean } }[] }> = ({ from, to, top = 150, title = "Claude", logo, msgs }) => {
  const t = useT();
  return (
    <Win from={from} to={to} top={top} title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {msgs.filter((m) => t >= m.at).map((m, i) => {
          const q = pop(t, m.at, 0.35);
          const me = m.who === "tu";
          if (m.who === "info") return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 600, fontSize: 34, color: C.lime, opacity: q }}>
              {logo && <Img src={staticFile(`logos/${logo}`)} style={{ width: 36, height: 36 }} />}{typed(t, m.at, m.t, 40)}
            </div>);
          const mk = m.mark && t >= m.mark.at ? pop(t, m.mark.at, 0.35) : 0;
          return (
            <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "86%", position: "relative", opacity: Math.min(1, q * 2), transform: `translateY(${(1 - q) * 16}px)` }}>
              <div style={{ padding: "16px 24px", borderRadius: 24, background: me ? "#2c2f38" : "transparent", border: me ? "none" : "1.5px solid rgba(255,255,255,.12)",
                fontFamily: BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.25, color: "#fff", display: "flex", gap: 12, alignItems: "flex-start" }}>
                {!me && logo && <Img src={staticFile(`logos/${logo}`)} style={{ width: 44, height: 44, marginTop: 4 }} />}
                <span>{typed(t, m.at, m.t)}</span>
              </div>
              {m.mark && mk > 0 && <div style={{ position: "absolute", right: -18, top: -22, width: 64, height: 64, borderRadius: 32, background: m.mark.ok ? "#22c55e" : "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 40, color: "#fff", transform: `scale(${mk}) rotate(${(1 - mk) * 30}deg)` }}>{m.mark.ok ? "✓" : "✕"}</div>}
            </div>);
        })}
      </div>
    </Win>
  );
};

/** Terminal: líneas que se escriben («> ...» en dorado = lo que tú pides; «✓ ...» en verde = lo que hizo). */
export const Terminal: React.FC<{ from: number; to: number; top?: number; title?: string; lines: { at: number; t: string }[] }> = ({ from, to, top = 150, title = "Claude Code", lines }) => {
  const t = useT();
  return (
    <Win from={from} to={to} top={top} title={title} mono>
      {lines.filter((l) => t >= l.at).map((l, i, arr) => {
        const c = l.t.startsWith(">") ? C.lime : l.t.startsWith("✓") ? "#4ade80" : "rgba(255,255,255,.85)";
        const cursor = i === arr.length - 1 && Math.floor(t * 2.5) % 2 === 0 ? "▍" : "";
        return <div key={i} style={{ fontFamily: "Menlo, monospace", fontSize: 38, lineHeight: 1.5, color: c }}>{typed(t, l.at, l.t, 34)}{cursor}</div>;
      })}
    </Win>
  );
};

/** Archivo / documento (p. ej. SKILL.md): título y renglones que se escriben uno a uno; marca ✓ o ✗ opcional por renglón. */
export const FileCard: React.FC<{ from: number; to: number; top?: number; name: string; lines: { at: number; t: string; ok?: boolean; markAt?: number }[]; glowAt?: number }> = ({
  from, to, top = 150, name, lines, glowAt,
}) => {
  const t = useT();
  const g = glowAt !== undefined && t >= glowAt ? 0.5 + 0.5 * Math.sin((t - glowAt) * 6) : 0;
  return (
    <div style={{ filter: g ? `drop-shadow(0 0 ${20 + 30 * g}px ${C.lime})` : undefined }}>
      <Win from={from} to={to} top={top} title={name} mono>
        {lines.filter((l) => t >= l.at).map((l, i) => {
          const m = l.markAt !== undefined && t >= l.markAt ? pop(t, l.markAt, 0.3) : 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: BODY, fontWeight: 600, fontSize: 46, lineHeight: 1.55, color: "#fff" }}>
              <span style={{ color: C.lime, fontFamily: "Menlo, monospace" }}>{"#"}</span>
              <span style={{ flex: 1, textDecoration: m && l.ok === false ? "line-through" : "none", opacity: m && l.ok === false ? 0.6 : 1 }}>{typed(t, l.at, l.t)}</span>
              {m > 0 && <span style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 50, color: l.ok ? "#4ade80" : "#ef4444", transform: `scale(${m})` }}>{l.ok ? "✓" : "✕"}</span>}
            </div>);
        })}
      </Win>
    </div>
  );
};

/** Carpetas que saltan en fila (acceso a archivos). */
export const Folders: React.FC<{ from: number; to: number; top?: number; items: { at: number; t: string }[] }> = ({ from, to, top = 200, items }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.22);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, opacity: o }}>
      {items.map((it, i) => {
        const q = t >= it.at ? pop(t, it.at, 0.4) : 0;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(1, q * 2), transform: `translateY(${(1 - q) * 60 + 6 * Math.sin(t * 2 + i)}px) scale(${0.6 + 0.4 * q})` }}>
            <svg width={190} height={150} viewBox="0 0 64 50"><path d="M2 8a4 4 0 0 1 4-4h16l6 6h30a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill={C.lime} />
              <path d="M2 16h60v28a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#f2cf78" /></svg>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: "#fff", textShadow: SHADOW }}>{it.t}</div>
          </div>);
      })}
    </div>
  );
};

/** Tira de días (lun-vie) que se van marcando: «todos los días lo mismo». */
export const DayStrip: React.FC<{ from: number; to: number; top?: number; at: number[]; label: string }> = ({ from, to, top = 220, at, label }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const days = ["LUN", "MAR", "MIÉ", "JUE", "VIE"];
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, opacity: 1 - prog(t, to, 0.22) }}>
      <div style={{ display: "flex", gap: 14 }}>
        {days.map((d, i) => {
          const on = t >= at[i]; const q = on ? pop(t, at[i], 0.35) : 0;
          return (
            <div key={d} style={{ flex: 1, height: 190, borderRadius: 22, background: on ? "rgba(20,22,28,.9)" : "rgba(20,22,28,.5)", border: `2px solid ${on ? C.violet : "rgba(255,255,255,.12)"}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${0.9 + 0.1 * q})` }}>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 26, letterSpacing: 2, color: "rgba(255,255,255,.7)" }}>{d}</div>
              <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 56, color: C.violet, opacity: q, transform: `scale(${q})` }}>↻</div>
            </div>);
        })}
      </div>
      <div style={{ marginTop: 16, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 48, color: "#fff", textShadow: SHADOW, opacity: prog(t, at[at.length - 1], 0.3) }}>{label}</div>
    </div>
  );
};

/** Contador grande que cuenta en voz alta (1, 2, 3…) y remata con una palabra. */
export const CountPop: React.FC<{ from: number; to: number; top?: number; at: number[]; end: { at: number; t: string } }> = ({ from, to, top = 230, at, end }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const n = at.filter((a) => t >= a).length;
  const last = at[Math.max(0, n - 1)];
  const e = t >= end.at ? pop(t, end.at, 0.45) : 0;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: 1 - prog(t, to, 0.22) }}>
      {at.map((a, i) => {
        const q = t >= a ? pop(t, a, 0.35) : 0;
        return <div key={i} style={{ width: 150, height: 150, borderRadius: 75, background: t >= a ? C.lime : "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: TITLE, fontWeight: 900, fontSize: 90, color: "#0b0c0f", transform: `scale(${0.7 + 0.3 * q + (a === last && e === 0 ? 0.08 * (1 - prog(t, a, 0.3)) : 0)})` }}>{i + 1}</div>;
      })}
      {e > 0 && <div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 110, letterSpacing: -3, color: "#fff", textShadow: SHADOW, transform: `scale(${e}) rotate(-3deg)` }}>{end.t}</div>}
    </div>
  );
};
