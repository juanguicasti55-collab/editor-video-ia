// Catálogo en video de TODOS los efectos del menú (references/menu-efectos.md) sobre la grabación de la persona: para que vea
// el menú en movimiento antes de elegir (pregunta 2). 5 partes (Cat1 H+C · Cat2 D+T · Cat3 A · Cat4 K+G+I · Cat5 motion
// graphics sobre cámara), ~4,5 min en total;
// cada efecto ocupa su tramo con su código y nombre arriba. El tiempo del catálogo = el de la cámara (la grabación debe durar
// ≥ 53 s; si es más corta, bajar los `d`).
// Cómo se arma (en un reel ya preparado con reel_prep.py):
//  1. Copiar a remotion/src: fx-efectos→fx.tsx · mg.tsx · fx-documental→doc.tsx · fx-estilos→estilos.tsx · fx-editorial→editorial.tsx
//     · fx-graficos→graficos.tsx · fx-apoyo-visual→apoyo.tsx · este→catalogo.tsx
//  2. Recorte de TODO el video: .venv-matte/bin/python scripts/mascaras.py <reel> --tramos "0-<duración>" [--con-pelo]  (~17 min por minuto)
//  3. En Root.tsx registrar Cat1–Cat5 (durationInFrames = Math.ceil(durCat(PARTES[i]) * 30)), renderizar cada una y unirlas con ffmpeg concat.
// Los textos son de muestra (marcados así en el testimonio y el rótulo): nunca se publican como datos reales.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, TITLE, BODY } from "./theme";
import { useT } from "./lib";
import { TOPS } from "./mascaras";
import { CAM_FULL, CamKeyV, HookTitle, CommentCTA } from "./reel";
import { Cam2, CoverStory, PaperWall, ThumbWall, WhiteOut, Orbit, GlassChecklist, FocusWord, ChatTestimonio, Shrink } from "./fx";
import { BehindText, TapButton, EndCard, Kin, BigNumber, ListCard, Flow, Stepper, People, QuoteCard, Ratio, SpinClock, Bubbles, Marks, Crossed, PlayerMock, Flash } from "./mg";
import { Checklist, Headline, ChatMock, Terminal, FileCard, Folders, DayStrip, CountPop, CommentWord, AskComment, FollowSave } from "./apoyo";
import { SubsEstilo, GanchoEstilo, ComentaCTA, ComentarioEnVivo, Notificacion, AnilloCuenta, Calendario, BannerFijo, Serie, NotaFlecha, CifraDetras, GraficaDetras, conZoomDigital, Vineta, CirculoWipe, Look, Congelar, BarridoColor, Ranking, EstiloSubs, EstiloGancho } from "./estilos";
import { Pelicula, Franjas, Capitulo, Rotulo, SubsDoc } from "./doc";
import { SubsPalabra, SubsCorchetes, FraseQueSeArma, RespuestaComentario, NumeroSeccion, VidrioAcanalado, CintaDeLuz, CamaraSaltos, ContadorRueda, AntesDespues, CaminoNodos, TarjetasVistas, FichaMarca, CitaEstudio, TiraVideo, TituloFijo, BotonBrillo, ComentaDestellos, Pictograma, CifraGrafica, ArticuloResaltado, PalabraPantalla } from "./graficos";
import { SubsKaraoke, GanchoEstudio, BarraPedido, RelojMaterial, ListaLateral, CursorVivo, PalabraVentana, CuerpoTexto, Clones, Periodico, Billete, Impacto } from "./editorial";

type N = React.ReactNode;
type Slot = { c: string; n: string; d: number; front?: (a: number, b: number) => N; behind?: (a: number, b: number) => N;
  zt?: boolean; vertigo?: boolean; saltos?: boolean; digital?: boolean; shrink?: boolean };
const Win: React.FC<{ a: number; b: number; children: N }> = ({ a, b, children }) => { const t = useT(); return t >= a && t < b ? <>{children}</> : null; };
const CLAVES = ["inversion", "gasto", "dinero", "celular", "capacitacion", "black", "experience", "noviembre", "cuotas", "intereses", "invertir", "ofertas"];
const HEAD = TOPS.length ? [...TOPS].sort((x, y) => x - y)[Math.floor(TOPS.length / 2)] : 380; // coronilla típica de la grabación

