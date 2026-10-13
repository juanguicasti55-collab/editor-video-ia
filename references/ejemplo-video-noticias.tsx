// EJEMPLO REAL: video de noticias (lanzamientos del DevDay 2026 de OpenAI) con tomas del evento (b-roll),
// tarjetas de sección, LogoRow, Options y SFX automáticos. Solo como referencia de patrones: los archivos
// de public/broll no vienen incluidos.
// Tiempos en segundos del video YA CORTADO (ver words.ts).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import {
  AgentTasks,
  Arrow,
  Background,
  Brand,
  Broll,
  BrollItem,
  CamKey,
  Camera,
  Card,
  CARD_AREA,
  Chip,
  Counter,
  END,
  EndTitle,
  Logo,
  LogoNode,
  LogoRow,
  LowerThird,
  NeuralBg,
  Node,
  Options,
  PIP,
  PromptCard,
  Quote,
  Row,
  SectionCard,
  Sfx,
  Sounds,
  SPLIT,
  SPLIT_CARD,
  Stat,
  Subtitles,
  Title,
  ToolBadge,
  punch,
} from "./lib";

const F = punch(1.0);
const P = punch;

// 1) Encuadres
const KEYS: CamKey[] = [
  { at: 0.0, box: F },
  { at: 3.84, box: P(1.15) },
  { at: 6.62, box: PIP }, // b-roll dots
  { at: 15.96, box: F },
  { at: 19.92, box: P(1.12) }, // quote
  { at: 24.8, box: PIP },
  { at: 39.32, box: F },
  { at: 45.66, box: P(1.1) },
  { at: 50.54, box: PIP },
  { at: 66.46, box: F },
  { at: 68.46, box: P(1.18) },
  { at: 69.76, box: SPLIT }, // parte 1
  { at: 72.6, box: PIP },
  { at: 81.52, box: F },
  { at: 84.9, box: PIP },
  { at: 109.24, box: F },
  { at: 113.06, box: P(1.15) },
  { at: 115.08, box: SPLIT },
  { at: 125.4, box: PIP },
  { at: 136.04, box: F },
  { at: 137.54, box: PIP },
  { at: 147.38, box: F },
  { at: 150.3, box: SPLIT },
  { at: 154.64, box: F },
  { at: 158.16, box: PIP },
  { at: 174.66, box: SPLIT },
  { at: 178.02, box: P(1.15) },
  { at: 180.06, box: PIP },
  { at: 189.02, box: F },
  { at: 191.84, box: PIP },
  { at: 213.8, box: F },
  { at: 218.68, box: SPLIT }, // parte 2
  { at: 222.42, box: PIP },
  { at: 239.22, box: P(1.15) },
  { at: 241.26, box: SPLIT },
  { at: 246.46, box: PIP },
  { at: 271.56, box: SPLIT },
  { at: 279.34, box: PIP },
  { at: 285.8, box: P(1.15) },
  { at: 289.58, box: PIP },
  { at: 307.0, box: F },
  { at: 310.96, box: P(1.15) },
  { at: 312.0, box: PIP },
  { at: 319.28, box: SPLIT }, // parte 3
  { at: 324.54, box: PIP },
  { at: 381.94, box: P(1.15) },
  { at: 384.1, box: PIP },
  { at: 391.66, box: SPLIT },
  { at: 394.56, box: F },
  { at: 400.46, box: SPLIT }, // parte 4
  { at: 404.88, box: F },
  { at: 409.76, box: P(1.15) },
  { at: 411.82, box: PIP },
  { at: 443.1, box: F },
  { at: 444.34, box: P(1.1) },
  { at: 448.08, box: PIP },
  { at: 461.36, box: SPLIT },
  { at: 468.92, box: PIP },
  { at: 481.14, box: F },
  { at: 483.96, box: P(1.12) },
  { at: 485.82, box: PIP },
  { at: 513.36, box: F },
  { at: 520.36, box: P(1.1) },
  { at: 525.04, box: P(1.18) }, // quote
  { at: 528.52, box: SPLIT },
  { at: 530.4, box: PIP },
  { at: 543.04, box: SPLIT },
  { at: 551.54, box: PIP },
  { at: 563.48, box: P(1.12) },
  { at: 565.84, box: PIP },
  { at: 574.0, box: SPLIT },
  { at: 583.34, box: PIP },
  { at: 595.88, box: SPLIT },
  { at: 604.32, box: PIP },
  { at: 612.44, box: P(1.18) }, // quote
  { at: 615.98, box: F },
  { at: 618.32, box: SPLIT },
  { at: 634.32, box: PIP },
  { at: 642.14, box: F },
  { at: 648.44, box: P(1.1) },
  { at: 654.74, box: F },
  { at: 657.94, box: END },
];

