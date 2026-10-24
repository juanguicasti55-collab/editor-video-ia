# Motion graphics con voz en off (sin cámara)

Para cuando NO hay grabación a cámara: un carrusel, un guion o un texto se convierte en un video vertical
hecho solo de gráficos animados + voz en off. Estilo "técnico y de autoridad": fondo oscuro con grilla,
títulos editoriales que entran palabra por palabra, paneles de datos, diagramas que se dibujan y un CTA fuerte.

Primer caso: 24-oct-2026, un carrusel de 8 láminas de una fisioterapeuta sobre reflejos primitivos → reel de
58 s con su voz clonada. Referencias de estilo que pidió la persona (se copió el lenguaje, nunca el material):
tipografía editorial cinética en blanco y negro con un color de acento (miraclestudios__), datos que se arman
dentro de una pantalla (motionloved), paleta cálida con íconos en círculos (learneditxion).

## Entrevista (además de la del SKILL.md)
1. **¿De dónde sale el contenido?** Link del carrusel (`scripts/ig_carrusel.py`), un guion o un texto.
2. **¿Quién pone la voz?**
   - **Voz IA** genérica (rápida, sin depender de nadie).
   - **La persona la graba** leyendo el guion (más autoridad, más lento).
   - **Voz clonada** de la persona: necesita **su permiso** y 20–60 s de ella hablando sola (`scripts/voz_muestra.sh`).
3. **Estilo**: si trae varias referencias distintas, preguntar cuál manda o proponer la mezcla
   ("tipografía editorial + gráficos de datos" funcionó como "técnico y de autoridad").
4. **Paleta**: por defecto la de la propia pieza fuente (el carrusel), sobre fondo oscuro.
5. **Música** y **palabra del CTA** (si el carrusel ya trae "Comenta X", usar esa).

## Flujo
1. **Bajar la fuente**: `python3 "$SKILL/scripts/ig_carrusel.py" "<url>" <carpeta>/carrusel` → láminas + caption.
   **Leer cada lámina** (son imágenes: el texto de las láminas no viene en el caption).
2. **Guion = el texto de las láminas, en orden, dicho en voz.** Nada que no esté en la fuente (ni cifras, ni casos,
   ni ejemplos). Se puede recortar y unir frases; no inventar. ~2,6–3,6 palabras/s: 200 palabras ≈ 55–75 s.
   Escribir las siglas como se dicen y deletrear lo raro para la voz.
3. **Voz**:
   - Clonada en Higgsfield: subir la muestra limpia (`media_upload` + PUT + `media_confirm` tipo audio) y generar con
     `generate_audio` modelo `seed_audio`, `medias: [{value: <id>, role: "audio_references"}]`, `format: wav`,
     `sample_rate: 44100`. Preguntar el costo antes con `get_cost: true` (oct-2026: 8,2 créditos por ~54 s, en una sola
     llamada con todo el guion). Con pocos créditos no hay segunda vuelta: decirlo antes.
   - La muestra **sin música**: los reels casi siempre traen música debajo y el clon la copiaría. `voz_muestra.sh` la
     quita con Demucs. Señal de música: `silencedetect=n=-40dB:d=0.25` no encuentra ningún silencio.
4. **Proyecto**: `"$SKILL/.venv/bin/python" "$SKILL/scripts/mg_prep.py" voz.wav <carpeta>` → plantilla vertical +
   piezas de motion graphics + fuentes locales + `words.ts` con tiempos por palabra.
   - Usar el modelo `medium` (el `small` oyó "esperador" e "inven"). **No pasar initial_prompt**: con uno que traía
     "asimétrico", Whisper oyó "asimétrico" donde la voz decía "simétrico".
   - **Verificar las palabras técnicas** contra el guion. Si una no coincide, retranscribir esa ventana
     (`oye.py` sin prompt, o `large-v3`) antes de culpar a la voz, y corregir `words.json` y `words.ts`.
5. **Imágenes**: recortar las ilustraciones de las láminas a `public/img/` (`ffmpeg -vf crop=W:H:X:Y,scale=2*iw:-1:flags=lanczos`).
   Son de la persona y van en tarjetas claras (`Ficha`), no sueltas sobre el fondo oscuro.
6. **Escenas** en `src/video.tsx` (ver el ejemplo): **una escena por lámina**, cada una con su rótulo de sección.
7. **Fotogramas** (`stills.sh`) → **música** → **render** (`render.sh`, volumen de música 0.14).

