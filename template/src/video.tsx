// ÚNICO archivo que se edita por video. Tiempos en segundos del video YA CORTADO (ver words.ts).
// EJEMPLO (historia ficticia de "Sofía", 41 s) para ver cómo se usa cada pieza:
// reemplazarlo completo con las escenas del video nuevo.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import {
  Arrow,
  Background,
  Brand,
  CamKey,
  Camera,
  Card,
  CARD_AREA,
  Chip,
  Counter,
  END,
  EndTitle,
  JourneyBar,
  LowerThird,
  Node,
  PIP,
  ProgressBar,
  Quote,
  Row,
  Sfx,
  Sounds,
  SPLIT,
  SPLIT_CARD,
  Stat,
  Subtitles,
  Title,
  punch,
} from "./lib";

// 1) Encuadres: cambios de caja animan; mismo tamaño con otro zoom = punch-in (corte seco)
const KEYS: CamKey[] = [
  { at: 0, box: punch(1.0) },
  { at: 1.6, box: punch(1.12) },
  { at: 2.3, box: PIP },
  { at: 17.55, box: punch(1.2) },
  { at: 18.85, box: SPLIT },
  { at: 22.8, box: PIP },
  { at: 28.1, box: punch(1.0) },
  { at: 36.9, box: punch(1.16) },
  { at: 40.1, box: END },
];

// 2) Palabras que se pintan de lima en los subtítulos (sin tildes quitadas, en minúscula)
const KEYWORDS = [
  "programar", "web", "tecnología", "tres", "clientes", "mil", "dólares", "pasión", "profesión",
  "sorprendente", "experiencia", "aprender", "compartir", "oportunidades", "cero", "inteligencia",
  "artificial", "cualquiera", "entrevista",
];

// 3) Tramos sin subtítulos (cuando una Quote o el cierre ya muestran el texto)
const HIDE_SUBS: [number, number][] = [[37.25, 99]];

// 4) Efectos: whoosh en cada cambio de encuadre, pop al aparecer ítems, ding en números/logros,
//    click al tachar, boom (suave) en punch-ins
const SFX: Sfx[] = [
  { at: 1.6, f: "boom", v: 0.5 },
  { at: 2.3, f: "whoosh" },
  { at: 2.64, f: "pop" },
  { at: 4.64, f: "pop" },
  { at: 6.74, f: "pop" },
  { at: 8.3, f: "whoosh" },
  { at: 9.3, f: "ding" },
  { at: 10.9, f: "ding" },
  { at: 13.6, f: "pop" },
  { at: 17.3, f: "ding", v: 0.4 },
  { at: 17.55, f: "boom", v: 0.6 },
  { at: 18.85, f: "whoosh" },
  { at: 19.5, f: "pop" },
  { at: 20.3, f: "click" },
  { at: 20.8, f: "pop" },
  { at: 21.9, f: "click" },
  { at: 22.8, f: "whoosh" },
  { at: 24.2, f: "pop" },
  { at: 24.9, f: "pop" },
  { at: 26.35, f: "ding" },
  { at: 28.1, f: "whoosh" },
  { at: 32.6, f: "pop", v: 0.6 },
  { at: 36.4, f: "ding", v: 0.6 },
  { at: 36.9, f: "boom", v: 0.5 },
  { at: 39.5, f: "click" },
  { at: 40.1, f: "whoosh" },
];

// 5) Escenas
const Scenes = () => (
  <>
    {/* PIP 2.3–17.5: dos tarjetas seguidas */}
    <Card from={2.35} to={8.15} style={CARD_AREA}>
      <Chip color={C.violet}>Hace unos meses</Chip>
      <Title>Sofía arrancó desde cero</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Row at={2.64} icon="x">No sabía programar</Row>
        <Row at={4.64} icon="x">Nunca había creado una página web</Row>
        <Row at={6.74} icon="x">Trabajaba fuera de la tecnología</Row>
      </div>
    </Card>

    <Card from={8.3} to={17.5} style={CARD_AREA}>
      <Chip color={C.lime}>Hoy</Chip>
      <Title>Los resultados de Sofía</Title>
      <div style={{ display: "flex", gap: 22 }}>
        <Stat at={9.3} accent={C.lime} label="clientes" big={<Counter at={9.3} to={3} dur={0.5} />} />
        <Stat at={10.9} accent={C.lime} label="dólares facturados" big={<Counter at={10.9} to={1000} prefix="+$" />} />
        <Stat at={13.6} accent={C.violet} label="nueva pasión" big="♥" />
      </div>
      <ProgressBar at={16.3} dur={1.1} showAt={15.1} left="Pasión" right="Profesión de tiempo completo" />
    </Card>

    {/* SPLIT 18.85–22.8 */}
    <Card from={18.95} to={22.75} style={SPLIT_CARD}>
      <Chip color={C.lime}>Lo más sorprendente</Chip>
      <Title size={52}>Sin ninguna de estas ventajas</Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Row at={19.5} icon="x" strikeAt={20.3}>Salir a buscar clientes</Row>
        <Row at={20.8} icon="x" strikeAt={21.9}>Experiencia previa</Row>
      </div>
    </Card>

    {/* PIP 22.8–28.1: flujo de 3 pasos */}
    <Card from={22.85} to={28.0} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.violet}>Su fórmula</Chip>
      <Title>Simplemente empezó</Title>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Node at={24.2} n="01" label="Aprender" accent={C.violet} />
        <Arrow at={24.6} />
        <Node at={24.9} n="02" label="Compartir" accent={C.violet} />
        <Arrow at={25.9} />
        <Node at={26.35} n="03" label="Oportunidades" accent={C.lime} />
      </div>
    </Card>

    {/* FULL 28.1–36.9: etiquetas arriba */}
    <LowerThird from={28.3} to={36.85} tag="Entrevista" text="La historia de Sofía" />
    <JourneyBar from={32.6} to={36.85} fillAt={33.3} fillDur={3.1} left="Desde cero" right="Proyectos con IA" />

    {/* Punch-in 36.9–40.1: frase destacada */}
    <Quote
      from={37.3}
      to={40.05}
      mark="cualquiera"
      lines={[
        [["“Si", 38.36], ["ella", 38.54], ["puede", 38.74], ["hacerlo,", 38.94]],
        [["cualquiera", 39.5], ["puede.”", 39.74]],
      ]}
    />

    {/* END 40.1–fin */}
    <EndTitle from={40.15} chip="▶ A continuación" title="Vamos a ver la entrevista" />
  </>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <Camera keys={KEYS} />
    <Scenes />
    <Subtitles keys={KEYS} keywords={KEYWORDS} hide={HIDE_SUBS} />
    <Brand />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
