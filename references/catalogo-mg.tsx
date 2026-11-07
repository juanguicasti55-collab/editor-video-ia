// Catálogo de las piezas de motion graphics SIN cámara (template-mg/mograf.tsx), cada una con su nombre arriba. Se usa como
// video.tsx de un proyecto armado con mg_prep.py (cualquier voz de ~55 s); renderizar con --frames hasta el cierre.
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { C, TITLE } from "./theme";
import { useT } from "./lib";
import { Abs, Bloques, Brackets, CierreCTA, Contorno, Esquema, Ficha, Fichas, Flujo, Hud, Linea, Orbita, PanelLista, Red, Scene, Segmentos, SubsMG, Tablero, Tachado, TechBg } from "./mograf";

export const CTA_SECONDS = 0;
type Sl = { c: string; n: string; d: number; r: (a: number, b: number) => React.ReactNode };
const SL: Sl[] = [
  { c: "S1", n: "Título editorial (Linea)", d: 3.4, r: (a) => <Abs style={{ left: 80, right: 80, top: 520, textAlign: "center" }}><Linea at={a + 0.1} size={110}>No es un</Linea><Linea at={a + 0.6} size={130} italic color={C.lime}>gasto</Linea></Abs> },
  { c: "S2", n: "Palabra tachada (Tachado)", d: 3.2, r: (a) => <Abs style={{ left: 0, right: 0, top: 640, textAlign: "center" }}><Tachado at={a + 0.1} strikeAt={a + 0.9} size={170}>gasto</Tachado><Linea at={a + 1.4} size={110} italic color={C.lime}>inversión</Linea></Abs> },
  { c: "S3", n: "Sigla en contorno (Contorno)", d: 3.2, r: (a) => <Contorno at={a + 0.1} text="MEET" top={700} /> },
  { c: "S4", n: "Ficha con sello (Ficha)", d: 3.4, r: (a) => <Ficha label="Sin imagen real" at={a + 0.1} w={600} h={520} style={{ left: 240, top: 560 }} tag="¿GASTO?" tagAt={a + 1.4} /> },
  { c: "S5", n: "Ícono de anillos (Orbita)", d: 3, r: () => <Orbita size={460} text="IA" style={{ left: 310, top: 640 }} /> },
  { c: "S6", n: "Lista con siglas (PanelLista)", d: 4.6, r: (a) => <PanelLista title="Lo que se enumera" visor={false} items={[{ code: "ZAP", name: "Zapatos", at: a + 0.6 }, { code: "CEL", name: "Celular", at: a + 1.6 }, { code: "CAP", name: "Capacitación", at: a + 2.6 }]} /> },
  { c: "S7", n: "Esquema que se cruza (Esquema)", d: 4.4, r: (a) => <Esquema at={a + 0.2} crossAt={a + 2.6} labelA="Lo que gastas" labelB="Lo que vuelve" /> },
  { c: "S8", n: "Flujo de 3 pasos (Flujo)", d: 4.2, r: (a) => <Flujo nodes={[{ at: a + 0.2, label: "Aprendes" }, { at: a + 1.4, label: "Atiendes" }, { at: a + 2.6, label: "Vuelve" }]} /> },
  { c: "S9", n: "Red de factores (Red)", d: 4.6, r: (a) => <Red at={a + 0.2} centro={["Tu", "CARRERA"]} factores={[{ at: a + 0.8, l: ["Más", "familias"] }, { at: a + 1.3, l: ["Tu", "agenda"] }, { at: a + 1.8, l: ["Más", "confianza"] }, { at: a + 2.3, l: ["Mejor", "precio"] }]} /> },
  { c: "S10", n: "Fichas que se reemplazan (Fichas)", d: 4.4, r: (a) => <Fichas items={[{ a: a + 0.1, b: a + 2.1, code: "ZAP", what: "Dura una temporada" }, { a: a + 2.2, b: a + 4.2, code: "CAP", what: "Te sirve en cada sesión" }]} /> },
  { c: "S11", n: "Tablero con el dato (Tablero)", d: 4, r: (a) => <Tablero first={{ at: a + 0.2, l: "El dato real", tag: "dato" }} items={[{ at: a + 0.9, l: "Contexto" }, { at: a + 1.5, l: "Otro" }, { at: a + 2.1, l: "Algo más largo que ocupa dos" }]} /> },
  { c: "S12", n: "Segmentos encendidos (Segmentos)", d: 3.4, r: (a) => <><Abs style={{ left: 0, right: 0, top: 560, textAlign: "center" }}><Linea at={a + 0.1} size={180} italic color={C.lime}>pista</Linea></Abs><Segmentos at={a + 0.5} n={6} lit={1} top={1050} /></> },
  { c: "S13", n: "Bloques que arman (Bloques)", d: 3.6, r: (a) => <Bloques at={a + 0.2} /> },
];
const INI = 0.3;
const TIEMPOS = (() => { let t = INI; return SL.map((s) => { const a = t; t += s.d; return { s, a, b: t }; }); })();
const CTA = TIEMPOS[TIEMPOS.length - 1].b + 0.1;
const SECTIONS: [number, string][] = TIEMPOS.map(({ s, a }, i) => [a, `${String(i + 1).padStart(2, "0")} — ${s.n.split(" (")[0]}`]);

const Etiqueta: React.FC = () => {
  const t = useT();
  const it = TIEMPOS.find((x) => t >= x.a && t < x.b);
  const s = it ? it.s : { c: "S14", n: "Cierre con foto y palabra (CierreCTA)" };
  return (
    <div style={{ position: "absolute", top: 46, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(10,10,10,.85)", padding: "10px 24px 10px 12px", borderRadius: 40 }}>
        <span style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 34, color: "#111", background: "#F4EEDF", padding: "2px 14px", borderRadius: 24 }}>{s.c}</span>
        <span style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 30, color: "#fff" }}>{s.n}</span>
        <span style={{ fontFamily: TITLE, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: 2 }}>· sin cámara</span>
      </div>
    </div>
  );
};

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <TechBg />
    <Brackets />
    {TIEMPOS.map(({ s, a, b }, i) => <Scene key={i} a={a} b={b - 0.1}>{s.r(a, b)}</Scene>)}
    <CierreCTA at={CTA} nombre="Tu nombre" rol="Tu oficio" palabra="GUIA" texto="y te envío el enlace" />
    <Hud sections={SECTIONS} handle="@tucuenta" label="Catálogo" hideFrom={CTA} />
    <SubsMG keywords={["gasto", "inversion", "capacitacion"]} hideFrom={CTA} />
    <Audio src={staticFile("voz.wav")} />
    <Etiqueta />
  </AbsoluteFill>
);
