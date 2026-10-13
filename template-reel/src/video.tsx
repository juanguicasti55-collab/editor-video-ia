// ÚNICO archivo que se edita por reel. Tiempos en segundos del reel (ver words.ts).
// EJEMPLO de arranque: gancho con cámara completa → pantalla dividida con tarjeta arriba y la cara
// completa abajo → zoom de énfasis → CTA. Reemplazar con las escenas del reel (ver references/reels/).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MARCA } from "./theme";
import { DURATION } from "./words";
import { Background, Card, Chip, Row, Sfx, Sounds, Title } from "./lib";
import { BrollTop, BrollV, CAM_BOTTOM, CAM_FULL, CamKeyV, CARD_SPLIT, CommentCTA, DualCam, HookTitle, NeuralBgV, SubsV, subsYDual } from "./reel";

export const CTA_SECONDS = 3.4;
const full = (zoom = 1) => ({ box: CAM_FULL, zoom });
const split = { box: CAM_BOTTOM }; // cualquier caja con alto < 1500 = pantalla dividida (cara completa abajo)

const CAM: CamKeyV[] = [
  { at: 0, ...full() }, // gancho: la cara manda
  { at: 3.0, ...split }, // tarjeta arriba
  { at: 9.0, ...full(1.15) }, // zoom de énfasis
];

// Tomas de apoyo arriba (clips en public/broll/). Vacío si no hay.
const BROLL: BrollV[] = [];

const KEYWORDS = ["palabra", "clave"];

const SFX: Sfx[] = [
  { at: 0.1, f: "whoosh", v: 0.6 },
  { at: 3.0, f: "whoosh" }, { at: 4.0, f: "pop" }, { at: 5.5, f: "pop" },
  { at: 9.0, f: "boom", v: 0.5 },
  { at: DURATION, f: "whoosh" }, { at: DURATION + 0.4, f: "ding" },
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <NeuralBgV />
    <BrollTop list={BROLL} />
    <DualCam keys={CAM} />
    <HookTitle to={2.9} lines={["Tu gancho en", "tres líneas", "como máximo"]} mark="gancho" />
    <Card from={3.05} to={8.9} style={CARD_SPLIT}>
      <Chip color={C.lime}>Etiqueta</Chip>
      <Title size={58}>Título corto</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Row at={4.0} icon="check">Primer punto</Row>
        <Row at={5.5} icon="check">Segundo punto</Row>
      </div>
    </Card>
    <SubsV keywords={KEYWORDS} hide={[[DURATION, 999]]} yAt={subsYDual(CAM)} />
    <CommentCTA from={DURATION} keyword={MARCA.ctaPalabra} sub={MARCA.ctaTexto} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