// 2) Tomas del evento (detrás de la cámara)
const BROLL: BrollItem[] = [
  { from: 6.62, to: 9.64, src: "dots_title.mp4", tag: "Nuevo: dots" },
  { from: 9.64, to: 12.32, src: "dot_leave.mp4", tag: "Trabaja aunque te vayas" },
  { from: 12.32, to: 15.94, src: "dot_phone.mp4", tag: "Le puedes llamar" },
  { from: 31.86, to: 34.96, src: "sam_open.mp4", tag: "DevDay 2026 · San Francisco" },
  { from: 35.0, to: 39.11, src: "voice_fail.mp4", start: 8, tag: "En vivo · lo que falló" },
  { from: 72.6, to: 75.78, src: "dots_stage.mp4", tag: "Presentación de dots" },
  { from: 84.9, to: 88.2, src: "dot_jojo_pc.mp4", start: 0.5, tag: "La computadora de tu dot" },
  { from: 88.2, to: 91.03, src: "dot_jojo_chat.mp4", tag: "Ves lo que está haciendo" },
  { from: 99.0, to: 101.59, src: "dot_park.mp4", tag: "Llamada con tu dot" },
  { from: 180.06, to: 189.0, src: "voice_fail.mp4", tag: "En vivo · falla del modo voz" },
  { from: 191.84, to: 198.54, src: "dots_avail.mp4", tag: "Disponibilidad" },
  { from: 207.9, to: 213.49, src: "specialist.mp4", tag: "Dots especializados" },
  { from: 222.42, to: 229.79, src: "sol_slide.mp4", tag: "GPT-6.1 Sol" },
  { from: 256.86, to: 259.9, src: "sol_table.mp4", start: 1.5, tag: "Pruebas de OpenAI" },
  { from: 259.9, to: 263.46, src: "sol_slide.mp4", start: 1, tag: "DeepSWE: Sol vs. Astra" },
  { from: 279.34, to: 285.78, src: "rockets.mp4", tag: "Ultrafast vs. normal" },
  { from: 297.04, to: 301.93, src: "pro500.mp4", tag: "Nuevo plan Pro 500" },
  { from: 324.54, to: 327.26, src: "space_slide.mp4", tag: "ChatGPT Space" },
  { from: 333.94, to: 340.12, src: "space_chart.mp4", zoom: 1.32, origin: "72% 38%", tag: "Demo de Space" },
  { from: 375.0, to: 381.78, src: "slack.mp4", zoom: 1.32, origin: "72% 38%", tag: "Dots en Slack" },
  { from: 411.82, to: 418.19, src: "cloud.mp4", tag: "Codex en la nube" },
  { from: 428.04, to: 431.16, src: "agents_api.mp4", tag: "API de agentes" },
  { from: 438.06, to: 443.1, src: "game.mp4", zoom: 1.32, origin: "72% 38%", tag: "Uso de la computadora" },
  { from: 448.08, to: 452.16, src: "decisions.mp4", tag: "API de decisiones" },
  { from: 493.92, to: 498.88, src: "signin.mp4", tag: "Iniciar sesión con ChatGPT" },
  { from: 498.9, to: 502.58, src: "plugins.mp4", tag: "Extensiones de plugins" },
  { from: 502.58, to: 508.54, src: "figma.mp4", tag: "Figma dentro de ChatGPT" },
  { from: 508.6, to: 513.13, src: "market.mp4", tag: "OpenAI Marketplace" },
  { from: 530.4, to: 535.95, src: "romain_fail.mp4", zoom: 1.32, origin: "72% 38%", tag: "En vivo · otra demo con fallas" },
  { from: 551.54, to: 557.44, src: "private.mp4", tag: "3 · Privacidad" },
];

// 3) Palabras en lima
const KEYWORDS = [
  "dots", "dot", "agente", "equipo", "astra", "sol", "luna", "proactivo", "reactiva", "factura", "seguridad",
  "reglas", "incluido", "ultrafast", "caché", "descuento", "space", "codex", "decisiones", "plan", "marketplace",
  "ecosistema", "humo", "comentarios", "dinero", "teléfono", "4.000", "4000", "95", "500", "enorme", "subestimado",
];

// 4) Sin subtítulos (frases grandes y cierre)
const HIDE_SUBS: [number, number][] = [
  [20.28, 24.49],
  [525.16, 528.5],
  [612.57, 615.96],
  [658.0, 999],
];

