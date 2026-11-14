# Estilo «Palabra grande»

Receta con piezas que YA están en el menú (no trae código propio). Para la marca personal de Juan, por ahora
(«esto es para los míos por ahora», 13-nov-2026).

## De dónde sale
- Juan, 2026-11-13: «quiero mis videos editados como los de» una cuenta de referencia de Instagram. Se bajaron 3 reels públicos
  solo para mirarlos (`Edicion videos/referencias/itsmegkilgore/`, hojas de fotogramas y `cuadros-grandes.jpg`).
- Se copia el lenguaje visual (letras, tamaños, lugares, ritmo). No se copian sus videos, textos, marca, música ni capturas.
- Casi todo ya estaba en el menú: varias piezas del 7-nov salieron de esta misma cuenta.

## La receta
| Qué se ve en la referencia | Código | Pieza |
|---|---|---|
| Gancho grande al centro-arriba en 2–4 líneas que alternan sans gruesa blanca y serif cursiva amarilla; a veces la cabeza tapa una parte | H8 (o P1 detrás de la cabeza) | `FraseQueSeArma` / `TituloDetras` |
| Subtítulo: UNA palabra a la vez, grande, blanca, en minúscula, al centro del pecho; las claves en serif cursiva amarilla | C11 | `SubsPalabra` (`size` ~110–120) |
| Algunas frases CORTAS (3–5 palabras) en letra a mano (amarilla), centradas en el pecho; se arman enteras palabra por palabra | C11 con `mano` | `SubsPalabra mano={[[a, b, MANO.b]]}` |
| A veces la palabra se va al costado de la cabeza (lado libre, a la altura de la sien) | C11 con `lado` (o P2) | `SubsPalabra lado={[[a, b, "der"]]} yLado={…}` |
| En tramos largos, la frase entera chica en una línea con 1 palabra en cursiva amarilla | P5 sin destellos | `SubsSerif` |
| Nota a mano delgada al costado de la cabeza con flecha que apunta a la persona («solo soy una mamá») | A10 (+ letra a mano B) | `NotaFlecha` |
| Apoyos que se dicen: tarjetas con números reales, ficha «Aa» de marca, cursor, capturas flotando | A19 · A20 · A15 · `Cutaway` | según se diga |
| Encuadre: tomas largas, pocos cortes (0–6 por minuto); cambia el plano (sofá abierto / cara cerca) entre tramos | T7 suave | zoom 1 / 1,08 |
| Video viejo de la cuenta: título fijo en serif blanca con borde arriba + subtítulo amarillo nativo de una palabra | A23 + C11 | `TituloFijo` |

**Colores:** solo dos, blanco + un amarillo (la referencia usa un amarillo pálido ~#F6E7A1; en Juan va su acento si él no dice
otro). **Letras:** sans gruesa apretada en minúscula (Inter Tight 700) + serif cursiva (Instrument Serif). Toda la letra a mano en B (Gochi Hand), la que eligió Juan: nota con flecha y frases de subtítulo.

## Lo que nunca va
- Textos, cifras, capturas o testimonios de la cuenta de referencia.
- Nada sobre la cara (la palabra va en el pecho; la nota al costado).

## Historial de correcciones
- 2026-11-13 · «quiero mis videos editados como los de» la cuenta de referencia → receta con H8/P1 + C11 + A10 + A19/A20/A15;
  «no los edites, solo guárdalo para los otros» y «esto es para los míos por ahora».
- 2026-11-13 · «y también van la letra que parece escrita a mano y a veces los subtítulos a los lados» → C11 ganó `mano` (tramos en letra a mano) y `lado` (tramos al costado de la cabeza, con sombra más fuerte porque suele caer sobre fondo claro).
- 2026-11-13 · «como la opción B» → toda la letra a mano del estilo en B (Gochi Hand), también la nota con flecha (estaba en A).
- 2026-11-13 · «sí, y algunas frases como la opción B y las que son solas como se ve el "llena"» → confirmado: frases enteras a veces en letra a mano B; las palabras clave sueltas en serif cursiva amarilla (como «llena» en la prueba).