const ganchoE = (e: EstiloGancho, chica: string, grande: string, fondo?: string): Slot["front"] => (a, b) => <GanchoEstilo estilo={e} chica={chica} grande={grande} from={a + 0.05} to={b - 0.4} fondo={fondo} />;
const subE = (e: EstiloSubs): Slot["front"] => (a, b) => <Win a={a} b={b}><SubsEstilo estilo={e} claves={CLAVES} ocultar={[]} y={e === "c9" ? 300 : e === "c8" ? 1250 : 1380} x={e === "c9" ? 640 : 90} /></Win>;

const P1: Slot[] = [
  { c: "H1", n: "Título del gancho", d: 2.6, front: (a, b) => <HookTitle from={a} to={b - 0.4} lines={["¿Gasto o", "inversión?"]} mark="inversión" /> },
  { c: "H2", n: "Gancho detrás de la cabeza", d: 2.6, behind: (a, b) => <BehindText from={a} to={b - 0.2} top={HEAD - 170} size={250} lines={[{ at: a + 0.1, t: "GASTO" }]} /> },
  { c: "H3", n: "Mayúsculas cálidas", d: 2.6, front: ganchoE("h3", "lo que nadie", "te dice") },
  { c: "H4", n: "Recorte", d: 2.6, front: ganchoE("h4", "no es un", "gasto") },
  { c: "H5", n: "Etiqueta a mano", d: 2.6, front: ganchoE("h5", "el truco para", "invertir bien", C.bg) },
  { c: "H6", n: "Dos pesos", d: 2.6, front: ganchoE("h6", "GASTO O", "INVERSIÓN") },
  { c: "H7", n: "Gancho en estudio", d: 2.8, behind: (a, b) => <GanchoEstudio from={a} to={b - 0.3} top={130} lineas={[{ at: a, t: "No es", estilo: "serif" }, { at: a + 0.8, t: "un gasto", estilo: "gruesa" }, { at: a + 1.6, t: "es inversión.", estilo: "cursiva" }]} /> },
  { c: "H8", n: "Frase que se arma", d: 2.8, front: (a, b) => <FraseQueSeArma from={a} to={b - 0.3} lineas={[{ at: a, t: "vamos a ver" }, { at: a + 0.5, t: "por qué no es" }, { at: a + 1, t: "un gasto", cursiva: true }]} /> },
  { c: "H9", n: "Respuesta a comentario", d: 2.8, front: (a, b) => <RespuestaComentario from={a + 0.05} to={b - 0.3} usuario="usuario" comentario="Aquí va un comentario real" titular="No es un gasto" cursiva="es tu carrera" /> },
  { c: "C1", n: "Manuscrita + clave gruesa", d: 2.6, front: (a, b) => <Win a={a} b={b}><SubsDoc claves={CLAVES} ocultar={[]} /></Win> },
  { c: "C2", n: "Una palabra", d: 2.6, front: subE("c2") },
  { c: "C4", n: "Chicas + CLAVE grande", d: 2.6, front: subE("c4") },
  { c: "C5", n: "Pastilla blanca", d: 2.6, front: subE("c5") },
  { c: "C6", n: "Línea + remate", d: 2.6, front: subE("c6") },
  { c: "C7", n: "Revista", d: 2.6, front: subE("c7") },
  { c: "C8", n: "Bajo el mentón", d: 2.6, front: subE("c8") },
  { c: "C9", n: "Escalera", d: 2.6, front: subE("c9") },
  { c: "C10", n: "Karaoke en pastilla", d: 2.6, front: (a, b) => <Win a={a} b={b}><SubsKaraoke /></Win> },
  { c: "C11", n: "Palabra a palabra con cursiva", d: 2.6, front: (a, b) => <Win a={a} b={b}><SubsPalabra claves={CLAVES} /></Win> },
  { c: "C12", n: "Corchetes", d: 2.6, front: (a, b) => <Win a={a} b={b}><SubsCorchetes claves={CLAVES} /></Win> },
];

