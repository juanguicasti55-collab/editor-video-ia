// ÚNICO archivo que se edita por reel. Tiempos en segundos del reel (ver words.ts).
// Punto de partida sin estilo: cámara completa, gancho textual (regla fija), subtítulos y cierre. Todo lo demás
// sale de los efectos que la persona eligió en el menú (references/menu-efectos.md): copiar fx-efectos.tsx → src/fx.tsx,
// mg.tsx → src/mg.tsx, fx-apoyo-visual.tsx → src/apoyo.tsx o fx-documental.tsx → src/doc.tsx según lo que se use.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MARCA } from "./theme";
import { DURATION } from "./words";
import { Sfx, Sounds } from "./lib";
import { CAM_FULL, CamKeyV, CamV, CommentCTA, HookTitle, SubsV, subsY } from "./reel";

export const CTA_SECONDS = 3.4;
const z = (at: number, zoom = 1): CamKeyV => ({ at, box: CAM_FULL, zoom });

// Saltos de encuadre en los cortes (mismo cuadro con otro zoom = corte seco)
const CAM: CamKeyV[] = [z(0), z(3, 1.08)];

const KEYWORDS = ["palabra", "clave"];

const SFX: Sfx[] = [{ at: DURATION, f: "whoosh" }, { at: DURATION + 0.4, f: "ding" }];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <CamV keys={CAM} until={DURATION} />
    <HookTitle to={3} lines={["Tu gancho en", "dos o tres líneas"]} />
    {/* aquí van los efectos elegidos */}
    <SubsV keywords={KEYWORDS} hide={[[DURATION, 999]]} yAt={subsY(CAM)} />
    {/* Anuncio para pauta: en vez de CommentCTA, un cierre con botón (TapButton / EndCard de mg.tsx) */}
    <CommentCTA from={DURATION} keyword={MARCA.ctaPalabra} sub={MARCA.ctaTexto} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
