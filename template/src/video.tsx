// ÚNICO archivo que se edita por video. Tiempos en segundos del video YA CORTADO (ver words.ts).
// Punto de partida sin estilo: cámara completa con saltos de zoom en los cortes y subtítulos. Los efectos y tarjetas
// salen del menú (references/menu-efectos.md) o del kit horizontal (references/youtube-horizontal/LEEME.md).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import { Brand, CamKey, Camera, Sfx, Sounds, Subtitles, punch } from "./lib";

// Encuadres: mismo cuadro con otro zoom = corte seco (jump cut). Nada más de ~8 s sin un cambio.
const KEYS: CamKey[] = [
  { at: 0, box: punch(1.0) },
  { at: 4, box: punch(1.12) },
];

// 1–2 palabras por frase que se pintan con el acento en los subtítulos (minúsculas)
const KEYWORDS = ["palabra", "clave"];

// Tramos sin subtítulos (cuando un efecto ya muestra el texto)
const HIDE_SUBS: [number, number][] = [];

const SFX: Sfx[] = [{ at: 4, f: "boom", v: 0.5 }];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Camera keys={KEYS} />
    {/* aquí van los efectos elegidos */}
    <Subtitles keys={KEYS} keywords={KEYWORDS} hide={HIDE_SUBS} />
    <Brand />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
