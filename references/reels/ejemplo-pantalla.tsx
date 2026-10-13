// Reel 5 — "¿Funcionó? La prueba en vivo"
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MARCA } from "./theme";
import { DURATION } from "./words";
import { Background, Sfx, Sounds } from "./lib";
import {
  CAM_BOTTOM, CAM_FULL, CamKeyV, CamV, CommentCTA, HookTitle, NeuralBgV, SCR_HIDDEN, SCR_TOP, ScreenV, ScrKeyV, SubsV,
  ToolBadgeV, subsY,
} from "./reel";

export const CTA_SECONDS = 3.4;
const full = (zoom = 1) => ({ box: CAM_FULL, zoom, fy: 42 });
const bottom = { box: CAM_BOTTOM, fy: 36 };

const CAM: CamKeyV[] = [
  { at: 0, ...bottom }, // gancho arriba, luego la prueba en pantalla
  { at: 34.6, ...full(1.12) }, // "funcionó todo muy bien"
  { at: 36.7, ...full(1.0) },
];

const SCR: ScrKeyV[] = [
  { at: 0, box: SCR_HIDDEN, cx: 0.3, cy: 0.4, zoom: 1.3 },
  { at: 4.6, box: SCR_TOP, cx: 0.3, cy: 0.4, zoom: 1.3 }, // resumen de Claude
  { at: 8.2, box: SCR_TOP, cx: 0.62, cy: 0.42, zoom: 1.5 }, // elijo horario
  { at: 11.7, box: SCR_TOP, cx: 0.6, cy: 0.42, zoom: 1.55 }, // completo el formulario
  { at: 19.1, box: SCR_TOP, cx: 0.52, cy: 0.44, zoom: 1.9 }, // "your meeting has been scheduled"
  { at: 21.9, box: SCR_TOP, cx: 0.3, cy: 0.5, zoom: 1.9 }, // aparece en el pipeline
  { at: 31.4, box: SCR_TOP, cx: 0.42, cy: 0.56, zoom: 2.4 }, // Propietario: Tania
  { at: 34.6, box: SCR_HIDDEN, cx: 0.42, cy: 0.56, zoom: 2.4 },
];

const KEYWORDS = ["probado", "pena", "delegado", "funciona", "registrada", "flujo", "asignó", "tania", "perfecto", "funcionó", "tiempo"];

const SFX: Sfx[] = [
  { at: 0.1, f: "whoosh", v: 0.6 }, { at: 4.6, f: "whoosh", v: 0.5 },
  { at: 8.2, f: "whoosh" }, { at: 11.7, f: "whoosh", v: 0.5 }, { at: 19.14, f: "ding" },
  { at: 21.9, f: "whoosh", v: 0.5 }, { at: 25.24, f: "pop" },
  { at: 31.4, f: "whoosh", v: 0.5 }, { at: 33.2, f: "ding" },
  { at: 34.6, f: "boom", v: 0.5 }, { at: 35.66, f: "ding" },
  { at: DURATION, f: "whoosh" }, { at: DURATION + 0.4, f: "ding" },
];

const Scenes = () => (
  <>
    <HookTitle to={4.5} lines={["¿Funcionó lo que", "armó mi agente?", "Lo pruebo en vivo"]} mark="vivo" />
    <ToolBadgeV from={19.14} to={21.8} name="Reunión agendada" />
    <ToolBadgeV from={25.24} to={31.3} logo="gohighlevel.svg" wordmark name="HighLevel" />
    <ToolBadgeV from={33.2} to={34.5} name="Asignado a Tania" />
    <ToolBadgeV from={35.66} to={38.5} name="¡Funcionó!" top={330} />
  </>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <NeuralBgV />
    <ScreenV keys={SCR} until={DURATION} />
    <CamV keys={CAM} until={DURATION} />
    <Scenes />
    <SubsV keywords={KEYWORDS} hide={[[DURATION, 999]]} yAt={subsY(CAM)} />
    <CommentCTA from={DURATION} keyword={MARCA.ctaPalabra} sub={MARCA.ctaTexto} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
