import { Composition } from "remotion";
import { Main } from "./video";
import { DURATION } from "./words";
import { Reel, ReelProps } from "./reel";
import * as A from "./reelA_words";
import * as B from "./reelB_words";
import { C } from "./theme";

export const FPS = 30;

const REEL_A: ReelProps = {
  src: "reelA.mp4", words: A.WORDS, cuts: A.CUTS, tag: "Un documental de IA", title: ["«La IA nos va a", "acabar a todos»"],
  labels: [
    { at: 11.21, to: 12.4, t: "3 posturas" },
    { at: 17.97, to: 19.35, t: "Apocalíptico optimista" },
    { at: 28.68, to: 29.55, t: "«No debería»", color: C.red },
    { at: 34.2, to: 36.6, t: "+40 expertos" },
    { at: 41.4, to: 44.8, t: "Billones de dólares" },
    { at: 48.52, to: 50.85, t: "Aprender IA: urgente" },
    { at: 54.18, to: 55.1, t: "Muy apocalíptico", color: C.red },
  ],
  broll: [
    { from: 5.2, to: 8.6, src: "titulo2.mp4" }, { from: 12.6, to: 13.7, src: "robots2.mp4" }, { from: 14.0, to: 16.3, src: "mundo.mp4" },
    { from: 25.5, to: 27.4, src: "sam2.mp4" }, { from: 32.1, to: 34.1, src: "grid.mp4" }, { from: 36.8, to: 40.4, src: "dario_tren.mp4" },
  ],
  keywords: ["ia", "acabar", "documental", "posturas", "destrozar", "mejorar", "apocalíptico", "optimista", "destruir", "altman", "debería", "40", "expertos", "apagar", "billones", "urgente"],
};
const REEL_B: ReelProps = {
  src: "reelB.mp4", words: B.WORDS, cuts: B.CUTS, tag: "Para dueños de empresa", title: ["«Sí, uso ChatGPT»", "eso ya no es usar IA"],
  labels: [
    { at: 2.8, to: 4.5, t: "ChatGPT o Gemini… y ya" },
    { at: 10.54, to: 13.1, t: "Eso no es usar IA", color: C.red },
    { at: 17.0, to: 20.4, t: "Agentes autónomos" },
    { at: 24.24, to: 25.4, t: "Procesos" }, { at: 25.5, to: 26.15, t: "Copies" }, { at: 26.18, to: 27.2, t: "Campañas" }, { at: 27.26, to: 27.95, t: "Revisan" }, { at: 28.0, to: 28.95, t: "Toman decisiones" },
    { at: 32.4, to: 36.2, t: "Centro de Operaciones IA" },
    { at: 37.69, to: 40.6, t: "Una orden, una vez" }, { at: 41.37, to: 42.9, t: "Trabaja solo" }, { at: 43.05, to: 44.1, t: "Lo hace mejor" }, { at: 46.99, to: 48.15, t: "Mucho más barato" },
    { at: 48.43, to: 52.4, t: "Hay que dar un paso" },
    { at: 55.59, to: 57.2, t: "Ritmo brutal", color: C.red },
  ],
  broll: [],
  keywords: ["ia", "chatgpt", "gemini", "agentes", "autónomos", "agente", "copy", "decisiones", "solo", "barato", "paso", "brutal", "mejor"],
};

export const Root = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ReelA" component={Reel} defaultProps={REEL_A} durationInFrames={Math.floor(A.DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="ReelB" component={Reel} defaultProps={REEL_B} durationInFrames={Math.floor(B.DURATION * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