const P2: Slot[] = [
  { c: "D1", n: "Texto detrás de la cabeza", d: 2.5, behind: (a, b) => <BehindText from={a} to={b - 0.2} top={HEAD - 170} size={240} lines={[{ at: a + 0.1, t: "DINERO" }]} /> },
  { c: "D2", n: "Portada de revista", d: 2.5, behind: (a, b) => <CoverStory from={a} to={b - 0.2} top={HEAD - 200} kicker="EDICIÓN NOVIEMBRE" lines={[{ at: a + 0.2, t: "INVERTIR" }]} /> },
  { c: "D3", n: "Notas en la pared", d: 2.5, behind: (a, b) => <PaperWall to={b - 0.2} notes={[{ at: a + 0.2, t: "zapatos", x: 70, y: 420, rot: -6 }, { at: a + 0.7, t: "celular", x: 760, y: 380, rot: 5 }, { at: a + 1.2, t: "ropa", x: 90, y: 700, rot: 4 }]} /> },
  { c: "D4", n: "Pared de miniaturas", d: 2.5, behind: (a, b) => <ThumbWall from={a} to={b - 0.1} /> },
  { c: "D5", n: "Cifra que cuenta", d: 2.5, behind: (a, b) => <CifraDetras from={a + 0.1} to={b - 0.2} valor={24} sufijo=" cuotas" top={HEAD - 160} size={200} /> },
  { c: "D6", n: "Gráfica que crece", d: 2.5, behind: (a, b) => <GraficaDetras from={a + 0.1} to={b - 0.2} top={180} /> },
  { c: "D7", n: "Apagón", d: 2.5, behind: (a, b) => <><Look estilo="g3" from={a} until={b} /><BehindText from={a + 0.2} to={b - 0.2} top={HEAD - 170} size={260} lines={[{ at: a + 0.3, t: "BLACK" }]} /></> },
  { c: "D8", n: "Palabra ventana", d: 2.2, front: (a, b) => <PalabraVentana from={a + 0.2} to={b - 0.3} palabra="salta." /> },
  { c: "D9", n: "Cuerpo de texto", d: 2.3, front: (a, b) => <CuerpoTexto from={a + 0.2} to={b - 0.3} /> },
  { c: "D10", n: "Clones", d: 2.5, behind: (a, b) => <Clones from={a + 0.1} to={b - 0.3} /> },
  { c: "D11", n: "Número de sección", d: 2.5, behind: (a, b) => <NumeroSeccion from={a + 0.1} to={b - 0.2} n="1" top={60} /> },
  { c: "D12", n: "Vidrio acanalado", d: 2.5, behind: (a, b) => <VidrioAcanalado from={a + 0.1} to={b - 0.2} palabra="Gasto" top={HEAD - 200} /> },
  { c: "D13", n: "Cinta de luz", d: 2.5, behind: (a, b) => <CintaDeLuz from={a + 0.1} to={b - 0.2} /> },
  { c: "T1", n: "Fondo que cambia", d: 2.5, behind: (a, b) => <WhiteOut from={a + 0.1} to={b - 0.2} word="GASTO" top={HEAD - 150} /> },
  { c: "T2", n: "Vertigo", d: 2.5, vertigo: true },
  { c: "T3", n: "Zoom que atraviesa", d: 2.3, zt: true },
  { c: "T5", n: "Zoom digital", d: 2.5, digital: true, front: (a, b) => <Vineta golpes={[{ at: a + 0.5, to: a + 1.9 }]} /> },
  { c: "T6", n: "Barrido circular", d: 2.3, front: (a) => <CirculoWipe at={a + 0.6} /> },
  { c: "T7", n: "Saltos de encuadre", d: 2.5, saltos: true },
  { c: "T8", n: "Congelar imagen", d: 2.5, front: (a, b) => <Congelar at={a + 0.4} to={b - 0.3} etiqueta="Esa era yo" /> },
  { c: "T9", n: "Barrido de color", d: 2.5, front: (a, b) => <BarridoColor from={a} at={a + 1.3} /> },
  { c: "T10", n: "Cámara a saltos (12 cps)", d: 2.5, front: (a, b) => <CamaraSaltos from={a + 0.2} to={b - 0.2} /> },
  { c: "T4", n: "Marco de reel", d: 3.0, shrink: true },
];

