# Estilo y catálogo de piezas

Estilo por defecto de la skill: talking head con cortes sin pausas, tarjetas UI oscuras con esquinas
redondeadas, cámara en recuadro o pantalla dividida cuando hay un gráfico, subtítulos con la palabra clave
en color, whooshes/pops y música lo-fi baja. Si la persona eligió copiar otro estilo, primero aplicar
`copiar-estilo.md`.

El ejemplo completo está en `template/src/video.tsx` (y uno avanzado con tomas de apoyo en
`references/ejemplo-video-noticias.tsx`). Copia patrones de ahí.

## Encuadres (`KEYS` en video.tsx)

| Encuadre | Cuándo | Tarjeta que lo acompaña |
|---|---|---|
| `punch(1.0)` | Gancho inicial, frases personales, transiciones | Ninguna, o `LowerThird` / `JourneyBar` arriba |
| `punch(1.12–1.2)` | Énfasis: "lo más importante", advertencias, remates | Ninguna o `Quote` |
| `PIP` | Explicaciones con lista, números o proceso | Tarjeta en `CARD_AREA` (ancho 1320) |
| `SPLIT` | Contrastes cortos (2 ítems), para variar respecto a PIP | Tarjeta en `SPLIT_CARD` (ancho 900) |
| `END` | Cierre / CTA / "a continuación" | `EndTitle` |

- Un `punch()` después de otro `punch()` es un **corte seco** (así se sienten los jump cuts con zoom).
  Cualquier otro cambio anima la caja en 0,5 s — pon el `whoosh` en ese mismo segundo.
- Arranca el cambio a PIP ~0,3 s antes de que aparezca el primer ítem de la tarjeta.
- Duración mínima de un encuadre: ~1,2 s. Máximo sin cambio visual: ~8 s (agrega un ítem, un
  contador o un punch-in para romper).

## Piezas (lib.tsx)

- `Card from to style` — contenedor con entrada/salida animada. Dentro: `Chip` (etiqueta de color,
  2–3 palabras en mayúscula) + `Title` (≤ 5 palabras) + contenido.
- `Row at icon="x"|"check" strikeAt?` — fila de lista. ✗ rojo para "lo que no tenía/no hay que hacer",
  ✓ lima para beneficios/pasos cumplidos. Máx. 3 por tarjeta en PIP, 2 en SPLIT. `strikeAt` tacha.
- `Stat at label big accent` + `Counter at to prefix suffix` — números grandes que suben. 2–3 en fila.
  `big` también acepta un emoji/símbolo ("♥").
- `ProgressBar at dur left right` — barra A→B dentro de una tarjeta (transformaciones, metas).
- `Node` + `Arrow` — flujo de hasta 3 pasos (etiquetas ≤ 14 letras o desbordan).
- `LowerThird from to tag text` — etiqueta arriba a la izquierda con punto rojo (ENTREVISTA, EN VIVO, CASO REAL…).
- `JourneyBar from to fillAt fillDur left right` — barra arriba a la derecha, con cámara completa.
- `Quote from to lines mark` — frase-remate grande, palabra por palabra; `mark` = palabra con marcador lima.
  Siempre ocultar subtítulos en ese tramo (`HIDE_SUBS`).
- `EndTitle from chip title` — texto de cierre sobre la cámara en `END`. Ocultar subtítulos.

## Piezas de IA y herramientas

- `ToolBadge from to logo name sub? wordmark? side?` — insignia arriba (derecha por defecto) con logo
  oficial + nombre, con brillo al entrar. Para cámara FULL cuando se nombra una herramienta
  (~2,5–4 s). Si hay `LowerThird` a la izquierda, déjala a la derecha. `wordmark` si el logo ya trae el nombre (HighLevel).
- `LogoNode at logo label accent wordmark?` — como `Node` pero con logo; sin `logo` muestra el destello de IA.
- `PromptCard from to typeFrom typeTo text agent? logo?` — caja de chat donde se escribe la instrucción
  letra por letra y se "envía" (poner `click` en typeTo). Texto ≤ 110 caracteres.
- `AgentTasks from to title tasks=[{label, at, logo?}]` — el agente trabajando: tareas con spinner que
  pasan a ✓, contador y barra; al final "¡Listo!". `pop` en cada ✓ y `ding` en la última.
- `NeuralBg` — red neuronal tenue con pulsos, detrás de la cámara (solo se ve con PIP/SPLIT/END).
- `Sparkle` — ícono de IA genérico. `Logo file height` — logo suelto.
- `Meter at label value color` — medidor de porcentaje (comparar tiempos: "vender 5 % / operativo 95 %").

