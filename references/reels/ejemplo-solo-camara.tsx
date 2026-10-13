// Reel 1 — "Mi agente IA trabaja mientras estoy en reuniones" (toma cruda de la intro, solo cámara).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MARCA } from "./theme";
import { DURATION } from "./words";
import {
  AgentTasks, Arrow, Background, Card, Chip, LogoNode, Meter, Node, PromptCard, Row, Sfx, Sounds, Stat, Title,
} from "./lib";
import {
  CAM_BOTTOM, CAM_FULL, CamKeyV, CamV, CommentCTA, HookTitle, NeuralBgV, SubsV, ToolBadgeV, ZONA_TARJETA, subsY,
} from "./reel";

export const CTA_SECONDS = 3.4;

const full = (zoom = 1) => ({ box: CAM_FULL, zoom, fy: 40 });
const bottom = { box: CAM_BOTTOM, fy: 46 };

const CAM: CamKeyV[] = [
  { at: 0, ...full(1.0) },
  { at: 1.6, ...full(1.1) }, // "reuniones"
  { at: 3.35, ...bottom }, // el agente trabaja
  { at: 9.95, ...full(1.12) }, // "Antes yo hacía todo eso a mano"
  { at: 11.9, ...bottom }, // lista + medidores
  { at: 20.3, ...full(1.0) }, // el cambio
  { at: 24.2, ...full(1.12) }, // "la verdad me cambió"
  { at: 26.1, ...bottom }, // 1 mañana vs 1 semana
  { at: 29.4, ...full(1.0) }, // en este video
  { at: 32.45, ...bottom }, // instrucción + agente trabajando
  { at: 38.35, ...full(1.14) }, // "tal cual quede, sin editar"
  { at: 40.3, ...full(1.0) },
];

const KEYWORDS = [
  "reuniones", "agente", "gohighlevel", "mano", "pipelines", "vender", "operativo", "agentes",
  "mañana", "semana", "instrucción", "editar", "proceso",
];

const SFX: Sfx[] = [
  { at: 0.1, f: "whoosh", v: 0.6 },
  { at: 1.6, f: "boom", v: 0.5 },
  { at: 3.35, f: "whoosh" },
  { at: 4.36, f: "pop" }, { at: 5.02, f: "pop" }, { at: 8.2, f: "ding" },
  { at: 9.95, f: "boom", v: 0.5 },
  { at: 11.9, f: "whoosh" },
  { at: 13.48, f: "pop" }, { at: 14.02, f: "pop" }, { at: 14.66, f: "pop" },
  { at: 15.9, f: "whoosh", v: 0.6 }, { at: 17.4, f: "click" }, { at: 18.8, f: "pop" },
  { at: 20.3, f: "whoosh" }, { at: 21.44, f: "pop", v: 0.6 },
  { at: 24.2, f: "boom", v: 0.5 },
  { at: 26.1, f: "whoosh" }, { at: 26.94, f: "ding" }, { at: 28.88, f: "pop" },
  { at: 29.4, f: "whoosh" },
  { at: 32.45, f: "whoosh" }, { at: 34.6, f: "click" }, { at: 35.15, f: "whoosh", v: 0.6 },
  { at: 35.8, f: "pop" }, { at: 36.4, f: "pop" }, { at: 37.0, f: "pop" }, { at: 37.7, f: "ding" },
  { at: 38.35, f: "boom", v: 0.5 },
  { at: DURATION, f: "whoosh" }, { at: DURATION + 0.4, f: "ding" },
];

const Scenes = () => (
  <>
    <HookTitle to={3.2} lines={["Mi agente IA trabaja", "mientras estoy", "en reuniones"]} mark="reuniones" />

    {/* 3.35–9.95: el agente arma el flujo */}
    <Card from={3.4} to={9.85} style={ZONA_TARJETA}>
      <Chip color={C.violet}>Mientras estaba en reuniones</Chip>
      <Title size={60}>Mi agente trabajó solo</Title>
      <div style={{ zoom: 0.74, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Node at={4.36} n="YO" label="Reuniones" accent={C.violet} />
        <Arrow at={4.8} />
        <LogoNode at={5.02} label="Agente IA" accent={C.violet} />
        <Arrow at={7.4} />
        <LogoNode at={8.2} logo="gohighlevel.svg" wordmark label="Flujo completo" accent={C.lime} />
      </div>
    </Card>

    {/* 11.9–15.85: lo que hacía a mano */}
    <Card from={11.95} to={15.8} style={ZONA_TARJETA}>
      <Chip color={C.red}>Antes, a mano</Chip>
      <Title size={54}>Tardes enteras configurando</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Row at={13.48} icon="x">Pipelines</Row>
        <Row at={14.02} icon="x">Automatizaciones</Row>
        <Row at={14.66} icon="x">Correos de seguimiento</Row>
      </div>
    </Card>

    {/* 15.9–20.3: medidores */}
    <Card from={15.95} to={20.2} style={ZONA_TARJETA}>
      <Chip color={C.red}>Mi día antes</Chip>
      <Title size={60}>Todo el día en lo operativo</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <Meter at={17.4} label="Tiempo para vender" value={5} color={C.muted} />
        <Meter at={18.8} label="Tiempo en lo operativo" value={95} color={C.red} dur={1.3} />
      </div>
    </Card>

    {/* 20.3–26.1: el cambio */}
    <ToolBadgeV from={21.44} to={25.9} name="Delegar en agentes" />

    {/* 26.1–29.4: 1 mañana vs 1 semana */}
    <Card from={26.15} to={29.3} style={ZONA_TARJETA}>
      <Chip color={C.lime}>El mismo trabajo</Chip>
      <Title size={60}>Antes vs hoy</Title>
      <div style={{ display: "flex", gap: 20 }}>
        <Stat at={26.94} accent={C.lime} label="hoy" big={<span style={{ fontSize: 56 }}>1 mañana</span>} />
        <Stat at={28.88} accent={C.violet} label="antes" big={<span style={{ fontSize: 56 }}>1 semana</span>} />
      </div>
    </Card>

    {/* 32.45–38.35: instrucción + agente trabajando */}
    <PromptCard
      from={32.5}
      to={35.1}
      typeFrom={32.85}
      typeTo={34.55}
      text="Arma en GoHighLevel el pipeline, las automatizaciones y los correos de seguimiento."
      style={ZONA_TARJETA}
    />
    <AgentTasks
      from={35.15}
      to={38.3}
      title="Trabajando"
      style={ZONA_TARJETA}
      tasks={[
        { label: "Pipeline de ventas", at: 35.8, logo: "gohighlevel.svg" },
        { label: "Automatizaciones", at: 36.4 },
        { label: "Correos de seguimiento", at: 37.0 },
        { label: "Listo para revisar", at: 37.7 },
      ]}
    />
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