const P3: Slot[] = [
  { c: "A1", n: "Checklist de vidrio", d: 2.5, front: (a, b) => <GlassChecklist from={a} to={b - 0.2} top={1060} title="Antes de invertir" rows={[{ at: a + 0.4, t: "¿Te sirve cada semana?" }, { at: a + 1.1, t: "¿Te deja trabajar con bebés?" }, { at: a + 1.8, t: "¿Vuelve el dinero?" }]} /> },
  { c: "A2", n: "Testimonio en chat", d: 2.5, front: (a, b) => <ChatTestimonio from={a} to={b - 0.2} readFrom={a + 0.4} top={1050} who="Alumna" text="Aquí va el mensaje real de una alumna, tal cual lo escribió." /> },
  { c: "A3", n: "Órbita", d: 2.5, behind: (a, b) => <Orbit layer="back" from={a} to={b - 0.2} cy={1000} rx={260} items={[{ t: "Abogadas", icon: "heart", at: a + 0.2 }, { t: "Terapeutas", icon: "star", at: a + 0.4 }, { t: "Médicos", icon: "baby", at: a + 0.6 }]} />,
    front: (a, b) => <Orbit layer="front" from={a} to={b - 0.2} cy={1000} rx={260} items={[{ t: "Abogadas", icon: "heart", at: a + 0.2 }, { t: "Terapeutas", icon: "star", at: a + 0.4 }, { t: "Médicos", icon: "baby", at: a + 0.6 }]} /> },
  { c: "A4", n: "Palabra que se enfoca", d: 2.4, front: (a, b) => <FocusWord at={a + 0.2} to={b - 0.2} t="Invertir" top={1100} /> },
  { c: "A5", n: "Notificación", d: 2.4, front: (a, b) => <Notificacion from={a + 0.2} to={b - 0.2} app="Calendario" titulo="Taller en vivo" texto="Empieza en 10 minutos" icono="📅" /> },
  { c: "A6", n: "Anillo que cuenta", d: 2.4, front: (a, b) => <AnilloCuenta from={a + 0.1} to={b - 0.2} valor={24} etiqueta="cuotas" /> },
  { c: "A7", n: "Calendario", d: 2.5, front: (a, b) => <Calendario from={a + 0.1} to={b - 0.2} desde={2016} hasta={2026} /> },
  { c: "A8", n: "Línea fija", d: 2.4, front: (a, b) => <BannerFijo from={a} to={b - 0.2} texto="Comenta GUIA y te envío el enlace" /> },
  { c: "A9", n: "Serie numerada", d: 2.5, front: (a, b) => <Win a={a} b={b}><Serie titulo="3 gastos que parecen inversión" to={b - 0.2} items={[{ at: a + 0.2, t: "Zapatos" }, { at: a + 1.1, t: "Celular" }, { at: a + 2, t: "Ropa" }]} /></Win> },
  { c: "A10", n: "Nota con flecha", d: 2.4, front: (a, b) => <NotaFlecha from={a + 0.1} to={b - 0.2} texto="antes" x={90} y={560} ax={380} ay={760} /> },
  { c: "A11", n: "Ranking", d: 2.5, front: (a, b) => <Ranking from={a} to={b - 0.2} top={240} titulo="¿Gasto o inversión?" items={[{ at: a + 0.4, fila: 0, t: "Capacitación" }, { at: a + 1, fila: 2, t: "Celular" }, { at: a + 1.6, fila: 3, t: "Zapatos" }]} /> },
  { c: "A12", n: "Barra de pedido", d: 2.5, front: (a, b) => <BarraPedido from={a} to={b - 0.2} texto="hazlo más elegante" hecho={{ at: a + 1.8, t: "listo" }} etiqueta="Para Claude" /> },
  { c: "A13", n: "Reloj de material", d: 2.4, front: (a, b) => <RelojMaterial from={a} to={b - 0.2} desde={67} hasta={52} /> },
  { c: "A14", n: "Lista lateral", d: 2.5, front: (a, b) => <ListaLateral from={a} to={b - 0.2} titulo="Gastos" items={[{ at: a, t: "Zapatos" }, { at: a + 0.7, t: "Celular" }, { at: a + 1.4, t: "Ropa" }, { at: a + 2.1, t: "Capacitación" }]} /> },
  { c: "A15", n: "Cursor en vivo", d: 2.5, front: (a, b) => <CursorVivo from={a} to={b - 0.2} puntos={[{ at: a, x: 850, y: 1500 }, { at: a + 0.8, x: 330, y: 330 }]} caja={{ at: a + 1, x: 330, y: 330, w: 420, h: 560 }} /> },
  { c: "A16", n: "Contador que rueda", d: 2.5, front: (a, b) => <ContadorRueda from={a} to={b - 0.2} valor={1120840} titulo="Ejemplo de cifra (solo reales)" /> },
  { c: "A17", n: "Antes y después", d: 2.5, front: (a, b) => <AntesDespues from={a} to={b - 0.2} /> },
  { c: "A18", n: "Camino de nodos", d: 2.5, front: (a, b) => <CaminoNodos from={a} to={b - 0.2} nodos={[{ at: a + 0.2, t: "Dudas", x: 300, y: 420 }, { at: a + 0.8, t: "Taller", x: 620, y: 700 }, { at: a + 1.4, t: "Atiendes", x: 360, y: 1000 }]} /> },
  { c: "A19", n: "Tarjetas de vistas", d: 2.5, front: (a, b) => <TarjetasVistas from={a} to={b - 0.2} items={[{ at: a + 0.2, valor: "317", etiqueta: "vistas", titulo: "Antes" }, { at: a + 0.8, valor: "71.973", etiqueta: "vistas", titulo: "Después" }]} /> },
  { c: "A20", n: "Ficha de marca", d: 2.5, front: (a, b) => <FichaMarca from={a} to={b - 0.2} colores={["#0b2e2c", "#2fd6c6", "#f47c8c", "#F4EEDF"]} nombre="Instrument Serif" /> },
  { c: "A21", n: "Cita de estudio", d: 2.5, front: (a, b) => <CitaEstudio from={a} to={b - 0.2} revista="Nombre de la revista, año" titulo="Título real del estudio" autores="Autores del estudio" frase="la frase clave" /> },
  { c: "A22", n: "Tira de video", d: 2.5, front: (a, b) => <TiraVideo from={a} to={b - 0.2} desde={5} hasta={40} /> },
  { c: "A23", n: "Título fijo en serif", d: 2.4, front: (a, b) => <TituloFijo from={a} to={b} lineas={["Gasto o inversión", "en tu carrera"]} /> },
];

