// Reel 2 — "El mito: no necesitas programar para usar agentes"
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MARCA } from "./theme";
import { DURATION } from "./words";
import { Background, Card, Chip, PromptCard, Row, Sfx, Sounds, Stat, Title } from "./lib";
import { CAM_BOTTOM, CAM_FULL, CamKeyV, CamV, CommentCTA, HookTitle, NeuralBgV, SubsV, ToolBadgeV, ZONA_TARJETA, subsY } from "./reel";

export const CTA_SECONDS = 3.4;
const full = (zoom = 1) => ({ box: CAM_FULL, zoom, fy: 42 });
const bottom = { box: CAM_BOTTOM, fy: 36 };

const CAM: CamKeyV[] = [
  { at: 0, ...bottom }, // gancho arriba + el mito
  { at: 8.35, ...full(1.0) }, // sistema conversacional
  { at: 14.9, ...bottom }, // como pedírselo a un compañero
  { at: 24.9, ...full(1.0) }, // el simple Claude
  { at: 30.0, ...bottom }, // una semana → pocos minutos
];

const KEYWORDS = ["mito", "programación", "técnica", "contrario", "conversacional", "compañero", "fácil", "claude", "semana", "minutos"];

const SFX: Sfx[] = [
  { at: 0.1, f: "whoosh", v: 0.6 }, 
  { at: 2.7, f: "whoosh" }, { at: 5.2, f: "pop" }, { at: 6.52, f: "pop" }, { at: 7.62, f: "click" }, { at: 7.9, f: "click" },
  { at: 8.35, f: "whoosh" }, { at: 12.9, f: "ding", v: 0.6 },
  { at: 14.9, f: "whoosh" }, { at: 19.9, f: "click" },
  { at: 24.9, f: "whoosh" }, { at: 28.2, f: "pop" },
  { at: 30.0, f: "whoosh" }, { at: 32.26, f: "pop" }, { at: 34.06, f: "ding" },
  { at: DURATION, f: "whoosh" }, { at: DURATION + 0.4, f: "ding" },
];

const Scenes = () => (
  <>
    <HookTitle to={2.6} lines={["¿Hay que saber", "programar para usar", "agentes de IA?"]} mark="programar" />

    <Card from={2.7} to={8.25} style={ZONA_TARJETA}>
      <Chip color={C.red}>El mito</Chip>
      <Title size={58}>Para usar agentes necesitas…</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Row at={5.2} icon="x" strikeAt={7.62}>Saber programar</Row>
        <Row at={6.52} icon="x" strikeAt={7.94}>Ser muy técnica/o</Row>
      </div>
    </Card>

    <ToolBadgeV from={12.9} to={14.7} name="Sistema conversacional" />

    <PromptCard
      from={14.95}
      to={24.8}
      typeFrom={15.2}
      typeTo={19.9}
      agent="Claude"
      logo="claude.svg"
      text="Necesito un calendario que reparta las reuniones entre mi equipo. ¿Me lo armas?"
      style={ZONA_TARJETA}
    />

    <ToolBadgeV from={28.2} to={29.9} logo="claude.svg" name="Claude" />

    <Card from={30.05} to={DURATION - 0.1} style={ZONA_TARJETA}>
      <Chip color={C.lime}>Con Claude</Chip>
      <Title size={58}>El mismo trabajo</Title>
      <div style={{ display: "flex", gap: 20 }}>
        <Stat at={32.26} accent={C.violet} label="antes" big={<span style={{ fontSize: 56 }}>1 semana</span>} />
        <Stat at={34.06} accent={C.lime} label="ahora" big={<span style={{ fontSize: 56 }}>minutos</span>} />
      </div>
    </Card>
  </>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <NeuralBgV />
    <CamV keys={CAM} until={DURATION} />
    <Scenes />
    <SubsV keywords={KEYWORDS} hide={[[DURATION, 999]]} yAt={subsY(CAM)} />
    <CommentCTA from={DURATION} keyword={MARCA.ctaPalabra} sub={MARCA.ctaTexto} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