## Piezas (`template-mg/src/mograf.tsx`)
| Pieza | Para qué |
|---|---|
| `TechBg` + `Brackets` | Fondo: grilla de puntos que se desliza, retícula, línea de escaneo, viñeta y esquinas de visor |
| `Hud` | Rótulo de sección arriba ("03 — Qué pasa") con contador "03 / 08", y pie con @usuario + barra de progreso |
| `SubsMG` | Subtítulo de una línea (≤ 4 palabras), palabra activa encendida, palabras clave en el acento |
| `Scene a b` | Contenedor de un bloque (entra/sale subiendo). `a <= 0` = visible desde el fotograma 0 (gancho) |
| `Linea` | Título serif que entra con desenfoque; `italic` + color de acento para la segunda línea |
| `Tachado` | Palabra grande que se tacha (mito, "teoría") |
| `Contorno` | Sigla gigante solo en contorno (≤ 5 letras a 250 px) |
| `Ficha` | Ilustración en tarjeta clara con rótulo y sello ("¿ACTIVO?") que salta |
| `Orbita` | Anillos que giran con una sigla: cuando NO hay ilustración real de algo (no dibujar una inventada) |
| `PanelLista` | Lista con siglas y contador "03 / 05"; la fila nombrada se enciende y su imagen salta al visor |
| `Esquema` | Dos curvas que se cruzan (algo baja, otra cosa sube). Rotulado **"Esquema · sin escala"**: no son datos |
| `Flujo` | 3 pasos verticales con flecha que se dibuja; el último encendido |
| `Red` | Nodo central que late + hasta 6 factores alrededor (un "casi nunca hay una sola razón") |
| `Fichas` | Fichas que se reemplazan: sigla en contorno + imagen + frase con triángulo |
| `Tablero` | Cuadrícula: "el dato" en naranja + lo que se lee junto, que se enciende al nombrarlo |
| `Segmentos` | Barra de N segmentos con uno encendido ("una pista, no la historia completa") |
| `Bloques` | Cuadrícula 3x3 que cae al decir "estructura" |
| `CierreCTA` | Foto redonda + nombre + oficio, "Comenta" y la palabra en botón que brilla |
| `W("palabra", n)` | Segundo exacto de la n-ésima vez que se dice una palabra (sin copiar números a mano) |

## Reglas de diseño (aprendidas)
- **Zonas**: rótulo en y=262, contenido entre y≈330 y y≈1330, subtítulos en y=1398, pie en 1510–1556.
- **Gancho**: la pregunta del carrusel arriba, visible en el fotograma 0, ≥ 3 s, con las imágenes de la lámina 1 debajo.
- **Cada elemento entra en el segundo en que se dice** (±0,1 s) con su sonido: `click` en listas, `pop` en nodos,
  `whoosh` en cada cambio de escena, `boom` suave en el remate, `ding` en el CTA.
- **Nunca más de ~3 s sin algo nuevo**: si una lámina tiene mucho texto, partirla en dos estados (título → diagrama).
- **Dos frases en serif de 88 px una al lado de la otra se salen de 1080 px**: apilarlas.
- **Un gráfico sin datos se rotula como esquema.** Si la lámina trae cifras reales, `Stat`/`Counter` de `lib.tsx`.
- La palabra del CTA y el guion salen de la fuente; si la fuente no trae CTA, preguntar.

## Fuentes locales (importante en la nube)
En sesiones con proxy, el Chrome del render no puede bajar de `fonts.gstatic.com` (`ERR_CERT_AUTHORITY_INVALID`,
"Failed to fetch") y el render se cae. `scripts/fuentes.py` las baja con curl a `public/fonts` y escribe
`src/fuentes.ts`; `template-mg/src/theme.ts` las carga con `FontFace` + `delayRender`. El mismo arreglo sirve
para las plantillas de cámara si pasa ahí.

## Música
Si la persona dice "elige tú" y no hay pista libre ni un modelo de música disponible (en Higgsfield, oct-2026, el
único era solo para juegos): `"$SKILL/.venv/bin/python" -I "$SKILL/scripts/musica.py" musica.wav <duración> [bpm]`
genera una cama ambiental propia (acordes suaves, pulso grave, ticks). Es provisional: avisar que la escuchen y
que la cambien por una pista suya si la tienen. Medido en el primer caso: voz −12 LUFS, música ~20 dB por debajo.

## Antes de entregar
1. Pedir que **lo escuchen** (la IA no oye: la voz se verifica retranscribiendo y la mezcla con medidores).
2. **Permiso de la persona** si la voz es clonada.
3. Que la palabra del CTA esté conectada a su respuesta automática (ManyChat u otra).