const P4: Slot[] = [
  { c: "K1", n: "Comenta PALABRA clásico", d: 3, front: (a, b) => <Win a={a} b={b}><CommentCTA from={a + 0.1} keyword="GUIA" sub="y te envío el enlace" /></Win> },
  { c: "K2", n: "Tarjeta «Comenta»", d: 3, front: (a, b) => <ComentaCTA from={a + 0.1} to={b - 0.2} palabra="GUIA" /> },
  { c: "K3", n: "Comentario en vivo", d: 3.6, front: (a, b) => <ComentarioEnVivo from={a + 0.1} to={b - 0.2} palabra="GUIA" respuesta={{ quien: "Tu cuenta", texto: "Te lo envío por mensaje" }} /> },
  { c: "K4", n: "Botón (anuncios)", d: 3.6, front: (a, b) => <><TapButton from={a + 0.1} to={a + 1.8} /><Win a={a + 1.9} b={b}><EndCard from={a + 1.9} tag="Taller en vivo" title={["Planea tu", "sesión"]} button="Conoce más" /></Win></> },
  { c: "K5", n: "Botón que brilla", d: 2.8, front: (a, b) => <BotonBrillo from={a} to={b - 0.2} texto="Conoce más" /> },
  { c: "K6", n: "Comenta con destellos", d: 2.8, front: (a, b) => <ComentaDestellos from={a} to={b - 0.2} palabra="GUIA" linea="y te envío el enlace" /> },
  { c: "G1", n: "Cálido de cine", d: 2.6, front: (a, b) => <Look estilo="g1" from={a} until={b} /> },
  { c: "G2", n: "Sepia suave", d: 2.6, front: (a, b) => <Look estilo="g2" from={a} until={b} /> },
  { c: "G3", n: "Editorial oscuro", d: 2.6, front: (a, b) => <Look estilo="g3" from={a} until={b} /> },
  { c: "G4", n: "Documental cálido", d: 3.4, front: (a, b) => <Win a={a} b={b}><Pelicula until={b} /><Franjas until={b} /><Capitulo from={a + 0.1} to={a + 1.6} n="01" t="El gasto" /><Rotulo from={a + 1.7} to={b - 0.1} top={1250} nombre="Nombre Apellido" detalle="Profesión · ciudad" /></Win> },
  { c: "G5", n: "Portada de periódico", d: 2.6, front: (a, b) => <Periodico from={a + 0.1} to={b - 0.2} nombre="El Diario del Reel" fecha="Noviembre" titular="Gasto o inversión" bajada="lo que nadie te dice" cita="Comenta GUIA" foto={a + 1} /> },
  { c: "G6", n: "Billete", d: 2.6, front: (a, b) => <Billete from={a + 0.1} to={b - 0.2} titulo="Taller en vivo" cifra="27" foto={a + 1} /> },
  { c: "G7", n: "Impacto", d: 2.2, front: (a, b) => <Impacto from={a + 0.1} to={b - 0.3} palabra="Impacto" foto={a + 0.6} recorte /> },
  { c: "I1", n: "Pictograma", d: 2.6, front: (a, b) => <Pictograma from={a} to={b - 0.2} icono="silla" chica="todo se reduce a" cursiva="dirigir" /> },
  { c: "I2", n: "Cifra con gráfica", d: 2.8, front: (a, b) => <CifraGrafica from={a} to={b - 0.2} valor={4.1} sufijo="M" etiqueta="Ejemplo (solo datos reales)" nota="Dato real aquí" /> },
  { c: "I3", n: "Artículo resaltado", d: 3, front: (a, b) => <ArticuloResaltado from={a} to={b - 0.2} medio="Nombre del medio" titular="Aquí va el titular real del artículo" texto="Aquí va el párrafo real del artículo, tal cual, y el resaltador marca la frase que importa para el video." resaltar="la frase que importa" /> },
  { c: "I4", n: "Palabra a pantalla completa", d: 3.2, front: (a, b) => <><PalabraPantalla from={a} to={a + 0.9} modo="conteo" texto="" numeros={[{ at: a, n: "1" }, { at: a + 0.3, n: "2" }, { at: a + 0.6, n: "3" }]} /><PalabraPantalla from={a + 0.9} to={a + 1.7} modo="repite" texto="BAM" /><PalabraPantalla from={a + 1.7} to={a + 2.5} modo="escribe" texto="ESCRIBE" /><PalabraPantalla from={a + 2.5} to={b - 0.1} modo="brillo" texto="LARGO." /></> },
];

