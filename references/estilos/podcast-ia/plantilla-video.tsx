// Podcast «Usar la IA no basta: hay que construir con ella» (clips de IA de Descargas/juan, unidos en orden de conversación).
// Edición sencilla tipo podcast (como el v4): corte seco entre quien habla, leve acercamiento en los saltos dentro de la
// misma persona, gancho textual arriba desde el fotograma 0, subtítulos grandes y etiquetas cortas arriba con lo que se nombra.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, TITLE } from "./theme";
import { DURATION } from "./words";
import { CUTS } from "./cuts";
import { Sfx, Sounds, useT, pop, prog } from "./lib";
import { CAM_FULL, CamKeyV, CamV, HookTitle, SubsV } from "./reel";
import { W } from "./mg";

export const CTA_SECONDS = 0;
const A = (w: string, after: number) => W(w, 1, after);
const T = {
  le: A("Le", 9.8), responde: A("responde,", 10.8), copias: A("copias", 11.8), ahorra: A("ahorra", 22.4), mismos: A("mismos", 24.2), horas: A("horas", 25.8),
  medico: A("médico,", 43), citas: A("citas,", 44.4), examenes: A("exámenes,", 45.6), preguntas: A("preguntas", 47.6), solos: A("solos.", 51.2),
  primero: A("primero", 55.6), sueltas: A("sueltas.", 60.2), seis: A("seis", 64.6), siete: A("siete", 67), decidir: A("decidir.", 69.8), todo: A("todo", 75.3), ti: A("ti.", 78.9),
};

const CAM: CamKeyV[] = [];
CUTS.forEach((c, i) => {
  const prev = CAM[i - 1]?.zoom ?? 1;
  CAM.push({ at: c.at, box: CAM_FULL, fy: 40, zoom: c.new ? (c.speaker === "M" ? 1.03 : 1) : prev > 1.05 ? 1 : 1.1 });
});

const KEYWORDS = ["abogado", "médico", "construir", "chat", "copias", "pegas", "trabajo", "minutos", "herramientas", "programador", "técnico", "enseñarle", "completa",
  "agentes", "solos", "paciente", "aprobando", "sueltas", "seis", "siete", "decidir", "escrito", "escrito,"];

/** Etiquetas cortas arriba: aparecen una a una cuando se nombran. */
const Chips: React.FC<{ from: number; to: number; items: [number, string][]; tone?: string }> = ({ from, to, items, tone = C.lime }) => {
  const t = useT();
  if (t < from || t > to + 0.25) return null;
  const o = 1 - prog(t, to, 0.2);
  return (
    <div style={{ position: "absolute", top: 240, left: 40, right: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, opacity: o }}>
      {items.map(([at, label], i) => {
        const p = pop(t, at, 0.4);
        return (
          <div key={i} style={{ padding: "14px 26px", borderRadius: 40, background: "rgba(11,12,15,.8)", border: `3px solid ${tone}`, color: "#fff",
            fontFamily: TITLE, fontWeight: 900, fontSize: 44, letterSpacing: -0.8, opacity: t < at ? 0 : Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`,
            boxShadow: `0 10px 30px rgba(0,0,0,.4), 0 0 26px ${tone}33` }}>{label}</div>
        );
      })}
    </div>
  );
};

const SFX: Sfx[] = [T.le, T.responde, T.copias, T.citas, T.examenes, T.preguntas, T.seis, T.siete, T.todo].map((at) => ({ at, f: "pop" as const, v: 0.4 }));

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <CamV keys={CAM} until={DURATION} />
    <HookTitle to={4.4} lines={["Usar la IA no basta:", "hay que construir", "con ella"]} mark="construir" />
    <Chips from={T.le - 0.1} to={T.copias + 1.5} items={[[T.le, "Le preguntas"], [T.responde, "Te responde"], [T.copias, "Copias y pegas"]]} />
    <Chips from={T.ahorra - 0.1} to={T.horas + 2.4} items={[[T.ahorra, "Ahorras minutos"], [T.mismos, "Mismos clientes"], [T.horas, "Mismas horas"]]} />
    <Chips from={T.medico} to={T.solos + 0.4} items={[[T.citas - 0.3, "Confirmar citas"], [T.examenes - 0.3, "Recordar exámenes"], [T.preguntas - 0.4, "Responder lo mismo"]]} />
    <Chips from={T.primero - 0.2} to={T.sueltas + 0.5} items={[[T.primero, "1. Tú apruebas todo"], [T.sueltas - 0.5, "2. Lo sueltas"]]} />
    <Chips from={T.seis - 0.2} to={T.decidir + 0.4} items={[[T.seis, "6 agentes solos"], [T.siete, "7 con aprobación"]]} />
    <Chips from={T.todo - 0.2} to={T.ti + 0.3} items={[[T.todo, "Todo por escrito"]]} />
    <SubsV keywords={KEYWORDS} hide={[[0, 4.6]]} yAt={() => 1330} />
    <Sounds list={SFX} />
  </AbsoluteFill>
);
