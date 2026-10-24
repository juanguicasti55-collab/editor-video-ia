// ÚNICO archivo que se edita por video. EJEMPLO de arranque de un video de motion graphics con voz en off,
// hecho a partir de un carrusel: una escena por lámina. Reemplazar textos, tiempos e imágenes.
// Los tiempos salen de words.ts (los imprime mg_prep.py). Para no copiar números a mano: W("palabra", n).
// Referencia completa: references/motion-graphics.md
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { C, MARCA, MONO } from "./theme";
import { DURATION } from "./words";
import { Sfx, Sounds } from "./lib";
import {
  Brackets, CierreCTA, Esquema, Ficha, Fichas, Flujo, Hud, Linea, PanelLista, Red, Scene, Segmentos,
  SubsMG, Tablero, Tachado, TechBg, Abs, mono,
} from "./mograf";

export const CTA_SECONDS = 3.2; // el cierre se queda en pantalla después de la última palabra
const CTA_AT = Math.max(0, DURATION - 1.6); // ≈ cuando la voz dice "Comenta…" (mejor: W("comenta"))

// Rótulo de arriba por escena (una por lámina). El contador "03 / 08" sale solo.
const SECTIONS: [number, string][] = [
  [3.5, "01 — Primera idea"],
  [9.0, "02 — Segunda idea"],
  [14.0, "03 — Tercera idea"],
];

const KEYWORDS = ["palabra", "clave"];

const SFX: Sfx[] = [
  { at: 0.05, f: "whoosh", v: 0.5 },
  { at: 3.5, f: "whoosh", v: 0.55 },
  { at: 9.0, f: "whoosh", v: 0.55 },
  { at: 14.0, f: "whoosh", v: 0.55 },
  { at: CTA_AT, f: "whoosh", v: 0.6 },
  { at: CTA_AT + 0.35, f: "ding", v: 0.5 },
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <TechBg />
    <Brackets />

    {/* 0 · GANCHO: visible desde el fotograma 0, mínimo 3 s (regla de la skill) + imágenes que saltan */}
    <Scene a={0} b={3.4}>
      <Abs style={{ left: 80, right: 80, top: 262, textAlign: "center" }}>
        <Linea at={-1} size={92}>La pregunta del</Linea>
        <Linea at={-1} size={92} italic color={C.violet}>carrusel</Linea>
        <div style={{ ...mono(22, C.mint), marginTop: 22 }}>Tema del video</div>
      </Abs>
      <Ficha src="img/1.png" label="Uno" at={0.05} w={418} h={370} style={{ left: 112, top: 640 }} tag="¿SELLO?" tagAt={2.8} />
      <Ficha src="img/2.png" label="Dos" at={0.17} w={418} h={370} style={{ left: 550, top: 640 }} tag="¿SELLO?" tagAt={2.9} />
    </Scene>

    {/* 1 · LISTA con siglas: cada fila entra en el segundo en que se nombra */}
    <Scene a={3.5} b={8.9}>
      <Abs style={{ left: 104, top: 340, right: 104 }}>
        <Linea at={3.55} size={74}>Título de la</Linea>
        <Linea at={3.9} size={74} italic color={C.lime}>lámina dos</Linea>
      </Abs>
      <PanelLista
        title="Lo que se enumera"
        items={[
          { code: "AAA", name: "Primer elemento", at: 4.5, img: "img/1.png" },
          { code: "BBB", name: "Segundo elemento", at: 5.6, img: "img/2.png" },
          { code: "CCC", name: "Tercero (sin imagen)", at: 6.8 },
        ]}
      />
    </Scene>

    {/* 2 · ESQUEMA: algo baja mientras otra cosa sube (sin números) */}
    <Scene a={9.0} b={13.9}>
      <Abs style={{ left: 104, right: 104, top: 340 }}>
        <Linea at={9.05} size={64}>Lo que cambia</Linea>
        <Linea at={9.6} size={64} italic color={C.lime}>con el tiempo</Linea>
      </Abs>
      <Esquema at={9.2} crossAt={12.2} labelA="Lo que baja" labelB="Lo que sube" />
    </Scene>

    {/* 3 · MITO TACHADO → FLUJO de 3 pasos */}
    <Scene a={14.0} b={16.4}>
      <Abs style={{ left: 0, right: 0, top: 600, textAlign: "center" }}>
        <Tachado at={14.1} strikeAt={14.6} size={150}>mito</Tachado>
        <Linea at={15.2} size={96} italic color={C.lime}>lo que sí pasa</Linea>
      </Abs>
    </Scene>
    <Scene a={16.5} b={21.0}>
      <Flujo nodes={[{ at: 16.6, label: "Paso uno" }, { at: 18.0, label: "Paso dos" }, { at: 19.4, label: "Resultado" }]} />
    </Scene>

    {/* 4 · RED de factores alrededor de un centro */}
    <Scene a={21.1} b={26.0}>
      <Red at={21.2} centro={["Centro", "IDEA"]} factores={[
        { at: 22.0, l: ["Factor", "uno"] }, { at: 22.6, l: ["Factor", "dos"] }, { at: 23.2, l: ["Factor", "tres"] },
        { at: 23.8, l: ["Factor", "cuatro"] }, { at: 24.4, l: ["Factor", "cinco"] }, { at: 25.0, l: ["Factor", "seis"] },
      ]} />
    </Scene>

    {/* 5 · FICHAS que se reemplazan (sigla gigante + imagen + frase) */}
    <Scene a={26.1} b={30.0}>
      <Fichas items={[
        { a: 26.2, b: 28.0, code: "AAA", img: "img/1.png", what: "Cómo se nota el primero" },
        { a: 28.1, b: 29.9, code: "CCC", what: "Sin imagen: va la órbita" },
      ]} />
    </Scene>

    {/* 6 · TABLERO: el dato suelto (naranja) + lo que se lee junto */}
    <Scene a={30.1} b={33.5}>
      <Tablero first={{ at: 30.3, l: "El dato", tag: "dato" }} items={[{ at: 31.0, l: "Contexto" }, { at: 31.6, l: "Otro" }, { at: 32.2, l: "Algo más largo que ocupa dos" }]} />
    </Scene>

    {/* 7 · REMATE: pista vs historia completa, teoría tachada → estructura */}
    <Scene a={33.6} b={CTA_AT - 0.1}>
      <Abs style={{ left: 0, right: 0, top: 500, textAlign: "center" }}>
        <Linea at={33.7} size={200} italic color={C.lime}>pista</Linea>
      </Abs>
      <Segmentos at={34.2} n={6} lit={1} top={1150} />
    </Scene>

    <CierreCTA at={CTA_AT} nombre="Tu nombre" rol="Tu oficio" palabra={MARCA.ctaPalabra} texto={MARCA.ctaTexto} />
    <Hud sections={SECTIONS} handle={MARCA.handle} label="Tema" hideFrom={CTA_AT} />
    <SubsMG keywords={KEYWORDS} hideFrom={CTA_AT} />
    <Audio src={staticFile("voz.wav")} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
