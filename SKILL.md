---
name: editor-video-ia
description: Edita videos grabados a cámara (talking head) y saca reels verticales con estilo profesional y dinámico, con cortes sin pausas, subtítulos palabra por palabra con palabras clave resaltadas, tarjetas animadas, zooms, pantalla dividida, logos oficiales, tomas de apoyo, efectos de sonido y música con ducking, renderizado a MP4 con Remotion. También hace videos de motion graphics sin cámara (gráficos animados y voz en off, incluso con la voz clonada de la persona) a partir de un carrusel, un guion o un texto. Antes de editar SIEMPRE entrevista a la persona sobre el tipo de video, el estilo de referencia y los datos de su marca. Úsala cuando alguien pase un video (.mp4/.mov) y pida "edita este video", "ponle subtítulos y animaciones", "quítale las pausas", "sácame reels o shorts", "quiero que se vea como los videos de [creador]", "convierte este carrusel en video" o "motion graphics", aunque no mencione la skill.
---

# Editor de video con IA (videos largos y reels)

Convierte una grabación a cámara en un video editado con estilo de creador profesional. La parte
mecánica (transcribir, cortar, recortar, renderizar) está en `scripts/`; lo que requiere criterio es
**la entrevista inicial** y **decidir las escenas** leyendo la transcripción.

Rutas: `SKILL` = carpeta de esta skill (donde está este archivo). Python de la skill: `$SKILL/.venv/bin/python`.
Habla siempre en español neutro, con "tú", y explica en simple: la persona probablemente no es editora ni programadora.

---

## Paso 0 — Dependencias (la primera vez)

```
bash "$SKILL/scripts/setup.sh"
```
Si falta ffmpeg, Node o Python, el script dice cómo instalarlo según el sistema. En Windows, recomendar WSL
(Ubuntu) o Git Bash con ffmpeg/Node/Python instalados. La primera transcripción descarga el modelo de
Whisper (~1,5 GB): avisar que tarda.

---

## Paso 1 — Entrevista (OBLIGATORIA antes de tocar el video)

Hacer las preguntas en **un solo mensaje** (si hay una herramienta de preguntas con opciones, usarla).
No preguntar lo que la persona ya dijo. Preguntas:

1. **¿Qué tipo de video es?**
   - **Video largo** (horizontal 16:9, YouTube / curso / webinar)
   - **Reels / Shorts** (vertical 9:16) — ¿a partir de un video largo o de una grabación vertical corta?
     ¿Cuántos reels quiere? (sugerir 3–6 de 30–60 s)
   - **Ambos** (primero el largo, después los reels del mismo material)
   - **Motion graphics con voz en off** (vertical, sin cámara): de un carrusel, un guion o un texto →
     seguir `references/motion-graphics.md` (tiene su propia entrevista: de dónde sale el contenido y quién pone la voz)
2. **¿Quieres copiar el estilo de alguien?** (opcional) Pedir **un link a un video** del creador o
   **3–5 capturas** de sus videos. Si dice que no, usar el estilo por defecto de la skill
   (tarjetas oscuras, acento lima y violeta). → ver `references/copiar-estilo.md`.
   **Estilo ya guardado:** si en `references/estilos/` hay una carpeta con el `ESTILO.md` de la persona (aparte de
   `_plantilla`), ese es su estilo por defecto: si no pide otro, usarlo sin volver a pedir referencias (si hay varios,
   preguntar cuál). El de Juan es «julio y santi» (`references/estilos/julio-y-santi/ESTILO.md`, con sus videos de referencia).
   En videos largos horizontales, el kit de `references/youtube-horizontal/LEEME.md` trae un estilo oscuro + dorado listo para adaptar a tu marca.

3. **Tu marca**: colores (o "los de mi logo"), tu @usuario para la marca de agua, y tu logo si quieres.
4. **¿Ya hiciste los cortes?** Si la persona ya cortó errores y pausas, NO volver a cortar
   (`cut.py --gap 99`). Si no, la skill quita pausas y tomas repetidas.
5. **Música**: archivo propio (mp3/wav libre de derechos), "sin música", o "elige tú" (ver Paso 6).
6. **Solo reels — CTA final**: palabra para comentar (ej. "Comenta GUIA y te envío…") y qué se envía.

Con las respuestas:
- Escribir los colores y la marca en `remotion/src/theme.ts` de cada proyecto (`C` y `MARCA`).
  `lime` = acento principal, `violet` = acento secundario, `bg` = fondo.