// Motion graphics sobre la cámara (mg.tsx y fx-apoyo-visual.tsx): no tienen código en el menú; se piden por nombre.
const P5: Slot[] = [
  { c: "M1", n: "Texto cinético (Kin)", d: 2.4, front: (a, b) => <Kin from={a} to={b - 0.2} lines={[{ at: a + 0.1, t: "No es un" }, { at: a + 0.5, t: "GASTO", huge: true, strikeAt: a + 1.4 }]} /> },
  { c: "M2", n: "Cifra grande (BigNumber)", d: 2.4, front: (a, b) => <BigNumber from={a} to={b - 0.2} value={24} label="cuotas" sub="con intereses" top={1050} /> },
  { c: "M3", n: "Lista que se tacha (ListCard)", d: 2.4, front: (a, b) => <ListCard from={a} to={b - 0.2} top={1000} title="Son un gasto" rows={[{ at: a + 0.2, t: "Zapatos", strikeAt: a + 1.2 }, { at: a + 0.5, t: "Celular", strikeAt: a + 1.4 }, { at: a + 0.8, t: "Ropa", strikeAt: a + 1.6 }]} /> },
  { c: "M4", n: "Flujo con iconos (Flow)", d: 2.4, front: (a, b) => <Flow from={a} to={b - 0.2} items={[{ at: a + 0.1, t: "Aprendes", icon: "bulb" }, { at: a + 0.6, t: "Atiendes", icon: "baby" }, { at: a + 1.1, t: "Vuelve", icon: "target" }]} /> },
  { c: "M5", n: "Pasos 1-2-3 (Stepper)", d: 2.4, front: (a, b) => <Stepper from={a} to={b - 0.2} steps={[a + 0.3, a + 0.9, a + 1.5]} labels={["Aprende", "Practica", "Cobra"]} y={300} /> },
  { c: "M6", n: "Personas (People)", d: 2.4, front: (a, b) => <People from={a} to={b - 0.2} n={5} top={1330} /> },
  { c: "M7", n: "Cita (QuoteCard)", d: 2.4, front: (a, b) => <QuoteCard from={a} to={b - 0.2} who="Texto de muestra" lines={[{ at: a + 0.2, t: "Aquí va lo que dijo" }, { at: a + 0.8, t: "una alumna, tal cual." }]} /> },
  { c: "M8", n: "Proporción (Ratio)", d: 2.4, front: (a, b) => <Ratio from={a} to={b - 0.2} total={10} on={3} top={1080} onAt={a + 0.8} /> },
  { c: "M9", n: "Reloj que gira (SpinClock)", d: 2.4, front: (a, b) => <SpinClock from={a} to={b - 0.2} x={780} y={420} /> },
  { c: "M10", n: "Globos de pregunta (Bubbles)", d: 2.4, front: (a, b) => <Bubbles to={b - 0.2} items={[[a + 0.2, 250, 520, 90], [a + 0.5, 820, 470, 110, true], [a + 0.8, 300, 760, 80]]} /> },
  { c: "M11", n: "Signos que saltan (Marks)", d: 2.4, front: (a, b) => <Marks to={b - 0.2} ch="?" items={[[a + 0.2, 230, 480, -10, 120], [a + 0.5, 830, 520, 12, 140], [a + 0.8, 780, 800, -6, 100]]} /> },
  { c: "M12", n: "Icono tachado (Crossed)", d: 2.4, front: (a, b) => <Crossed from={a} to={b - 0.2} icon="clock" x={540} y={1150} xAt={a + 1} /> },
  { c: "M13", n: "Reproductor (PlayerMock)", d: 2.4, front: (a, b) => <PlayerMock from={a} to={b - 0.2} top={280} label="Clase 1" /> },
  { c: "M14", n: "Checklist arriba (Checklist)", d: 2.4, front: (a, b) => <Checklist from={a} to={b - 0.2} title="Antes de invertir" items={[{ at: a + 0.2, t: "¿Te sirve?" }, { at: a + 0.8, t: "¿Vuelve el dinero?" }]} /> },
  { c: "M15", n: "Titular en la pared (Headline)", d: 2.4, behind: (a, b) => <Headline at={a + 0.1} to={b - 0.2} x={50} y={260} w={440} tag="NOTICIA" title="Aquí va el titular real de la noticia" /> },
  { c: "M16", n: "Chat con IA (ChatMock)", d: 2.4, front: (a, b) => <ChatMock from={a} to={b - 0.2} top={240} msgs={[{ at: a + 0.2, who: "tu", t: "Quita las pausas" }, { at: a + 0.9, who: "ia", t: "Listo, quedó de 52 s" }]} /> },
  { c: "M17", n: "Terminal (Terminal)", d: 2.4, front: (a, b) => <Terminal from={a} to={b - 0.2} top={240} lines={[{ at: a + 0.2, t: "$ render.sh reel.mp4" }, { at: a + 0.9, t: "✓ listo: -14 LUFS" }]} /> },
  { c: "M18", n: "Archivo (FileCard)", d: 2.4, front: (a, b) => <FileCard from={a} to={b - 0.2} top={240} name="plan.md" lines={[{ at: a + 0.2, t: "1. Gancho" , ok: true }, { at: a + 0.6, t: "2. Problema", ok: true }, { at: a + 1, t: "3. Cierre" }]} /> },
  { c: "M19", n: "Carpetas (Folders)", d: 2.4, front: (a, b) => <Folders from={a} to={b - 0.2} top={240} items={[{ at: a + 0.2, t: "Marketing" }, { at: a + 0.6, t: "Ventas" }, { at: a + 1, t: "Producto" }]} /> },
  { c: "M20", n: "Días de la semana (DayStrip)", d: 2.4, front: (a, b) => <DayStrip from={a} to={b - 0.2} at={[a + 0.2, a + 0.5, a + 0.8, a + 1.1, a + 1.4]} label="todos los días" /> },
  { c: "M21", n: "Conteo (CountPop)", d: 2.4, front: (a, b) => <CountPop from={a} to={b - 0.2} at={[a + 0.2, a + 0.7, a + 1.2]} end={{ at: a + 1.7, t: "¡listo!" }} /> },
  { c: "M22", n: "Comenta palabra (CommentWord)", d: 2.4, front: (a) => <Win a={a} b={a + 2.4}><CommentWord at={a + 0.1} word="GUIA" sub="y te envío el enlace" /></Win> },
  { c: "M23", n: "Pregunta para comentar (AskComment)", d: 2.4, front: (a, b) => <AskComment at={a + 0.1} to={b - 0.2} q={["¿Gasto o inversión?", "Te leo abajo"]} /> },
  { c: "M24", n: "Seguir y guardar (FollowSave)", d: 2.4, front: (a) => <Win a={a} b={a + 2.4}><FollowSave at={a + 0.1} saveAt={a + 1.2} /></Win> },
  { c: "M25", n: "Destello en el corte (Flash)", d: 2.4, front: (a) => <Flash cuts={[a + 0.6, a + 1.5]} /> },
];

