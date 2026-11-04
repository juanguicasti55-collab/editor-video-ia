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
5. **Escenas** en `reels/<n>/remotion/src/video.tsx`. La plantilla arranca sin estilo (cámara completa, gancho,
   subtítulos y cierre); encima van solo los efectos que la persona eligió en `menu-efectos.md`, copiando sus piezas
   (`fx-efectos.tsx` → `src/fx.tsx`, `mg.tsx` → `src/mg.tsx`, `fx-documental.tsx` → `src/doc.tsx`, `fx-apoyo-visual.tsx`
   → `src/apoyo.tsx`). Lo que va detrás de la persona: antes `scripts/mascaras.py` (con `--con-pelo` si tiene pelo).
6. **Fotogramas** con `stills.sh` y armar tira: `ffmpeg -pattern_type glob -i 'stills/*.jpg' -filter_complex "scale=300:-2,tile=6x1"`.
7. **Render** con `render.sh` (misma música; el reel dura habla + `CTA_SECONDS`). Salida en
   `<carpeta del video>/Reels - <video>/Reel N - <título>.mp4`.

## Reglas de diseño vertical (aprendidas)

- **Gancho textual obligatorio**: título corto arriba desde el fotograma 0 hasta el segundo 3 como mínimo
  (`HookTitle`, ver `gancho-textual.md`). Ningún reel sale sin él.

- **Zonas seguras**: Instagram tapa arriba ~220 px y abajo ~330 px. Texto entre y=220 y y=1590.
- **Estructura**: cámara completa (`CAM_FULL`) con los efectos encima. Si es grabación de pantalla, la pantalla va arriba
  (`SCR_TOP` con `ScreenV`) y la cámara abajo (`CAM_BOTTOM`), con los subtítulos entre las dos (`subsY`).
- **Cámara del recuadro de Screen Studio**: viene muy cerrada (la cara ocupa casi todo). Con `CAM_FULL` el
  gancho le tapa los ojos → en esos reels **empezar en `CAM_BOTTOM` con `HookTitle` arriba**. `fy` 36 para
  que no se corte ni la frente ni la boca. En la toma cruda a cámara completa sí funciona empezar en `CAM_FULL`.
- **Pantalla**: `ScreenV` con `cx/cy/zoom` por tramo. Zoom 1.5–2.4 sobre la zona que la persona está mirando
  (formulario, prompt, dato que confirma el resultado). Para elegir cx/cy: hoja de `screen.mp4` cada 4 s
  con timecode (`drawtext=text='%{pts\:hms}'`) y, si hace falta, un fotograma con grilla.
- **Herramientas nombradas**: su logo oficial (`scripts/logo.py`) con `AppIcon` o `ChatMock` de `fx-apoyo-visual.tsx`.
  Si hay `HookTitle`, que no se superpongan en el tiempo.
- **CTA** `CommentCTA` al final, 3,4 s, con `whoosh` + `ding`. Si es anuncio para pauta: cierre con botón y sin palabra
  (`TapButton` / `EndCard` de `mg.tsx`, o `CierreDoc` en el look documental).

## Reels con tomas de apoyo (b-roll)
- `Cutaway` (corte a pantalla completa mientras la voz sigue) o `Broll` / `Float` de `mg.tsx` (clip en tarjeta).
  Copiar los clips a `public/broll/`. Ver `apoyo-visual.md`.
- Si la persona ya hizo los cortes del largo, cortar los reels de SU versión (`--gap 0.6` para no recortar de más).
- Grabación a cámara completa (no Screen Studio): `CAM_FULL` con `HookTitle` arriba funciona (el texto queda sobre la frente, no tapa los ojos).
- Correcciones de subtítulos del video: correr el mismo fix de palabras sobre cada `words.ts` del reel.