- Si hay estilo de referencia, aplicarlo según `references/copiar-estilo.md` **antes** de planificar escenas,
  y mostrarle a la persona un resumen de lo que vas a copiar ("cortes cada ~2 s, subtítulos amarillos en
  mayúsculas al centro, zooms en cada remate…") para que confirme.

---

## Video largo (16:9)

### 2. Preparar y transcribir
```
"$SKILL/.venv/bin/python" "$SKILL/scripts/prep.py" "<ruta del video>"
```
Crea `edicion-<nombre>/` junto al video (proyecto Remotion, `words.json`, `transcript.txt`, `contact.jpg`,
`crop.txt`). Tarda ~1 min por minuto de video. Para videos largos, correrlo en segundo plano.
**Mira `contact.jpg`**: si la grabación viene dentro de un marco (apps tipo Screen Studio), `prep.py` lo
detecta en `crop.txt`. Si se equivocó, corregir en el paso 3 con `--crop none` o `--crop W:H:X:Y`.

### 3. Cortes
```
"$SKILL/.venv/bin/python" "$SKILL/scripts/cut.py" "<carpeta edicion-...>" [--gap 0.28] [--drop "12.3-14.1,..."]
```
- `--gap 0.28` = ritmo ágil tipo YouTube · `0.4` = más respirado · **`99` = no cortar nada** (si la persona ya editó).
- Tomas repetidas o errores: leer `transcript.txt`, buscar frases dichas dos veces / frases cortadas, y
  eliminarlas con `--drop` (tiempos del ORIGINAL; afinar con `words.json`). Quedarse con la última toma completa.
- Imprime la transcripción con **los tiempos nuevos**: son los únicos que valen para las escenas.
- Corregir nombres mal transcritos (marcas, el nombre de la persona) en `remotion/src/words.ts`
  y, si se repiten, en `scripts/fixes.py`.
- **Velocidad** (si el estilo lo pide o la persona quiere más ritmo sin cortar palabras):
  `"$SKILL/.venv/bin/python" "$SKILL/scripts/acelerar.py" "<carpeta edicion-...>" --factor 1.08` (×1,05–1,15, la voz
  no cambia de tono). Va ANTES del paso 4: reescribe los tiempos de `words.ts`.

### 3b. Aprobar el texto (checkpoint obligatorio, antes de planear escenas)
```
"$SKILL/.venv/bin/python" "$SKILL/scripts/texto.py" "<carpeta edicion-...>"
```
Escribe `texto-propuesto.md` (el guion que va a quedar, con tiempos) y `texto-aprobado.txt`. Hace una **segunda lectura**
con otro modelo, en tramos cortos y dos veces, y marca con ⚠ lo dudoso: palabras repetidas («quieres, quieres»), frases
dichas dos veces, palabras que ninguna lectura oye (comidas en un corte), palabras «estiradas» que esconden algo.
- Revisar cada ⚠. Lo que sobra se quita rehaciendo el corte (`--drop` con el segundo del ORIGINAL, que el reporte da).
  Solo se quita o se restaura lo que se dijo: nunca se agrega ni se reordena (y el guion de la persona no se cambia).
- Mostrarle el guion final a la persona y esperar su OK; si dio control total, decidir y anotarlo en la entrega.
- Si se corrige algo, volver a correr `texto.py` hasta que no queden ⚠ sin explicar. `texto-aprobado.txt` es lo que
  `validar.py` compara después con el video final.

### 4. Planificar escenas (el trabajo de criterio)
Leer `references/estilo.md` (catálogo de piezas y reglas de ritmo). Resumen:
- Bloques de ideas de 4–10 s. Cada bloque = un encuadre + (opcional) una tarjeta.
- Listas → `Row` · números → `Stat` + `Counter` · procesos → `Node` + `Arrow` · antes/después → `ProgressBar`
  · frase-remate → `Quote` con zoom · herramienta nombrada → `ToolBadge` con su **logo oficial**
  (`scripts/logo.py`; si da NOT_FOUND, usar el destello de IA y avisar — nunca dibujar un logo de marca).
- Alternar encuadres (cámara completa, recuadro, pantalla dividida, zoom). Nada más de ~8 s sin cambio visual.
  Los primeros 2 s siempre en cámara completa (el gancho es la cara).
- Sincronizar cada elemento con el segundo exacto en que se dice la palabra (±0,1 s).
- Textos en pantalla cortos: títulos ≤ 5 palabras, filas ≤ 6.
- **Tomas de apoyo (b-roll)**: si la persona comenta algo externo (un lanzamiento, una herramienta, un evento),
  sugerir fragmentos cortos del material oficial o capturas de la web. **Pedir permiso antes de descargar**,
  clips de < 10–15 s siempre comentados y con crédito ("Imágenes: [fuente]"). Ver `references/estilo.md` → b-roll
  y `references/ejemplo-video-noticias.tsx`.
Escribir todo en `remotion/src/video.tsx` (reemplazando el ejemplo). Solo se edita ese archivo.
- **Efectos especiales** (persona delante de textos o gráficas, teléfono flotante, checklist, zoom que atraviesa,
  collage de papel, portada de revista, dolly zoom…): ver `references/efectos-17.md`, con qué se arma cada uno y cuáles usar primero.

### 5. Revisar con fotogramas antes de renderizar
```
bash "$SKILL/scripts/stills.sh" "<carpeta edicion-...>" 1.0 5.5 12.3 ...
```
Un segundo en medio de cada escena (con todos los ítems visibles); leer `remotion/out/hoja.jpg`. Buscar textos
que desbordan, subtítulos tapando la cara o una tarjeta, logos mal elegidos, recortes raros. Iterar con
fotogramas (segundos) y renderizar al final (minutos).

### 6. Música
- Si la persona trae música, usar esa. Si pidió "elige tú": sugerir bibliotecas libres de derechos
  (YouTube Audio Library, Pixabay Music) o un generador de música con IA; estilo recomendado para hablar
  encima: lo-fi / electrónica suave instrumental, ~90–100 BPM, sin voces.
- Si la pista es más corta que el video, encadenarla con crossfade:
  `ffmpeg -i m.wav -i m.wav -i m.wav -filter_complex "[0][1]acrossfade=d=4[a];[a][2]acrossfade=d=4[m]" -map "[m]" musica.wav`

### 7. Render final
```
bash "$SKILL/scripts/render.sh" "<carpeta edicion-...>" "<salida>.mp4" ["<musica.wav>"] [volumen=0.16]
```
Renderiza, normaliza la voz a -14 LUFS (estándar de YouTube/Instagram), mezcla la música con ducking
(baja sola cuando se habla) y fades. Nombrar la salida con versión: `<video>-v1.mp4`, `-v2`… (ver «Versiones»).

### 8. Validar y revisar (antes de entregar)
```
"$SKILL/.venv/bin/python" "$SKILL/scripts/validar.py" "<carpeta edicion-...>" "<salida>-vN.mp4"
```
Reglas fijas → «cumple X de Y reglas (Z N/A)» en `validacion.md`, con los cuadros problemáticos marcados en
`validacion-avisos.jpg`: formato, cuadros y sincronía, −14 LUFS / −1 dBTP, negros o congelados, **el texto aprobado sin
palabras que falten ni se repitan** (usa la voz sin música, `voz_sfx.wav`), **nada sobre la boca** y **zona segura de
Reels** (arriba, abajo y la columna de botones). Si el estilo permite tapar la cara: `--permitir-cara`.
- Toda FALLA se arregla antes de entregar (máximo 2 vueltas solo; después preguntar). Los avisos se miran en la hoja
  y se descartan o se arreglan.
- Entregas finales y anuncios para pauta: lanzar además el **revisor QA** (un agente aparte que no editó el video,
  `references/revisor-qa.md`).
- Entregar el MP4 con: duración antes → después, qué escenas lleva, «cumple X de Y», lo que decidiste y lo que
  conviene revisar escuchando (no puedes oír el audio: la mezcla se controla con medidores).

---

## Reels / Shorts (9:16)

Leer `references/reels.md` y seguir ese flujo. Resumen:
1. Transcribir con `prep.py` (si ya se hizo el largo, reutilizar esa carpeta).
2. **Gancho textual en TODO reel (regla fija):** frase corta arriba que dice de qué trata el video, visible desde el
   fotograma 0 y al menos 3 s (`HookTitle`). Ver `references/gancho-textual.md`.
3. **Elegir fragmentos** que funcionen solos: gancho en los primeros 2 s, se entienden sin el resto,
   tienen desenlace. **Proponer la lista** (tabla: título, tramos, duración, gancho) y esperar el OK,
   salvo que la persona haya dicho "elige tú".
4. Cortar cada reel: `scripts/reel_prep.py` (genera `cam.mp4` vertical y `camwide.mp4` con la cara completa
   para la pantalla dividida). Luego, si va, `acelerar.py` y **siempre `texto.py reels/<n>`** (checkpoint de texto, 3b).
5. Escenas en `reels/<n>/remotion/src/video.tsx` con `DualCam` (la cara NUNCA se recorta al achicar la cámara),
   `HookTitle` al inicio, tarjetas `CARD_SPLIT`, tomas `BrollTop` y `CommentCTA` al final con la palabra de la entrevista.
   Para efectos (Checklist, Phone mockup, Cover story, Headline wall, Zoom-through cut…) ver `references/efectos-17.md`.
   **Apoyo visual obligatorio en todo reel**: lo que se dice se MUESTRA (captura real de la noticia, foto, logo, interfaz
   o toma de apoyo) y nunca pasan más de 3-4 s sin algo nuevo. Elegir nivel (con muchos efectos / intermedio / sencillo),
   piezas (`Cutaway`, `ArticleCard`, `ChatMock`, `Terminal`, `FileCard`…) y de dónde sacar material libre
   (`scripts/captura.sh`, `scripts/commons.py`): `references/apoyo-visual.md`.
6. Fotogramas → render (`render.sh`), salida en una carpeta `Reels - <video>/` → `validar.py reels/<n> <reel>-vN.mp4`
   (y revisor QA si es entrega final).

---

## Motion graphics con voz en off (sin cámara)

Leer `references/motion-graphics.md` y seguir ese flujo. Resumen:
1. Fuente: `scripts/ig_carrusel.py "<url>" <carpeta>` baja las láminas de un carrusel; **leer cada lámina**.
2. Guion = el texto de la fuente dicho en voz, sin añadir nada. Voz IA, grabada por la persona o **clonada con su permiso**
   (muestra limpia con `scripts/voz_muestra.sh`, que le quita la música; clon en Higgsfield `seed_audio` + `audio_references`).
3. `scripts/mg_prep.py voz.wav <carpeta>` → proyecto vertical con las piezas de `template-mg/` (`mograf.tsx`),
   fuentes locales y `words.ts`. Verificar las palabras técnicas (Whisper sin prompt).
4. Una escena por lámina en `src/video.tsx`: `PanelLista`, `Esquema`, `Flujo`, `Red`, `Fichas`, `Tablero`, `Tachado`, `CierreCTA`…
   Gancho visible en el fotograma 0.
5. `stills.sh` → música (`scripts/musica.py` si no hay pista) → `render.sh`.

## Anuncios o grabaciones con muchas tomas repetidas
Cuando la grabación trae la misma frase dicha varias veces, voz baja o ruido, no cortar con `cut.py`/`reel_prep.py`
(usan los tiempos por palabra, que ahí fallan). Usar `scripts/tomas.py` → elegir la última toma buena de cada frase →
`scripts/corte_audio.py` (corta por la voz, afina los bordes y verifica tramo por tramo que no falte ni se repita
ninguna palabra) → `scripts/caras.py` (para que ningún texto caiga sobre la boca) → `scripts/detras.py` (texto detrás
de la persona). Cada script explica en su cabecera cómo se usa. Después del corte, igual: `texto.py` (3b) y al final
`validar.py` (8). Los clips generados con IA también tartamudean o repiten palabras: el checkpoint de texto los atrapa.

## Versiones y correcciones
- **Nunca se pisa una entrega:** cada render nuevo es `-v2`, `-v3`… y antes de cambiar escenas se guarda
  `remotion/src/video-vN.tsx` (copia del que produjo esa versión). Así siempre se puede volver.
- **Las correcciones de la persona se guardan.** Si lo que pide vale para los próximos videos («sin barra de avance»,
  «textos detrás de la cabeza», «cortes más rápidos»), anotarlo con sus palabras y la fecha en el «Historial de
  correcciones» del estilo que se usó (`references/estilos/<id>/ESTILO.md`; plantilla en `references/estilos/_plantilla/`).
  Lo puntual de un solo video no va. El estilo gana sobre las reglas generales de esta skill cuando chocan.

## Ajustes típicos
- "Más / menos rápido" → `--gap` en `cut.py` (o `acelerar.py --factor 1.08`) y reajustar tiempos de `video.tsx` con `retime.py`.
- "Subtítulos más grandes / en otro lugar / en mayúsculas" → `Subtitles` / `SubsV` en `lib.tsx` / `reel.tsx` del proyecto.
- "Otros colores / otra tipografía" → `theme.ts` (las fuentes vienen de `@remotion/google-fonts`).
- Render que se cae con `ERR_CERT_AUTHORITY_INVALID` / "Failed to fetch" en fonts.gstatic.com (sesiones con proxy):
  bajar las fuentes a local con `scripts/fuentes.py` y cargarlas como en `template-mg/src/theme.ts`.
- "Cambia la música" → solo rehacer el paso 7.
- Si la persona re-corta el video después de editarlo, no rehacer escenas: transcribir la versión nueva y
  `python3 "$SKILL/scripts/retime.py" <words.ts viejo> <words.ts nuevo> <video.tsx viejo> <video.tsx nuevo>`.

## Licencias (decírselo a la persona si su empresa es grande)
Remotion es gratis para personas y empresas de hasta 3 empleados; empresas más grandes necesitan licencia
(remotion.dev/license). Whisper, ffmpeg y OpenCV son de código abierto.