const GRUPOS: Record<string, string> = { H: "Ganchos", C: "Subtítulos", D: "Detrás de la persona", T: "Cámara y transiciones", A: "Tarjetas y apoyos", K: "Cierres", G: "Look de color", I: "Insertos a pantalla completa", M: "Motion graphics sobre cámara" };
const INICIO = 0.4;
const tiempos = (slots: Slot[]) => { let t = INICIO; return slots.map((s) => { const a = t; t += s.d; return { s, a, b: t }; }); };
export const durCat = (slots: Slot[]) => tiempos(slots).slice(-1)[0].b + 0.3;
export const PARTES = [P1, P2, P3, P4, P5];

const Etiqueta: React.FC<{ items: { s: Slot; a: number; b: number }[] }> = ({ items }) => {
  const t = useT();
  const it = items.find((x) => t >= x.a && t < x.b) ?? (t < INICIO ? items[0] : items[items.length - 1]);
  return (
    <div style={{ position: "absolute", top: 46, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(10,10,10,.82)", padding: "10px 24px 10px 12px", borderRadius: 40 }}>
        <span style={{ fontFamily: TITLE, fontWeight: 900, fontSize: 34, color: "#111", background: "#F4EEDF", padding: "2px 14px", borderRadius: 24 }}>{it.s.c}</span>
        <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, color: "#fff" }}>{it.s.n}</span>
        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: 2 }}>· {GRUPOS[it.s.c[0]]}</span>
      </div>
    </div>
  );
};