Biblioteca de logos: `assets/logos/` (empieza vacía; `logo.py` guarda ahí cada logo nuevo que encuentra). Alias: chatgpt/gpt → openai,
ghl/highlevel → gohighlevel, claude-code → claude.

## Efectos especiales
Catálogo de 17 efectos (qué se ve, cómo se arma, si necesita recortar a la persona y cuáles usar primero):
`references/efectos-17.md`.

## Subtítulos
- Automáticos desde `words.ts`: grupos de hasta 4 palabras, cortan en puntuación y pausas.
- `KEYWORDS`: 1–2 palabras por frase como máximo — sustantivos/números que cargan el sentido
  (resultados, herramientas, conceptos). Si todo está resaltado, nada lo está.
- Se corren solos a la derecha cuando la cámara está en PIP/SPLIT para no taparla.

## Sonido (`SFX`)
whoosh = cambio de encuadre · pop = aparece un ítem · ding = número/logro (y al completar una barra) ·
click = tachado o marcador · boom (v 0.5–0.6) = punch-in de énfasis. No más de ~1 efecto por segundo.
Los efectos son sintéticos (hechos con ffmpeg). Si la persona trae un pack de SFX, reemplaza los WAV de
`public/sfx/` manteniendo los nombres.

## Lecciones aprendidas (no repetir)
- Logos: en svgl la variante `dark` es la que va sobre fondo oscuro (la `light` es negra y no se ve).
  La búsqueda por "contiene" trajo FrameMaker en vez de Make: `logo.py` ahora exige nombre exacto.
  Por eso, todo logo nuevo se revisa en un fotograma antes de renderizar.
- Whisper a veces alarga una palabra por encima de un silencio (p. ej. "sorprendente" de 2,3 s):
  `cut.py` limita palabras a 0,95 s por eso. Si aún queda una pausa, usa `--drop`.
- El audio de muchas grabaciones viene bajo: siempre normalizar (render.sh lo hace).
- Texto oscuro sobre marcador: el marcador necesita `isolation: isolate` o queda detrás del fondo (ya resuelto en `Quote`).
- Subtítulos de una sola palabra se ven pobres: el agrupador los evita salvo pausas largas.
- Revisar con fotogramas en el momento en que TODOS los ítems de la tarjeta ya aparecieron, para
  detectar desbordes ("Oportunidades" desbordaba un Node de 330 px; ahora son 350 px con fuente 40).

## Tomas de apoyo / b-roll
Para videos de noticias donde la persona comenta un lanzamiento: fragmentos cortos del material oficial
detrás de la cámara (la cámara pasa a `PIP`).
- `Broll list={BROLL}` va en `Main` **entre `NeuralBg` y `Camera`**. Cada ítem:
  `{from, to, src, start?, tag?, credit?, zoom?, origin?}`; `src` en `public/broll/`.
  Tag arriba a la izquierda con punto rojo ("EN VIVO · lo que falló"); crédito "Imágenes: OpenAI" arriba a la derecha.
- Conseguir material: `yt-dlp` del canal oficial (pedir permiso antes de descargar; si el yt-dlp de pip
  falla, usar el binario oficial de github.com/yt-dlp/yt-dlp/releases + `--js-runtimes node`). Bajar también
  los subtítulos `--write-auto-subs --skip-download` para ubicar los momentos por texto, y armar hojas
  de fotogramas con ffmpeg para elegir tomas. Recortar clips mudos a 1920x1080/30 fps con ffmpeg.
- Fragmentos de 3–9 s, siempre mientras la persona los comenta (uso de comentario/noticia).
- Si el clip trae al presentador en recuadro abajo a la izquierda (demos de keynote), usar
  `zoom: 1.32, origin: "72% 38%"` para que no choque con la cámara.
- `SectionCard from to n title titleAt` — apertura de cada parte ("Parte 1 de 4"), con cámara en `SPLIT`.
- `LogoRow from to items=[[archivo, at]] label` — fila de logos que entran uno a uno (socios, integraciones).
- `Options items=[[label, at]] pick pickAt` — opciones cerradas donde una queda elegida (clasificación, rutas).
- En videos largos, los SFX se arman solos: whoosh/boom desde `KEYS` + listas `POPS/DINGS/CLICKS`
  (ver `buildSfx` en `references/ejemplo-video-noticias.tsx`).
- Música: si la pista es corta, encadenar copias con `acrossfade` (ver SKILL.md, paso 6).
