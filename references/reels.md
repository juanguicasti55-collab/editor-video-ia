# Reels verticales (Instagram / Shorts) desde un video largo

Uso típico: de cada video largo sacar reels de **30–60 s** para promocionarlo.
CTA: **"Comenta PALABRA y te envío…"** con la palabra y el regalo que la persona definió en la entrevista
(queda en `theme.ts` → `MARCA.ctaPalabra` / `MARCA.ctaTexto`). Recordarle que configure su respuesta automática
de Instagram (ManyChat u otra) para esa palabra.

## Flujo

1. **Transcribir el video largo** con `prep.py` (20 min tarda ~10–15 min: correrlo en segundo plano).
2. **Elegir fragmentos** leyendo `transcript.txt` completo. Un buen reel:
   - arranca con un gancho en los primeros 2 s (una afirmación fuerte, un mito, una pregunta, "no lo he probado");
   - se entiende sin el resto del video (nada de "como les decía", "este formulario de aquí");
   - tiene desenlace (resultado, dato, "funcionó") antes del CTA;
   - puede unir 2–5 tramos no contiguos si mantienen el hilo.
   Descartar autopromoción o explicaciones técnicas largas salvo que la persona las pida.
   **Proponer la lista antes de editar** (tabla: título, tramos, duración, gancho).
3. **Medir la grabación**. Si es a cámara completa, no hace falta: `reel_prep.py` detecta la cara.
   Si es grabación de pantalla con la cámara en un recuadro (Screen Studio, Loom…), medir el recuadro de la
   cámara y la zona de pantalla con un fotograma con grilla
   (`ffmpeg -ss 10 -i video.mp4 -frames:v 1 -vf "scale=1280:720,drawgrid=w=64:h=36" grilla.jpg`) y pasar
   `--cam W:H:X:Y --screen W:H:X:Y` en píxeles del original.
   Si el primer tramo es una intro ya editada en horizontal, usar la **toma cruda** (`--source` + `--words`).
4. **Cortar cada reel**:
   `$SKILL/.venv/bin/python $SKILL/scripts/reel_prep.py "<carpeta>" <n-nombre> --segments "a-b,c-d" --cam W:H:X:Y --screen W:H:X:Y`
   Sin `--cam` detecta la cara (grabaciones a cámara completa). Ojo: en zsh, no meter el comando en una
   variable (no separa palabras) — escribir un .sh con una función.
   Revisar el texto que imprime: palabras cortadas en los bordes, muletillas ("y vamos a ponerle aquí") →
   ajustar tramos con `words.json` (tiempos por palabra).
5. **Escenas** en `reels/<n>/remotion/src/video.tsx` (ver ejemplos en `references/reels/`):
   - `ejemplo-solo-camara.tsx` — solo cámara + tarjetas (intro).
   - `ejemplo-pantalla.tsx` — demo en pantalla con zooms (`ScreenV`) + insignias.
   - `ejemplo-tarjetas.tsx` — charla sin demo: tarjetas, PromptCard, Stats.
6. **Fotogramas** con `stills.sh` y armar tira: `ffmpeg -pattern_type glob -i 'stills/*.jpg' -filter_complex "scale=300:-2,tile=6x1"`.
7. **Render** con `render.sh` (misma música; el reel dura habla + `CTA_SECONDS`). Salida en
   `<carpeta del video>/Reels - <video>/Reel N - <título>.mp4`.

## Reglas de diseño vertical (aprendidas)

- **Zonas seguras**: Instagram tapa arriba ~220 px y abajo ~330 px. Texto entre y=220 y y=1590.
- **Estructura**: arriba pantalla o tarjeta (`SCR_TOP` / `ZONA_TARJETA`), en el medio subtítulos (automáticos
  según el encuadre, `subsY`), abajo la cámara (`CAM_BOTTOM`). Cámara completa (`CAM_FULL`) solo para
  frases de énfasis sin nada arriba.
- **Cámara del recuadro de Screen Studio**: viene muy cerrada (la cara ocupa casi todo). Con `CAM_FULL` el
  gancho le tapa los ojos → en esos reels **empezar en `CAM_BOTTOM` con `HookTitle` arriba**. `fy` 36 para
  que no se corte ni la frente ni la boca. En la toma cruda a cámara completa sí funciona empezar en `CAM_FULL`.
- **Tarjetas**: `ZONA_TARJETA` ya trae zoom 1.08. Tienen que terminar antes de y≈930 → máx. 3 filas con
  título, o 4 filas sin título. Stats de texto largo ("1 semana") con `fontSize` 56.
- **Pantalla**: `ScreenV` con `cx/cy/zoom` por tramo. Zoom 1.5–2.4 sobre la zona que la persona está mirando
  (formulario, prompt, dato que confirma el resultado). Para elegir cx/cy: hoja de `screen.mp4` cada 4 s
  con timecode (`drawtext=text='%{pts\:hms}'`) y, si hace falta, un fotograma con grilla.
- **Insignias** (`ToolBadgeV`) arriba para herramientas (logo) y para rotular el momento ("Reunión agendada",
  "¡Funcionó!"). Si hay `HookTitle`, que no se superpongan en el tiempo.
- **CTA** `CommentCTA` al final, 3,4 s, con `whoosh` + `ding`.

## Reels con tomas de apoyo (b-roll)
- `BrollTop list={[{from,to,src,start?,tag?}]}` (en `reel.tsx`) pone un clip horizontal en la zona de arriba
  (y 230–970) con la cámara en `CAM_BOTTOM`. Va en `Main` antes de `CamV`. Copiar los clips a `public/broll/`.
- Si la persona ya hizo los cortes del largo, cortar los reels de SU versión (`--gap 0.6` para no recortar de más).
- Grabación a cámara completa (no Screen Studio): `CAM_FULL` con `HookTitle` arriba funciona (el texto queda sobre la frente, no tapa los ojos).
- Correcciones de subtítulos del video: correr el mismo fix de palabras sobre cada `words.ts` del reel.

## Cara completa en pantalla dividida
Al achicar la cámara vertical a un recuadro apaisado (`CAM_BOTTOM`) se corta la frente y el mentón y se ve mal.
En grabaciones a cámara completa usar `DualCam` + `subsYDual` + `CARD_SPLIT` (en `reel.tsx`):
- `reel_prep.py` genera solo `public/camwide.mp4` (recorte horizontal del original alrededor de la cara,
  1620x1140). Revisarlo con un fotograma: que entren cabeza y mentón. Si no, pasar `--wide W:H:X:Y`.
- En `CAM`, cualquier caja con alto < 1500 (p. ej. `CAM_BOTTOM`) pasa a modo "split": la cámara completa se
  desvanece y el cuadro ancho sube desde abajo (y 862–1580). Contenido arriba: b-roll (y 230–838) o tarjetas `CARD_SPLIT`.
- Subtítulos: 1480 con cámara completa, 1540 en split (debajo del mentón).