// 5) Efectos: los whoosh/boom salen solos de KEYS; aquí los pops/dings/clicks de las tarjetas.
const POPS = [
  27.64, 29.12, 53.74, 55.7, 59.12, 62.24, 95.2, 95.96, 96.48, 104.82, 106.22, 107.12, 116.36, 119.58,
  138.1, 141.16, 144.18, 150.74, 153.26, 158.52, 165.9, 170.44, 175.42, 199.3, 203.02, 207.1, 249.5,
  253.66, 256.16, 274.18, 276.2, 278.0, 291.24, 293.62, 294.78, 302.64, 304.44, 312.8, 314.68, 317.1,
  328.9, 329.4, 329.82, 342.36, 345.76, 352.5, 353.34, 370.96, 372.34, 386.14, 388.48, 390.12, 419.22,
  421.76, 425.32, 433.84, 434.94, 436.44, 456.5, 457.18, 457.54, 458.06, 472.0, 476.86, 479.66, 486.54,
  490.74, 492.38, 511.38, 511.8, 512.28, 512.56, 536.8, 538.52, 540.7, 545.9, 547.4, 559.86, 562.3,
  566.28, 568.96, 572.74, 575.44, 578.54, 581.32, 583.78, 587.28, 592.06, 599.44, 600.58, 608.22, 609.46,
  611.06, 622.36, 624.76, 627.74, 640.74,
];
const DINGS = [25.84, 92.36, 135.1, 201.16, 233.42, 235.36, 237.48, 242.62, 244.48, 263.72, 270.64, 300.22, 374.02, 458.96, 465.18, 484.54];
const CLICKS = [78.08, 80.22, 364.06, 393.54, 600.06, 601.62];

const buildSfx = (): Sfx[] => {
  const out: Sfx[] = [];
  KEYS.forEach((k, i) => {
    if (i === 0) return;
    const prev = KEYS[i - 1].box;
    if (prev.w === k.box.w && prev.h === k.box.h) {
      if (k.box.zoom > prev.zoom + 0.05) out.push({ at: k.at, f: "boom", v: 0.5 });
    } else out.push({ at: k.at, f: "whoosh" });
  });
  BROLL.forEach((b, i) => {
    if (i > 0 && Math.abs(BROLL[i - 1].to - b.from) < 0.2) out.push({ at: b.from, f: "whoosh", v: 0.6 });
  });
  POPS.forEach((at) => out.push({ at, f: "pop" }));
  DINGS.forEach((at) => out.push({ at, f: "ding", v: 0.7 }));
  CLICKS.forEach((at) => out.push({ at, f: "click" }));
  out.sort((a, b) => a.at - b.at);
  // no más de un efecto cada 0,3 s (manda el primero)
  return out.filter((s, i, arr) => i === 0 || s.at - arr[i - 1].at >= 0.3);
};
const SFX = buildSfx();

const rows = (gap = 20): React.CSSProperties => ({ display: "flex", flexDirection: "column", gap });
const flow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between" };

