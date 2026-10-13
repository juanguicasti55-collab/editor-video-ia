// Reel vertical sencillo a partir de un video horizontal: título fijo arriba (gancho), etiqueta animada, cámara en cuadro 1:1,
// clips de apoyo dentro del cuadro y subtítulos grandes de 2-3 palabras. Sin barra de avance.
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, SERIF, MONO, MARCA } from "./theme";
import { useT, prog, pop, Sounds, Sfx } from "./lib";

type Wd = { w: string; s: number; e: number };
export type ReelProps = {
  src: string; words: Wd[]; cuts: number[]; tag: string; title: [string, string];
  labels: { at: number; to: number; t: string; color?: string }[];
  broll: { from: number; to: number; src: string }[];
  keywords: string[]; credit?: string;
};
const norm = (s: string) => s.toLowerCase().replace(/[.,;:¿?¡!«»"]/g, "");
const chunks = (words: Wd[]) => {
  const out: { words: Wd[]; s: number; e: number }[] = [];
  let cur: Wd[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (cur.length >= 3 || len >= 14 || /[.,?!]$/.test(w.w) || !next || next.s - w.e > 0.3) {
      out.push({ words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.3) : w.e + 0.4 });
      cur = [];
    }
  });
  return out;
};
const VY = 520, VS = 1080;

export const Reel: React.FC<ReelProps> = ({ src, words, cuts, tag, title, labels, broll, keywords, credit = "Imágenes: «The AI Doc» · Focus Features" }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const ci = cuts.reduce((a, c, i) => (t >= c ? i : a), 0);
  const z = (ci % 2 ? 1.1 : 1) * (1 + 0.03 * Math.min(1, (t - cuts[ci]) / 6));
  const ch = React.useMemo(() => chunks(words), [words]).find((c) => t >= c.s && t < c.e);
  const kw = new Set(keywords.map(norm));
  const lb = labels.find((l) => t >= l.at && t < l.to);
  const sfx: Sfx[] = [...labels.map((l): Sfx => ({ at: l.at, f: "pop", v: 0.45 })), ...broll.map((b): Sfx => ({ at: b.from, f: "whoosh", v: 0.4 }))];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 40% at 50% 12%, rgba(225,184,90,.13) 0%, ${C.bg} 70%)`, backgroundColor: C.bg }}>
      {/* gancho fijo */}
      <div style={{ position: "absolute", top: 150, left: 60, right: 60, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: C.lime, textTransform: "uppercase", opacity: prog(t, 0, 0.3) }}>{tag}</div>
        <div style={{ marginTop: 14, fontFamily: TITLE, fontWeight: 900, fontSize: 80, letterSpacing: -3.5, lineHeight: 1.04, color: "#fff", transform: `scale(${0.9 + 0.1 * pop(t, 0.05, 0.4)})` }}>{title[0]}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 76, lineHeight: 1.1, color: C.lime, opacity: prog(t, 0.25, 0.3) }}>{title[1]}</div>
      </div>
      {/* cámara */}
      <div style={{ position: "absolute", top: VY, left: 0, width: VS, height: VS, overflow: "hidden", background: "#000" }}>
        <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "50% 42%" }} />
        {broll.filter((b) => t >= b.from - 0.05 && t <= b.to + 0.25).map((b) => (
          <AbsoluteFill key={b.from} style={{ opacity: prog(t, b.from, 0.18) * (1 - prog(t, b.to, 0.2)), background: "#000" }}>
            <Sequence from={Math.round(b.from * fps)} layout="none">
              <OffthreadVideo muted src={staticFile(`broll/${b.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.03 * (t - b.from)})` }} />
            </Sequence>
            <div style={{ position: "absolute", left: 28, top: 24, fontFamily: MONO, fontSize: 20, letterSpacing: 1.5, color: "rgba(255,255,255,.85)", textTransform: "uppercase", textShadow: "0 2px 8px #000" }}>{credit}</div>
          </AbsoluteFill>
        ))}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.55) 100%)" }} />
        {ch && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 880, textAlign: "center", fontFamily: TITLE, fontWeight: 900, fontSize: 82, letterSpacing: -3, lineHeight: 1, color: "#fff",
            textShadow: "0 4px 14px rgba(0,0,0,.9), 0 0 40px rgba(0,0,0,.6)", transform: `scale(${0.92 + 0.08 * pop(t, ch.s, 0.18)})` }}>
            {ch.words.map((w, i) => <span key={i} style={{ color: kw.has(norm(w.w)) ? C.lime : "#fff" }}>{w.w.replace(/[.,]$/, "")}{i < ch.words.length - 1 ? " " : ""}</span>)}
          </div>
        )}
      </div>
      {/* etiqueta animada entre el título y la cámara */}
      {lb && (
        <div style={{ position: "absolute", top: VY - 46, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "16px 38px", borderRadius: 18, background: lb.color ?? C.lime, color: lb.color ? "#fff" : "#0b0c0f", fontFamily: TITLE, fontWeight: 900, fontSize: 58, letterSpacing: -2,
            boxShadow: "0 16px 44px rgba(0,0,0,.55)", whiteSpace: "nowrap", transform: `scale(${0.6 + 0.4 * pop(t, lb.at, 0.35)}) rotate(${-2 + 2 * prog(t, lb.at, 0.3)}deg)`, opacity: 1 - prog(t, lb.to - 0.15, 0.15) }}>{lb.t}</div>
        </div>
      )}
      <div style={{ position: "absolute", top: VY + VS + 26, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: C.muted }}>{MARCA.handle}</div>
      <Sounds list={sfx} />
    </AbsoluteFill>
  );
};
