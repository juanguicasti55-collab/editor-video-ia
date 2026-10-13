// Escenas del video «The AI Doc» (YouTube, 16:9). Tiempos en segundos del video YA CORTADO (ver corte.txt).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import { Sfx, Sounds } from "./lib";
import {
  BaseShade, BehindText, BigNum, Cam, Chapter, ChatMock, Chips, Clip, FgRange, FullItem, Fulls, Handle, Hub, Key, Kin, Line, Lower, Marks, Race, Shade, Stances, Subs,
} from "./yt";

// ---------- encuadres (cada clave es un corte seco) ----------
const N = (at: number): Key => ({ at, z: 1 });
const P = (at: number, z = 1.2): Key => ({ at, z });
const L = (at: number): Key => ({ at, z: 1.18, dx: 168 }); // texto a la izquierda → cara a la derecha
const R = (at: number): Key => ({ at, z: 1.18, dx: -168 });
const S = (at: number): Key => ({ at, z: 1.15, dy: 60 }); // deja aire arriba para las tres posturas
const H = (at: number): Key => ({ at, z: 1.34, dx: 320 }); // capítulo o gráfico grande a la izquierda
const KEYS: Key[] = [
  N(0), L(0.9), N(4.66), P(7.0, 1.12), R(11.2), S(15.0), L(20.5), R(24.18), P(27.04), N(29.4),
  S(33.26), H(36.2), R(39.4), N(42.36), L(50.9), P(52.76, 1.1), L(55.2), R(61.2), L(67.5), N(72.8), L(76.7), P(82.2), R(83.64),
  L(86.24), R(90.6), N(94.56), L(96.6), R(100.0), N(113.34), L(114.3), R(120.9), L(131.3), R(134.12), N(137.84), R(138.8), L(148.5), R(153.36),
  L(160.82), R(166.2), P(170.38), L(175.06), P(178.08), N(181.7), S(184.0), H(186.8), R(190.34), N(195.3), L(201.0), R(208.0), P(212.02), N(216.06), P(219.1),
  N(222.4), R(227.46), N(237.42), H(238.0), R(243.1), L(247.6), P(250.7), N(256.3), R(270.4), L(273.54), P(277.0), L(284.2),
  L(290.22), H(296.7), R(300.68), L(308.14), P(311.34), L(313.86), R(321.56), P(324.86, 1.1), R(326.7), L(334.96), N(338.3), L(340.38), R(348.72), P(355.08),
  L(359.76), R(367.82), L(375.88), N(384.22), L(386.36), R(389.54), P(397.12, 1.1), L(398.0), P(403.16), L(406.3), N(411.52), L(413.44), R(422.36),
  N(424.82), L(428.58), R(434.26), P(439.08), R(441.78), N(445.32), L(447.46), L(456.12), H(459.48), R(479.42), N(482.34), L(483.04), R(485.8), P(495.62), L(496.4),
  N(498.86), L(500.56), R(503.58), N(507.26), L(510.7), R(517.22), P(521.5, 1.1), R(521.96), L(524.44), R(531.78), L(533.1), R(539.98), N(543.94), L(546.12), R(552.82), P(560.62), R(562.0),
  L(564.68), L(568.46), N(573.44), L(575.06), R(577.26), P(579.86), N(581.48), L(583.08), R(585.86), P(590.5), R(593.9), N(597.56), R(600.1),
];

const KEYWORDS = [
  "ia", "documental", "posturas", "destrozar", "mejorar", "apocalíptico", "optimista", "destruir", "altman", "expertos", "terminator", "dominar", "controlar",
  "chantaje", "chantajear", "anthropic", "conciencia", "matemática", "algoritmos", "datos", "década", "prometedor", "salud", "conocimiento", "tecnología",
  "regulen", "regular", "apagar", "billones", "provecho", "reemplazar", "amodei", "abogados", "arquitectos", "musk", "generalista", "brutal", "ansiedad", "vanguardia",
  "chatgpt", "gemini", "agentes", "autónomos", "decisiones", "botella", "consciente", "conscientes", "paso", "millones", "agente", "barato", "universal", "urgente",
];
const HIDE_SUBS: [number, number][] = [[0, 4.5], [36.2, 39.3], [186.8, 190.3], [238.0, 243.0], [296.7, 300.6]];