// 6) Escenas
const Scenes = () => (
  <>
    {/* ---------- GANCHO ---------- */}
    <Quote
      from={20.28}
      to={24.44}
      mark="equipo"
      lines={[
        [["Ya", 20.3], ["no", 20.52], ["quiere", 20.82], ["ser", 21.06], ["tu", 21.22], ["chat.", 21.42]],
        [["Quiere", 23.06], ["ser", 23.22], ["parte", 23.54], ["de", 23.8], ["tu", 23.96], ["equipo.", 24.04]],
      ]}
    />
    <Card from={24.87} to={31.66} style={CARD_AREA}>
      <Chip color={C.violet}>DevDay 2026</Chip>
      <Title>
        <Counter at={25.84} to={20} dur={0.6} prefix="+" /> anuncios en un día
      </Title>
      <div style={rows()}>
        <Row at={27.64} icon="x">Muchos no te cambian nada</Row>
        <Row at={29.12} icon="check">Otros sí, si tienes un negocio</Row>
      </div>
    </Card>
    <LowerThird from={39.5} to={45.06} tag="Soy [tu nombre]" text="A qué te dedicas" />
    <Card from={50.61} to={65.97} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.violet}>Septiembre 2026</Chip>
      <Title>Un mes de locura</Title>
      <div style={flow}>
        <Node at={53.74} n="3 SEP" label="GPT-6 Astra" accent={C.violet} />
        <Arrow at={57.58} />
        <Node at={59.12} n="22 SEP" label="Sol y Luna" accent={C.violet} />
        <Arrow at={61.62} />
        <Node at={62.24} n="29 SEP" label="DevDay" accent={C.lime} />
      </div>
    </Card>

    {/* ---------- PARTE 1: DOTS ---------- */}
    <SectionCard from={69.84} to={72.35} n={1} title="De chat a empleado: dots" titleAt={70.12} />
    <PromptCard
      from={75.84}
      to={81.38}
      typeFrom={76.18}
      typeTo={80.22}
      agent="Tu dot"
      logo="openai.svg"
      text="Objetivo: que ningún cliente se quede sin factura. Pídeme aprobación antes de enviar."
    />
    <ToolBadge from={81.86} to={84.88} logo="openai.svg" name="GPT-6 Astra" sub="El cerebro de los dots" />
    <Card from={91.38} to={94.4} style={{ ...CARD_AREA, top: 200 }}>
      <Chip color={C.lime}>Conexiones</Chip>
      <div style={{ display: "flex", gap: 22, marginTop: 30 }}>
        <Stat at={92.36} accent={C.lime} label="apps conectadas por plugins" big={<Counter at={92.36} to={4000} prefix="+" />} />
      </div>
    </Card>
    <Card from={94.66} to={98.95} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.violet}>Te habla por</Chip>
      <Title>Donde tú ya trabajas</Title>
      <div style={flow}>
        <LogoNode at={95.2} logo="openai.svg" label="ChatGPT" accent={C.violet} />
        <LogoNode at={95.96} logo="slack.svg" label="Slack" accent={C.violet} />
        <LogoNode at={96.48} logo="teams.svg" label="Teams" accent={C.violet} />
      </div>
    </Card>
    <Card from={102.08} to={109.15} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.lime}>Memoria compartida</Chip>
      <Title>Mismo contexto en todos lados</Title>
      <div style={flow}>
        <Node at={104.82} n="01" label="ChatGPT" accent={C.violet} />
        <Arrow at={105.54} />
        <Node at={106.22} n="02" label="Mensaje" accent={C.violet} />
        <Arrow at={106.72} />
        <Node at={107.12} n="03" label="Sigue sabiendo" accent={C.lime} />
      </div>
    </Card>
    <Card from={115.14} to={125.2} style={SPLIT_CARD}>
      <Chip color={C.lime}>El cambio de fondo</Chip>
      <Title size={52}>De reactiva a proactiva</Title>
      <div style={rows()}>
        <Row at={116.36} icon="x" strikeAt={119.12}>Tú preguntas, responde</Row>
        <Row at={119.58} icon="check">Busca cómo ayudarte</Row>
      </div>
    </Card>
    <AgentTasks
      from={125.45}
      to={135.88}
      title="Tu dot trabajando"
      logo="openai.svg"
      tasks={[
        { label: "Revisa la facturación del mes", at: 128.52 },
        { label: "Detecta una factura olvidada", at: 130.84 },
        { label: "Prepara la factura", at: 133.86 },
        { label: "Tú apruebas y se envía", at: 135.1 },
      ]}
    />
    <Card from={137.58} to={146.76} style={CARD_AREA}>
      <Chip color={C.violet}>Piensa en tu negocio</Chip>
      <Title>Un dot que…</Title>
      <div style={rows()}>
        <Row at={138.1} icon="check">Lee los comentarios de clientes</Row>
        <Row at={141.16} icon="check">Te prepara las mejoras</Row>
        <Row at={144.18} icon="check">Saca clips, notas y posts</Row>
      </div>
    </Card>
    <Card from={150.36} to={154.62} style={SPLIT_CARD}>
      <Chip color={C.violet}>Y también</Chip>
      <Title size={52}>Tus propuestas, al día</Title>
      <div style={rows()}>
        <Row at={150.74} icon="check">Actualiza la propuesta</Row>
        <Row at={153.26} icon="check">Cuando el cliente cambia</Row>
      </div>
    </Card>
    <LowerThird from={154.82} to={157.88} tag="Seguridad" text="Si trabajas con clientes" />
    <Card from={158.2} to={174.38} style={CARD_AREA}>
      <Chip color={C.lime}>Tú tienes el control</Chip>
      <Title>Así protege tus datos</Title>
      <div style={rows()}>
        <Row at={158.52} icon="check">Trabaja en su propia nube</Row>
        <Row at={165.9} icon="check">En segundo plano: solo lee</Row>
        <Row at={170.44} icon="check">Tú defines las reglas</Row>
      </div>
    </Card>
    <Card from={174.7} to={177.5} style={SPLIT_CARD}>
      <Chip color={C.red}>Límite claro</Chip>
      <Title size={52}>Lo sensible es tuyo</Title>
      <div style={rows()}>
        <Row at={175.42} icon="x">Cambiar contraseñas</Row>
        <Row at={176.7} icon="check">Siempre en tus manos</Row>
      </div>
    </Card>
    <Card from={198.6} to={207.63} style={CARD_AREA}>
      <Chip color={C.lime}>Precio</Chip>
      <Title>Qué incluye tu plan</Title>
      <div style={rows()}>
        <Row at={199.3} icon="check">El primer dot, sin costo extra</Row>
        <Row at={203.02} icon="check">Hablar con él no gasta límites</Row>
        <Row at={207.1} icon="x">Tareas en Codex sí gastan</Row>
      </div>
    </Card>
    <LowerThird from={213.96} to={218.43} tag="Comenta" text="¿Qué tarea le darías a tu dot?" />

    {/* ---------- PARTE 2: MODELOS ---------- */}
    <SectionCard from={218.73} to={222.3} n={2} title="Más inteligencia por menos dinero" titleAt={220.22} />
    <Card from={230.16} to={238.96} style={CARD_AREA}>
      <Chip color={C.lime}>GPT-6.1 Sol</Chip>
      <Title>Casi Astra, a 1/5 del precio</Title>
      <div style={{ display: "flex", gap: 22 }}>
        <Stat at={235.36} accent={C.lime} label="por millón · entrada" big={<Counter at={235.36} to={2} dur={0.5} prefix="$" />} />
        <Stat at={237.48} accent={C.violet} label="por millón · salida" big={<Counter at={237.48} to={10} dur={0.5} prefix="$" />} />
      </div>
    </Card>
    <Card from={241.3} to={246.44} style={SPLIT_CARD}>
      <Chip color={C.lime}>El número que importa</Chip>
      <Title size={52}>Entrada en caché</Title>
      <div style={{ display: "flex", gap: 22 }}>
        <Stat at={242.62} accent={C.lime} label="por millón" big="$0,10" />
        <Stat at={244.48} accent={C.violet} label="de descuento" big={<Counter at={244.48} to={95} dur={0.6} suffix="%" />} />
      </div>
    </Card>
    <Card from={246.52} to={256.84} style={CARD_AREA}>
      <Chip color={C.violet}>¿Por qué importa?</Chip>
      <Title>Los agentes releen todo</Title>
      <div style={rows()}>
        <Row at={249.5} icon="x">Relee lo mismo una y otra vez</Row>
        <Row at={253.66} icon="check">Con caché: 95 % más barato</Row>
        <Row at={256.16} icon="check">Automatizaciones que ahora sí dan</Row>
      </div>
    </Card>
    <Card from={263.62} to={271.28} style={CARD_AREA}>
      <Chip color={C.lime}>Según OpenAI</Chip>
      <Title>Mismo nivel, mucho menos costo</Title>
      <div style={{ display: "flex", gap: 22 }}>
        <Stat at={263.72} accent={C.lime} label="del costo de Astra en código" big="1/5" />
        <Stat at={270.64} accent={C.violet} label="del costo en automatizaciones" big="1/3" />
      </div>
    </Card>
    <Card from={271.6} to={279.19} style={SPLIT_CARD}>
      <Chip color={C.violet}>Un detalle</Chip>
      <Title size={52}>¿Dónde está Sol?</Title>
      <div style={rows(16)}>
        <Row at={274.18} icon="check">ChatGPT Work y Codex</Row>
        <Row at={276.2} icon="x">Aún no en el chat</Row>
        <Row at={278.0} icon="check">Ya en la API</Row>
      </div>
    </Card>
    <Card from={289.62} to={296.82} style={CARD_AREA}>
      <Chip color={C.red}>Ultrafast: cuidado</Chip>
      <Title>Úsalo solo cuando paga</Title>
      <div style={rows()}>
        <Row at={291.24} icon="check">Si la velocidad te da dinero</Row>
        <Row at={293.62} icon="check">Atención al cliente en vivo</Row>
        <Row at={294.78} icon="check">Demos con el cliente esperando</Row>
      </div>
    </Card>
    <Card from={302.28} to={306.98} style={CARD_AREA}>
      <Chip color={C.lime}>
        Pro <Counter at={300.22} to={500} dur={0.6} prefix="$" /> al mes
      </Chip>
      <Title>Qué te da el plan más caro</Title>
      <div style={rows()}>
        <Row at={302.64} icon="check">Los límites de uso más altos</Row>
        <Row at={304.44} icon="check">Único con Astra Ultrafast</Row>
      </div>
    </Card>
    <Card from={312.04} to={319.16} style={CARD_AREA}>
      <Chip color={C.violet}>Mi opinión</Chip>
      <Title>¿Quién necesita Pro 500?</Title>
      <div style={rows()}>
        <Row at={312.8} icon="check">Construyes todo el día</Row>
        <Row at={314.68} icon="check">La velocidad es tu producto</Row>
        <Row at={317.1} icon="x">El resto: Plus o Pro alcanza</Row>
      </div>
    </Card>

    {/* ---------- PARTE 3: SPACE ---------- */}
    <SectionCard from={319.32} to={324.04} n={3} title="Tu equipo y tus agentes, juntos" titleAt={322.04} />
    <Card from={327.4} to={333.82} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.red}>El problema</Chip>
      <Title>Hechas solo para personas</Title>
      <div style={flow}>
        <LogoNode at={328.9} logo="drive.svg" label="Drive" accent={C.red} />
        <LogoNode at={329.4} logo="notion.svg" label="Notion" accent={C.red} />
        <LogoNode at={329.82} logo="slack.svg" label="Slack" accent={C.red} />
      </div>
    </Card>
    <Card from={340.32} to={349.54} style={CARD_AREA}>
      <Chip color={C.lime}>ChatGPT Space</Chip>
      <Title>Páginas dinámicas</Title>
      <div style={rows()}>
        <Row at={342.36} icon="check">Se actualizan solas</Row>
        <Row at={345.76} icon="check">Tablero de tareas siempre al día</Row>
      </div>
    </Card>
    <Card from={349.98} to={359.18} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.lime}>Diapositivas colaborativas</Chip>
      <Title>De charla a presentación</Title>
      <div style={flow}>
        <Node at={352.5} n="01" label="Conversación" accent={C.violet} />
        <Arrow at={352.92} />
        <Node at={353.34} n="02" label="Presentación" accent={C.violet} />
        <Arrow at={356.16} />
        <LogoNode at={356.78} logo="powerpoint.svg" label="PowerPoint" accent={C.lime} />
      </div>
    </Card>
    <PromptCard
      from={359.3}
      to={367.54}
      typeFrom={360.98}
      typeTo={364.06}
      agent="Tarea de equipo"
      logo="openai.svg"
      text="Cada lunes: junta los avances del proyecto y publica el resumen."
    />
    <AgentTasks
      from={368.16}
      to={374.7}
      title="Complemento de reuniones"
      logo="openai.svg"
      tasks={[
        { label: "Graba la reunión", at: 370.96 },
        { label: "Resume las decisiones", at: 372.34 },
        { label: "Actualiza el plan del proyecto", at: 374.02 },
      ]}
    />
    <LogoRow from={376.9} to={381.68} label="@ChatGPT en" items={[["slack.svg", 377.06], ["teams.svg", 377.58]]} />
    <Card from={384.14} to={391.42} style={CARD_AREA}>
      <Chip color={C.lime}>Para agencias</Chip>
      <Title>Un Space por cliente</Title>
      <div style={rows()}>
        <Row at={386.14} icon="check">Brief y reportes siempre al día</Row>
        <Row at={388.48} icon="check">Tu dot arma el informe</Row>
        <Row at={390.12} icon="check">El cliente comenta ahí mismo</Row>
      </div>
    </Card>
    <Card from={391.7} to={393.99} style={SPLIT_CARD}>
      <Chip color={C.red}>Adiós a</Chip>
      <div style={{ ...rows(), marginTop: 30 }}>
        <Row at={392.1} icon="x" strikeAt={393.54}>“¿Me reenvías el archivo?”</Row>
      </div>
    </Card>
    <LowerThird from={394.76} to={400.44} tag="Space" text="Pro · Business · Enterprise" />

    {/* ---------- PARTE 4: CONSTRUIR Y VENDER ---------- */}
    <SectionCard from={400.5} to={404.82} n={4} title="Construir y vender dentro de ChatGPT" titleAt={402.76} />
    <Card from={418.46} to={427.9} style={CARD_AREA}>
      <Chip color={C.lime}>Codex</Chip>
      <Title>Trabaja mientras no estás</Title>
      <div style={rows()}>
        <Row at={419.22} icon="check">Le hablas por voz</Row>
        <Row at={421.76} icon="check">Revisa tu código solo</Row>
        <Row at={425.32} icon="check">Seguridad 24/7 en la nube</Row>
      </div>
    </Card>
    <Card from={431.24} to={438.04} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.violet}>API de agentes</Chip>
      <Title>El mismo motor que Codex</Title>
      <div style={flow}>
        <Node at={433.84} n="TÚ" label="El trabajo" accent={C.violet} />
        <Arrow at={434.92} />
        <Node at={434.94} n="TÚ" label="Herramientas" accent={C.violet} />
        <Arrow at={436.06} />
        <LogoNode at={436.44} logo="openai.svg" label="Infraestructura" accent={C.lime} />
      </div>
    </Card>
    <LowerThird from={443.1} to={448.01} tag="Para agencias" text="Menos infraestructura que mantener" />
    <Card from={452.38} to={461.32} style={{ ...CARD_AREA, top: 120 }}>
      <Chip color={C.violet}>API de decisiones</Chip>
      <Title>Decide en tiempo real</Title>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Node at={456.5} n="LLEGA" label="Un mensaje" accent={C.violet} />
        <Arrow at={456.86} />
        <Options
          items={[
            ["Ventas", 457.18],
            ["Facturación", 457.54],
            ["Soporte", 458.06],
          ]}
          pick={2}
          pickAt={458.96}
        />
      </div>
    </Card>
    <Card from={461.4} to={468.64} style={{ ...SPLIT_CARD, top: 220 }}>
      <Chip color={C.lime}>El más subestimado</Chip>
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 36 }}>
        <Logo file="openai.svg" height={90} />
      </div>
      <Title size={64}>Iniciar sesión con ChatGPT</Title>
    </Card>
    <Card from={468.96} to={480.76} style={CARD_AREA}>
      <Chip color={C.violet}>Si creas apps</Chip>
      <Title>Quién paga la IA</Title>
      <div style={rows()}>
        <Row at={472.0} icon="x" strikeAt={475.8}>Hoy: tú, por cada usuario</Row>
        <Row at={476.86} icon="check">Entra con su ChatGPT</Row>
        <Row at={479.66} icon="check">Y usa su propio plan</Row>
      </div>
    </Card>
    <Card from={485.86} to={493.65} style={CARD_AREA}>
      <Chip color={C.lime}>El usuario decide</Chip>
      <Title>Control y privacidad</Title>
      <div style={rows()}>
        <Row at={486.54} icon="check">Límite semanal por app</Row>
        <Row at={490.74} icon="check">No ve tus chats ni memoria</Row>
        <Row at={492.38} icon="check">Solo nombre, correo y foto</Row>
      </div>
    </Card>
    <LogoRow
      from={510.92}
      to={513.08}
      label="Socios"
      items={[
        ["adobe.svg", 511.38],
        ["figma.svg", 511.8],
        ["hubspot.svg", 512.28],
        ["salesforce.svg", 512.56],
      ]}
    />
    <Quote
      from={525.16}
      to={528.5}
      mark="ecosistema?"
      lines={[
        [["¿Cuánto", 525.04], ["de", 525.42], ["tu", 525.5], ["negocio", 525.6]],
        [["quieres", 526.1], ["que", 526.42], ["dependa", 526.64]],
        [["de", 526.98], ["un", 527.28], ["solo", 527.52], ["ecosistema?", 527.68]],
      ]}
    />

    {/* ---------- LO QUE NADIE TE DICE ---------- */}
    <Card from={528.56} to={530.03} style={{ ...SPLIT_CARD, top: 300 }}>
      <Chip color={C.red}>Lo que nadie te dice</Chip>
      <Title size={64}>3 advertencias</Title>
    </Card>
    <Card from={536.26} to={542.82} style={CARD_AREA}>
      <Chip color={C.red}>1 · Las demos fallaron</Chip>
      <Title>Pruébalo tú primero</Title>
      <div style={rows()}>
        <Row at={536.8} icon="x">Falla ≠ no sirve</Row>
        <Row at={538.52} icon="x">Demo perfecta ≠ siempre funciona</Row>
        <Row at={540.7} icon="check">Pruébalo antes de venderlo</Row>
      </div>
    </Card>
    <Card from={543.08} to={551.46} style={SPLIT_CARD}>
      <Chip color={C.red}>2 · Planes y países</Chip>
      <Title size={52}>Revisa antes de emocionarte</Title>
      <div style={rows()}>
        <Row at={545.9} icon="x">Lo bueno: planes caros</Row>
        <Row at={547.4} icon="x">Solo algunos países</Row>
      </div>
    </Card>
    <Card from={557.5} to={563.17} style={CARD_AREA}>
      <Chip color={C.red}>3 · Privacidad</Chip>
      <Title>No es automática</Title>
      <div style={rows()}>
        <Row at={559.86} icon="check">Revisa la modalidad</Row>
        <Row at={562.3} icon="check">Antes de conectar datos</Row>
      </div>
    </Card>

    {/* ---------- EL LUNES ---------- */}
    <Card from={565.88} to={573.98} style={CARD_AREA}>
      <Chip color={C.lime}>El lunes · 1</Chip>
      <Title>Probar un dot</Title>
      <div style={rows()}>
        <Row at={566.28} icon="check">Una tarea real</Row>
        <Row at={568.96} icon="check">Clientes, reportes, facturas</Row>
        <Row at={572.74} icon="check">Nada sale sin mi aprobación</Row>
      </div>
    </Card>
    <Card from={574.04} to={583.31} style={SPLIT_CARD}>
      <Chip color={C.lime}>El lunes · 2</Chip>
      <Title size={52}>Pasarme a Sol</Title>
      <div style={rows(16)}>
        <Row at={575.44} icon="check">Migrar automatizaciones</Row>
        <Row at={578.54} icon="check">Comparar costos</Row>
        <Row at={581.32} icon="check">Rehacer mis precios</Row>
      </div>
    </Card>
    <Card from={583.38} to={595.8} style={CARD_AREA}>
      <Chip color={C.lime}>El lunes · 3 y 4</Chip>
      <Title>Ordenar y construir</Title>
      <div style={rows()}>
        <Row at={583.78} icon="check">Un Space por cliente</Row>
        <Row at={587.28} icon="x">El caos de Drive y WhatsApp</Row>
        <Row at={592.06} icon="check">Iniciar sesión con ChatGPT</Row>
      </div>
    </Card>
    <Card from={595.92} to={604.03} style={SPLIT_CARD}>
      <Chip color={C.red}>Lo que ignoraría</Chip>
      <Title size={52}>Un poquito de humo</Title>
      <div style={rows()}>
        <Row at={599.44} icon="x" strikeAt={600.06}>Ultrafast</Row>
        <Row at={600.58} icon="x" strikeAt={601.62}>Plan de $500</Row>
      </div>
    </Card>
    <Card from={604.36} to={612.17} style={{ ...CARD_AREA, top: 150 }}>
      <Chip color={C.violet}>En una frase</Chip>
      <Title>OpenAI quiere estar donde…</Title>
      <div style={flow}>
        <Node at={608.22} n="01" label="Delegas" accent={C.violet} />
        <Arrow at={608.98} />
        <Node at={609.46} n="02" label="Colaboras" accent={C.violet} />
        <Arrow at={610.54} />
        <Node at={611.06} n="03" label="Construyes" accent={C.lime} />
      </div>
    </Card>
    <Quote
      from={612.57}
      to={615.96}
      mark="cobrar"
      lines={[
        [["Quien", 612.66], ["entienda", 612.98], ["esto", 613.42], ["primero", 613.72]],
        [["va", 614.12], ["a", 614.32], ["cobrar", 614.34], ["por", 614.74], ["implementarlo.", 615.28]],
      ]}
    />

    {/* ---------- CIERRE ---------- */}
    <Card from={618.36} to={633.6} style={SPLIT_CARD}>
      <Chip color={C.lime}>Comenta</Chip>
      <Title size={52}>¿Qué pruebo a fondo?</Title>
      <div style={rows(16)}>
        <Row at={622.36} icon="check">Un dot una semana</Row>
        <Row at={624.76} icon="check">Sol vs. Claude</Row>
        <Row at={627.74} icon="check">Tu idea, en vivo</Row>
      </div>
    </Card>
    <Card from={634.4} to={642.07} style={CARD_AREA}>
      <Chip color={C.violet}>Lista de espera</Chip>
      <Title>Implementa agentes en tu negocio</Title>
      <div style={rows()}>
        <Row at={640.74} icon="check">Link en la descripción</Row>
      </div>
    </Card>
    <LowerThird from={642.34} to={648.22} tag="Suscríbete" text="Para no perderte lo próximo" />
    <EndTitle from={658.0} chip="▶ Nos vemos" title="¡Hasta el próximo video!" />
  </>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <NeuralBg />
    <Broll list={BROLL} />
    <Camera keys={KEYS} />
    <Scenes />
    <Subtitles keys={KEYS} keywords={KEYWORDS} hide={HIDE_SUBS} />
    <Brand />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