const Parte: React.FC<{ slots: Slot[] }> = ({ slots }) => {
  const items = tiempos(slots);
  const fin = durCat(slots);
  let keys: CamKeyV[] = [{ at: 0, box: CAM_FULL, zoom: 1, fy: 30 }];
  const on: [number, number][] = [], zt: number[] = [], vertigo: [number, number, number][] = [];
  let shrink: Shrink | undefined;
  for (const { s, a, b } of items) {
    if (s.behind) on.push([a, b]);
    if (s.zt) zt.push(a + 1.1);
    if (s.vertigo) vertigo.push([a + 0.2, b - 0.3, 0.25]);
    if (s.saltos) { keys.push({ at: a, box: CAM_FULL, zoom: 1, fy: 30 }); [0.7, 1.4, 2.1].forEach((d, i) => keys.push({ at: a + d, box: CAM_FULL, zoom: i % 2 ? 1 : 1.13, fy: 30 })); keys.push({ at: b, box: CAM_FULL, zoom: 1, fy: 30 }); }
    if (s.shrink) shrink = { from: a + 0.3, s: 0.82 };
  }
  keys.sort((x, y) => x.at - y.at);
  for (const { s, a } of items) if (s.digital) keys = conZoomDigital(keys, [{ at: a + 0.5, to: a + 1.9, zoom: 1.6, fy: 22 }]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam2 keys={keys} until={fin + 1} on={on} zt={zt} vertigo={vertigo} shrink={shrink} behind={<>{items.map(({ s, a, b }, i) => s.behind ? <React.Fragment key={i}>{s.behind(a, b)}</React.Fragment> : null)}</>} />
      {items.map(({ s, a, b }, i) => s.front ? <React.Fragment key={i}>{s.front(a, b)}</React.Fragment> : null)}
      <Etiqueta items={items} />
    </AbsoluteFill>
  );
};
export const Cat1 = () => <Parte slots={P1} />;
export const Cat2 = () => <Parte slots={P2} />;
export const Cat3 = () => <Parte slots={P3} />;
export const Cat4 = () => <Parte slots={P4} />;
export const Cat5 = () => <Parte slots={P5} />;