// ---------- material del documental a pantalla completa ----------
const FULLS: FullItem[] = [
  { from: 7.5, to: 11.0, src: "titulo2.mp4", tag: "El documental" },
  { from: 44.5, to: 46.1, src: "army.mp4", tag: "Postura 1" },
  { from: 48.6, to: 50.4, src: "sam2.mp4" },
  { from: 73.3, to: 76.6, src: "yud.mp4", tag: "Consecuencias catastróficas" },
  { from: 79.6, to: 80.7, src: "robots2.mp4", tag: "«Como Terminator»" },
  { from: 110.2, to: 113.2, src: "ladish.mp4", tag: "El experimento" },
  { from: 127.6, to: 131.2, src: "ladish2.mp4", tag: "El chantaje" },
  { from: 196.4, to: 199.0, src: "mundo.mp4", tag: "Postura 2" },
  { from: 224.0, to: 226.5, src: "cosmos.mp4", tag: "Un futuro optimista" },
  { from: 257.2, to: 260.2, src: "ceos.mp4", tag: "Los founders" },
  { from: 260.2, to: 261.75, src: "logos.mp4", tag: "La carrera" },
  { from: 263.6, to: 266.2, src: "senado.mp4", tag: "Piden que lo regulen" },
  { from: 267.9, to: 269.9, src: "dario.mp4", tag: "No saben a dónde va a llegar" },
  { from: 280.3, to: 284.0, src: "dario_tren.mp4", tag: "Nadie va a apagar esto" },
  { from: 570.7, to: 572.9, src: "faces.mp4", tag: "Control de todo" },
  { from: 591.6, to: 593.1, src: "nuclear.mp4", tag: "O nos dominan" },
];

// ---------- texto detrás de Juan ----------
const FG: FgRange[] = [
  { from: 0.8, to: 4.6, src: "fg_1.webm" },
  { from: 284.4, to: 289.6, src: "fg_2.webm" },
  { from: 406.6, to: 411.4, src: "fg_3.webm" },
  { from: 568.2, to: 570.6, src: "fg_4.webm" },
  { from: 601.9, to: 608.8, src: "fg_5.webm" },
];
const BX = 455;
const Behind = () => (
  <>
    <BehindText from={0.9} to={4.5} top={215} x={BX} size={160} lines={[{ at: 1.04, t: "NOS VA A" }]} />
    <BehindText from={0.9} to={4.5} top={360} x={BX} size={210} lines={[{ at: 1.46, t: "ACABAR", color: C.lime }]} />
    <BehindText from={284.6} to={289.5} top={230} x={BX} size={165} lines={[{ at: 284.92, t: "BILLONES", color: C.lime }]} />
    <BehindText from={284.6} to={289.5} top={385} x={BX} size={125} lines={[{ at: 287.24, t: "DE DÓLARES" }]} />
    <BehindText from={406.8} to={411.3} top={300} x={BX} size={165} lines={[{ at: 407.24, t: "ANSIEDAD", color: C.red }]} />
    <BehindText from={568.3} to={570.5} top={230} x={BX} size={165} lines={[{ at: 568.5, t: "EL MUNDO" }]} />
    <BehindText from={568.3} to={570.5} top={385} x={BX} size={145} lines={[{ at: 568.94, t: "CAMBIANDO", color: C.lime }]} />
    <BehindText from={602.0} to={608.8} top={240} x={1440} size={120} lines={[{ at: 602.26, t: "APRENDER IA", color: C.lime }]} />
    <BehindText from={602.0} to={608.8} top={355} x={1440} size={185} lines={[{ at: 603.28, t: "URGENTE" }]} />
  </>
);

// ---------- texto a los lados ----------
const TL: React.FC<{ from: number; to: number; lines: Line[]; y?: number; w?: number }> = ({ from, to, lines, y = 250, w = 540 }) => (
  <><Shade from={from} to={to} side="left" k={0.55} /><Kin from={from} to={to} x={56} y={y} w={w} lines={lines} maxHuge={170} maxBig={104} /></>
);
const TR: React.FC<{ from: number; to: number; lines: Line[]; y?: number; w?: number }> = ({ from, to, lines, y = 250, w = 540 }) => (
  <><Shade from={from} to={to} side="right" k={0.55} /><Kin from={from} to={to} x={1866} y={y} w={w} align="right" lines={lines} maxHuge={170} maxBig={104} /></>
);
const CL: React.FC<React.ComponentProps<typeof Chips>> = (p) => <><Shade from={p.from} to={p.to} side="left" k={0.5} /><Chips size={42} {...p} x={50} /></>;
const CR: React.FC<Omit<React.ComponentProps<typeof Chips>, "x">> = (p) => <><Shade from={p.from} to={p.to} side="right" k={0.5} /><Chips size={42} x={1870} align="right" {...p} /></>;

const POSTURAS = (at: [number, number, number]) => [
  { at: at[0], t: "Nos va a destrozar", icon: "skull" as const },
  { at: at[1], t: "Lo va a mejorar todo", icon: "sun" as const },
  { at: at[2], t: "Apocalíptico optimista", icon: "scale" as const },
];

const SFX: Sfx[] = [
  ...FULLS.map((f): Sfx => ({ at: f.from, f: "whoosh", v: 0.5 })),
  ...[36.2, 186.8, 238.0, 296.7].map((at): Sfx => ({ at, f: "boom", v: 0.5 })),
  ...[1.46, 15.74, 17.2, 20.52, 55.26, 284.92, 407.24, 465.64, 603.28].map((at): Sfx => ({ at, f: "pop", v: 0.5 })),
  ...[62.6, 147.28, 374.16, 439.3, 458.7].map((at): Sfx => ({ at, f: "click", v: 0.5 })),
  ...[51.64, 374.98, 564.22].map((at): Sfx => ({ at, f: "ding", v: 0.4 })),
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Cam keys={KEYS} fg={FG} behind={<Behind />} />
    <BaseShade />

    {/* gancho */}
    <TR from={3.24} to={4.5} y={330} lines={[{ at: 3.24, t: "viviendo en", k: "sm" }, { at: 3.72, t: "lugares así", k: "serif" }]} />

    {/* el documental y las tres posturas */}
    <Clip from={11.2} to={14.7} src="poster.jpg" x={1500} y={150} w={340} h={504} rot={3} label="The AI Doc (2026)" credit="Póster: Focus Features" />
    <TL from={12.96} to={14.8} y={300} lines={[{ at: 13.76, t: "3", k: "huge", color: C.lime }, { at: 14.1, t: "posturas", k: "big" }]} />
    <Stances from={15.0} to={22.0} items={POSTURAS([15.74, 17.2, 20.52])} />
    <Clip from={15.3} to={16.9} src="army.mp4" x={44} y={330} w={430} rot={-3} credit={null} />
    <Clip from={17.3} to={19.7} src="mundo.mp4" x={1446} y={330} w={430} rot={2.5} />
    <TL from={20.5} to={24.0} y={330} lines={[{ at: 20.52, t: "la que más me gustó", k: "tag" }, { at: 20.52, t: "Apocalíptico", k: "big" }, { at: 21.38, t: "optimista", k: "serif" }]} />
    <TR from={24.18} to={29.3} lines={[{ at: 24.18, t: "Optimista", k: "big", icon: "check" }, { at: 27.04, t: "pero algo no tan positivo", k: "sm" }, { at: 28.18, t: "puede pasar", k: "big", color: C.red }]} />
    <Marks to={32.9} items={[[30.86, 330, 260, -14, 200], [32.22, 1480, 220, 12, 240], [32.56, 1650, 470, 20, 150]]} />

    {/* postura 1 */}
    <Stances from={33.26} to={36.1} items={POSTURAS([0, 0, 0])} active={() => 0} />
    <Shade from={36.2} to={39.2} side="all" k={0.82} />
    <Chapter from={36.2} to={39.2} n="1" tag="Postura uno" title={["El escenario", "más complejo"]} titleAt={37.5} />
    <TR from={39.48} to={42.2} y={320} lines={[{ at: 39.78, t: "y lo voy a llevar", k: "sm" }, { at: 41.3, t: "a la empresa", k: "big", icon: "build" }]} />
    <TL from={50.9} to={52.6} y={300} lines={[{ at: 50.9, t: "¿podemos confiar en él?", k: "tag" }, { at: 51.64, t: "«No", k: "huge", color: C.red }, { at: 52.12, t: "debería»", k: "big", color: C.red }]} />
    <BigNum from={55.26} to={60.9} x={40} y={230} value={40} prefix="+" label="entrevistados" />
    <Shade from={55.26} to={60.9} side="left" k={0.5} />
    <Clip from={55.7} to={57.7} src="grid.mp4" x={1446} y={280} w={430} rot={2.5} />
    <TR from={58.2} to={60.9} y={330} lines={[{ at: 59.06, t: "Expertos", k: "big", color: C.lime }]} />
    <TR from={61.2} to={67.3} lines={[{ at: 62.12, t: "Vende humo", k: "big", strikeAt: 62.6 }, { at: 64.16, t: "Tu gurú favorito", k: "big", strikeAt: 67.14 }]} />
    <CL from={67.5} to={72.5} x={70} y={260} items={[{ at: 67.96, t: "Expertos", icon: "target" }, { at: 69.38, t: "Académicos", icon: "book" }, { at: 71.28, t: "Mucho conocimiento", icon: "bulb" }]} />
    <TL from={76.74} to={79.2} y={300} lines={[{ at: 76.74, t: "la IA", k: "tag" }, { at: 77.84, t: "Nos va a", k: "big" }, { at: 78.14, t: "dominar", k: "huge", color: C.red }]} />
    <Marks to={85.9} items={[[83.64, 1500, 230, 12, 240], [84.06, 1700, 470, 22, 150]]} />
    <TR from={84.44} to={86.1} y={520} lines={[{ at: 85.02, t: "mi postura", k: "serif" }]} />
    <TL from={86.24} to={90.4} y={300} lines={[{ at: 87.92, t: "Todo esto", k: "big" }, { at: 88.54, t: "va a cambiar", k: "big", color: C.lime }]} />
    <Race from={90.68} to={94.3} x={1330} y={240} w={540} rows={[{ at: 91.5, t: "La IA", v: 1, color: C.lime, icon: "chip" }, { at: 92.28, t: "Nosotros", v: 0.4, color: "#ffffff", icon: "users" }]} />
    <TL from={96.6} to={99.8} y={320} lines={[{ at: 96.98, t: "hay que", k: "sm" }, { at: 97.76, t: "documentarse", k: "big", underlineAt: 98.4 }]} />
    <CR from={101.66} to={109.6} y={250} items={[{ at: 102.62, t: "Cadenas de seguridad", icon: "alert", strikeAt: 104.06 }, { at: 105.6, t: "Agentes", icon: "bot" }, { at: 106.94, t: "Loops", icon: "flow" }, { at: 108.46, t: "Cumplir objetivos", icon: "target" }]} />
    <TL from={114.36} to={120.7} lines={[{ at: 114.36, t: "la IA", k: "tag" }, { at: 115.58, t: "Entrenada", k: "big" }, { at: 116.06, t: "por nosotros", k: "big", color: C.lime }, { at: 117.28, t: "y somos malos", k: "serif", color: C.red }]} />
    <TR from={120.9} to={126.0} lines={[{ at: 122.54, t: "¿una tecnología con", k: "sm" }, { at: 125.12, t: "buenas", k: "big" }, { at: 125.44, t: "intenciones?", k: "big" }]} />
    <TL from={131.36} to={133.9} y={320} lines={[{ at: 131.36, t: "donde lo vi", k: "tag" }, { at: 132.14, t: "Anthropic", k: "big", color: C.lime }]} />
    <TR from={134.12} to={137.6} y={300} lines={[{ at: 134.12, t: "con tal de cumplir", k: "sm" }, { at: 134.94, t: "el objetivo", k: "big", icon: "target" }]} />
    <TR from={138.8} to={148.3} y={280} lines={[{ at: 138.8, t: "¿Conciencia?", k: "big", strikeAt: 147.28 }, { at: 147.44, t: "no hay conciencia", k: "serif" }]} />
    <Clip from={141.2} to={146.0} src="smiley.mp4" x={44} y={300} w={430} rot={-3} />
    <CL from={148.54} to={153.3} x={70} y={260} items={[{ at: 149.12, t: "Matemática", icon: "chip" }, { at: 150.56, t: "Algoritmos", icon: "flow" }, { at: 152.82, t: "Mucha data", icon: "doc" }]} />
    <TR from={155.42} to={160.6} lines={[{ at: 155.84, t: "Sí es", k: "big" }, { at: 156.06, t: "inteligente", k: "big", color: C.lime }, { at: 158.08, t: "aprende lo que no le enseñamos", k: "sm" }]} />
    <TL from={162.84} to={166.0} y={320} lines={[{ at: 162.84, t: "cuando veas este video", k: "tag" }, { at: 163.86, t: "Desactualizado", k: "big", mark: C.lime }]} />
    <TR from={166.24} to={170.2} y={300} lines={[{ at: 167.04, t: "Semana", k: "big", icon: "clock" }, { at: 167.32, t: "a semana", k: "serif" }]} />
    <TL from={175.06} to={178.0} y={300} lines={[{ at: 175.3, t: "En una década", k: "big" }, { at: 176.36, t: "todo va a ser otro tema", k: "serif" }]} />
    <Marks to={180.9} items={[[178.08, 300, 250, -14, 220], [179.28, 1500, 230, 12, 240]]} />

    {/* postura 2 */}
    <Stances from={184.0} to={186.7} items={POSTURAS([0, 0, 0])} active={() => 1} />
    <Shade from={186.8} to={190.2} side="all" k={0.82} />
    <Chapter from={186.8} to={190.2} n="2" tag="Postura dos" title={["Un futuro", "prometedor"]} titleAt={188.3} />
    <TR from={190.34} to={194.8} y={300} lines={[{ at: 190.76, t: "Una época interesante", k: "serif" }, { at: 191.98, t: "para vivir", k: "big" }]} />
    <CL from={201.0} to={207.6} x={70} y={260} items={[{ at: 202.9, t: "La salud", icon: "heart" }, { at: 204.88, t: "El conocimiento", icon: "book" }, { at: 205.94, t: "La tecnología", icon: "chip" }]} />
    <Clip from={209.2} to={211.3} src="marte.mp4" x={44} y={320} w={430} rot={-3} />
    <TL from={213.02} to={216.0} y={320} lines={[{ at: 213.46, t: "la misma herramienta", k: "tag" }, { at: 214.8, t: "El mal", k: "big", color: C.red, icon: "x" }]} />
    <TR from={215.08} to={216.0} y={366} lines={[{ at: 215.6, t: "El bien", k: "big", color: C.lime, icon: "check" }]} />
    <TR from={227.46} to={236.9} y={300} lines={[{ at: 229.46, t: "todo lo que se va a", k: "sm" }, { at: 229.46, t: "poder hacer", k: "big" }, { at: 233.16, t: "en todos estos ramos", k: "serif" }]} />

    {/* postura 3 */}
    <Shade from={238.0} to={242.9} side="all" k={0.82} />
    <Chapter from={238.0} to={242.9} n="3" tag="La que más me gusta" title={["Apocalíptico", "pero optimista"]} titleAt={240.2} />
    <Clip from={243.2} to={246.3} src="poster.jpg" x={1500} y={150} w={340} h={504} rot={3} label="La base del documental" credit="Póster: Focus Features" />
    <TL from={247.6} to={250.5} y={320} lines={[{ at: 248.42, t: "al final es", k: "sm" }, { at: 248.92, t: "Una mezcla", k: "big", color: C.lime }]} />
    <TR from={270.4} to={273.4} y={320} lines={[{ at: 270.78, t: "no lo voy a saber yo", k: "sm" }, { at: 272.78, t: "Ni idea", k: "big" }]} />
    <TL from={273.54} to={279.9} lines={[{ at: 275.06, t: "Regular", k: "big", icon: "scale" }, { at: 275.66, t: "y organizar", k: "serif" }, { at: 276.94, t: "piden que no confíes en ellos", k: "sm" }]} />
    <TR from={288.46} to={289.9} y={560} lines={[{ at: 288.46, t: "no se va a apagar", k: "serif" }]} />

    {/* a la empresa */}
    <TL from={291.04} to={296.5} y={300} lines={[{ at: 291.4, t: "por ahora", k: "tag" }, { at: 293.14, t: "Sacarle", k: "big" }, { at: 293.84, t: "todo el jugo", k: "big", color: C.lime }]} />
    <Shade from={296.7} to={300.5} side="all" k={0.82} />
    <Chapter from={296.7} to={300.5} n="→" tag="De aquí en adelante" title={["Llevarlo", "a la empresa"]} titleAt={298.9} />
    <TR from={302.94} to={307.9} y={300} lines={[{ at: 303.16, t: "cómo sacarle el", k: "sm" }, { at: 305.34, t: "Máximo", k: "big" }, { at: 305.68, t: "provecho", k: "big", color: C.lime }]} />
    <TL from={308.14} to={313.7} lines={[{ at: 308.26, t: "dejar de pensar en", k: "tag" }, { at: 309.48, t: "«Nos van a", k: "big" }, { at: 310.0, t: "reemplazar»", k: "big" }, { at: 312.42, t: "«se acaba el trabajo»", k: "sm" }]} />
    <TL from={313.86} to={321.4} y={280} lines={[{ at: 313.86, t: "Ojo", k: "huge", color: C.lime, icon: "alert" }, { at: 314.66, t: "Cambios", k: "big" }, { at: 315.3, t: "demasiado reales", k: "serif" }]} />
    <TR from={321.56} to={324.7} y={330} lines={[{ at: 322.8, t: "una total", k: "sm" }, { at: 323.78, t: "realidad", k: "big", underlineAt: 324.0 }]} />
    <TR from={326.7} to={334.8} lines={[{ at: 326.7, t: "el dicho trillado", k: "tag" }, { at: 329.72, t: "«Te reemplaza alguien", k: "sm", strikeAt: 334.06 }, { at: 330.8, t: "que sí sepa»", k: "big", strikeAt: 334.06 }]} />
    <TL from={334.96} to={338.2} lines={[{ at: 334.96, t: "Sí nos van a reemplazar", k: "sm" }, { at: 336.28, t: "Lo están haciendo", k: "big" }, { at: 337.34, t: "y lo van a hacer", k: "serif" }]} />
    <TL from={340.38} to={348.5} y={300} lines={[{ at: 340.38, t: "un paper de", k: "tag" }, { at: 341.9, t: "Dario Amodei", k: "big" }, { at: 344.38, t: "CEO y founder de Anthropic", k: "serif" }]} />
    <CR from={348.72} to={359.5} y={260} items={[{ at: 350.02, t: "Abogados", icon: "scale" }, { at: 353.36, t: "Arquitectos", icon: "build" }, { at: 357.64, t: "Trabajos absorbidos", icon: "brief" }]} />
    <TL from={359.76} to={367.6} y={300} lines={[{ at: 360.36, t: "un post de", k: "tag" }, { at: 363.36, t: "Elon Musk", k: "big" }]} />
    <TR from={372.98} to={383.9} lines={[{ at: 373.32, t: "Muy específico", k: "big", strikeAt: 374.16 }, { at: 374.98, t: "Generalista", k: "big", color: C.lime, icon: "check" }, { at: 379.26, t: "conocimiento más amplio", k: "sm" }, { at: 381.42, t: "para usar mejor la IA", k: "serif" }]} />
    <TL from={386.36} to={389.4} y={280} lines={[{ at: 387.36, t: "la IA viene a una", k: "sm" }, { at: 388.34, t: "Velocidad", k: "big" }, { at: 388.78, t: "brutal", k: "huge", color: C.lime }]} />
    <Race from={389.54} to={396.9} x={1330} y={240} w={540} rows={[{ at: 389.54, t: "La IA", v: 1, color: C.lime, icon: "bolt" }, { at: 392.78, t: "Las personas", v: 0.3, color: "#ffffff", icon: "users" }]} />
    <CL from={398.0} to={403.0} x={70} y={230} items={[{ at: 399.84, t: "Estudiando", icon: "book" }, { at: 400.66, t: "Viendo", icon: "eye" }, { at: 401.12, t: "Probando", icon: "bolt" }, { at: 401.76, t: "Pagando", icon: "money" }]} />
    <TL from={413.44} to={418.9} y={300} lines={[{ at: 414.94, t: "intentar estar", k: "sm" }, { at: 416.5, t: "A la", k: "big" }, { at: 416.62, t: "vanguardia", k: "big", color: C.lime }]} />
    <TR from={422.36} to={424.7} y={320} lines={[{ at: 422.5, t: "pero la gente", k: "sm" }, { at: 423.62, t: "no lo hace", k: "big", color: C.red }]} />
    <Shade from={429.4} to={441.5} side="left" k={0.5} />
    <ChatMock from={429.44} to={441.5} x={44} y={250} w={560} who="«¿Usas IA?»" text="Sí, uso ChatGPT o Gemini… y ya." typeFrom={430.68} typeTo={432.9} strikeAt={439.3} />
    <CR from={436.56} to={441.5} y={280} items={[{ at: 436.76, t: "Responde preguntas", icon: "chat", strikeAt: 439.3 }, { at: 438.34, t: "Hace copies", icon: "doc", strikeAt: 439.3 }]} />
    <TR from={441.78} to={445.0} y={320} lines={[{ at: 441.78, t: "usar IA es", k: "sm" }, { at: 443.0, t: "Ir más allá", k: "big", color: C.lime }]} />
    <TL from={447.46} to={453.4} lines={[{ at: 447.46, t: "al día que grabo este video", k: "tag" }, { at: 452.64, t: "Agentes", k: "huge", color: C.lime }, { at: 453.08, t: "autónomos", k: "serif" }]} />
    <CL from={453.56} to={456.0} x={50} y={300} items={[{ at: 454.12, t: "Hacen tareas", icon: "check" }, { at: 454.98, t: "Hacen actividades", icon: "check" }]} />
    <Shade from={456.3} to={459.3} side="left" k={0.5} />
    <ChatMock from={456.3} to={459.3} x={44} y={270} w={560} who="Antes" text="Dame un copy para mi anuncio" typeFrom={457.24} typeTo={458.4} strikeAt={458.7} />
    <Shade from={459.5} to={479.2} side="left" k={0.72} />
    <Hub from={459.5} to={479.2} cx={520} cy={470} r={250} title={["Centro de Operaciones", "IA"]} titleAt={465.64}
      nodes={[{ at: 459.88, t: "Procesos", icon: "flow" }, { at: 461.14, t: "Copies", icon: "doc" }, { at: 461.82, t: "Campañas", icon: "target" }, { at: 462.9, t: "Revisan", icon: "eye" }, { at: 463.64, t: "Deciden", icon: "check" }]} />
    <TR from={479.42} to={482.2} lines={[{ at: 479.7, t: "que yo no me vuelva", k: "sm" }, { at: 480.46, t: "El cuello", k: "big" }, { at: 480.78, t: "de botella", k: "big", color: C.red }]} />
    <TL from={483.04} to={485.7} y={320} lines={[{ at: 483.04, t: "lo primero", k: "tag" }, { at: 484.68, t: "Ser consciente", k: "big", underlineAt: 485.2 }]} />
    <TR from={485.8} to={495.5} lines={[{ at: 490.3, t: "¿de la noche a la mañana?", k: "sm" }, { at: 492.58, t: "Aprender todo", k: "big", strikeAt: 494.08 }, { at: 494.74, t: "es abrumante", k: "serif" }]} />
    <TL from={496.4} to={498.7} y={320} lines={[{ at: 496.66, t: "Ser conscientes", k: "big" }, { at: 497.62, t: "y ver más allá", k: "serif" }]} />
    <TL from={500.56} to={503.4} lines={[{ at: 500.56, t: "me dicen mis clientes", k: "tag" }, { at: 501.0, t: "«No entiendo nada,", k: "sm" }, { at: 502.16, t: "solo sé usar ChatGPT»", k: "sm" }]} />
    <TR from={503.58} to={507.1} lines={[{ at: 503.58, t: "«pero soy consciente", k: "sm" }, { at: 505.14, t: "Esto está", k: "big" }, { at: 505.5, t: "cambiando»", k: "big", color: C.lime }]} />
    <TL from={510.7} to={517.0} y={300} lines={[{ at: 511.44, t: "hay que", k: "sm" }, { at: 512.2, t: "Dar un paso", k: "big", color: C.lime, icon: "step" }]} />
    <TR from={517.22} to={521.4} lines={[{ at: 517.22, t: "primero", k: "tag" }, { at: 517.5, t: "la IA sigue avanzando", k: "sm" }, { at: 520.22, t: "Ritmo brutal", k: "big" }]} />
    <TR from={521.96} to={524.3} y={320} lines={[{ at: 521.96, t: "segundo", k: "tag" }, { at: 523.18, t: "hay empresas que sí", k: "sm" }]} />
    <TL from={524.44} to={531.6} y={300} lines={[{ at: 525.98, t: "Millones", k: "big", color: C.lime, icon: "money" }, { at: 527.06, t: "de dólares", k: "serif" }]} />
    <TR from={531.78} to={533.0} y={280} lines={[{ at: 531.78, t: "1 o 2", k: "huge", color: C.lime }, { at: 532.38, t: "empleados", k: "big" }]} />
    <TL from={533.1} to={539.8} y={300} lines={[{ at: 533.3, t: "yo mismo", k: "tag" }, { at: 534.78, t: "Bajé un montón", k: "big" }, { at: 536.02, t: "de personas", k: "serif" }]} />
    <TR from={539.98} to={543.8} y={330} lines={[{ at: 540.34, t: "al principio me daba", k: "sm" }, { at: 542.2, t: "mala onda", k: "big" }]} />
    <TL from={546.12} to={552.7} y={220} lines={[{ at: 546.42, t: "con personas", k: "tag" }]} />
    <CL from={546.12} to={552.7} x={70} y={290} items={[{ at: 548.2, t: "Les pago", icon: "money" }, { at: 550.68, t: "Reuniones", icon: "users" }, { at: 551.44, t: "Revisiones", icon: "eye" }]} />
    <TR from={552.82} to={564.5} y={190} lines={[{ at: 553.18, t: "con un agente", k: "tag" }]} />
    <CR from={552.82} to={564.5} y={260} items={[{ at: 554.16, t: "Una orden, una vez", icon: "bolt" }, { at: 555.06, t: "Lo entreno una vez", icon: "book" }, { at: 557.84, t: "Trabaja solo", icon: "bot" }, { at: 559.52, t: "Lo hace mejor", icon: "check" }, { at: 564.22, t: "Mucho más barato", icon: "money" }]} />
    <TL from={575.06} to={577.1} y={320} lines={[{ at: 575.28, t: "¿Negativo?", k: "big", strikeAt: 576.6 }]} />
    <TR from={577.26} to={581.3} y={320} lines={[{ at: 577.56, t: "Diferente", k: "big", color: C.lime }, { at: 580.38, t: "y va a seguir cambiando", k: "serif" }]} />

    {/* cierre */}
    <TL from={583.08} to={585.7} y={320} lines={[{ at: 583.94, t: "vivir en lugares", k: "sm" }, { at: 585.04, t: "como estos", k: "big" }]} />
    <CR from={585.86} to={591.4} y={300} items={[{ at: 587.46, t: "Renta universal", icon: "home" }, { at: 589.02, t: "Sin trabajar", icon: "brief" }]} />
    <TR from={593.9} to={597.4} y={320} lines={[{ at: 594.84, t: "los únicos espacios", k: "sm" }, { at: 596.44, t: "para comer y vivir", k: "serif" }]} />
    <Marks to={599.9} items={[[597.56, 320, 250, -14, 220], [598.24, 1500, 230, 12, 240]]} />
    <TR from={604.62} to={608.8} y={590} lines={[{ at: 607.36, t: "un futuro", k: "sm" }, { at: 607.92, t: "muy apocalíptico", k: "big", color: C.red }]} />

    <Fulls list={FULLS} />
    <Lower from={48.8} to={50.4} name="Sam Altman" role="CEO de OpenAI" />
    <Lower from={110.5} to={113.2} name="Jeffrey Ladish" role="Palisade Research" />
    <Lower from={268.1} to={269.9} name="Dario Amodei" role="CEO de Anthropic" />
    <Subs hide={HIDE_SUBS} keywords={KEYWORDS} />
    <Handle />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
