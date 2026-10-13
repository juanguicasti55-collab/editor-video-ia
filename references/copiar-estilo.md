# Copiar el estilo de otro creador

Objetivo: que el video "se sienta" como el del creador de referencia (ritmo, subtítulos, colores, tipo de
gráficos), **sin copiar su contenido, su marca ni su material**. El estilo se inspira; los logos, nombres,
música y clips de otra persona no se usan.

## 1. Conseguir la referencia
- **Capturas** (lo más simple): pedir 3–5 capturas de distintos momentos de sus videos (con subtítulos,
  con gráficos, con la cámara chica si la usa). Leerlas directamente.
- **Link a un video**: pedir permiso para descargar SOLO un tramo corto y en baja calidad, únicamente para
  analizarlo (no se usa en la edición):
  ```
  yt-dlp -f "bv*[height<=480]" --download-sections "*00:00-01:30" -o ref.mp4 "<link>"
  ```
  (Si `yt-dlp` no está instalado: `pip install yt-dlp` en el venv de la skill, o pedir capturas.)
  Luego:
  ```
  # hoja de fotogramas: uno cada 3 s, con tiempo
  ffmpeg -i ref.mp4 -vf "fps=1/3,scale=480:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black,tile=5x6" -frames:v 1 hoja-ref.jpg
  # ritmo: cuántos cortes de cámara hay
  ffmpeg -i ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -c pts_time
  ```
  Cortes por minuto = cortes ÷ minutos analizados.

## 2. Qué mirar y cómo traducirlo a la skill

| Qué mirar en la referencia | Dónde se ajusta |
|---|---|
| **Ritmo** (cortes por minuto; > 25 = muy ágil) | `cut.py --gap` (0.2 muy ágil · 0.28 normal · 0.4 respirado) y cantidad de zooms (`punch`) |
| **Subtítulos**: posición (abajo / centro), tamaño, mayúsculas, color de la palabra clave, fondo (caja, borde, sombra), cuántas palabras por bloque | `Subtitles` (lib.tsx) / `SubsV` (reel.tsx): `bottom`, `fontSize`, `textTransform`, color `C.lime`, `background`. Palabras por bloque: `buildChunks` |
| **Paleta**: color de fondo de los gráficos, 1–2 colores de acento | `theme.ts` → `C.bg`, `C.card`, `C.lime` (acento 1), `C.violet` (acento 2) |
| **Tipografía**: condensada/gruesa, redondeada, serif | `theme.ts` → cambiar las fuentes de `@remotion/google-fonts` (ej. Anton, Bebas Neue, Montserrat, Poppins, Inter) |
| **Gráficos**: tarjetas, listas, números grandes, emojis, flechas, capturas de pantalla | Elegir las piezas equivalentes de `references/estilo.md`; usar más las que la referencia usa más |
| **Encuadres**: ¿cámara chica en una esquina? ¿pantalla dividida? ¿siempre cámara completa con zooms? | `KEYS` en `video.tsx` (PIP / SPLIT / punch) o `CAM` en reels (`DualCam`) |
| **Zooms**: suaves y lentos o cortes secos de acercamiento | `punch(1.1–1.2)` en las frases de énfasis |
| **Sonido**: whooshes en cada transición, pops, música presente o casi inaudible | lista `SFX` y volumen de música en `render.sh` (0.10 baja · 0.16 normal · 0.22 presente) |
| **Gancho inicial**: título grande arriba, pregunta, número | `HookTitle` (reels) / `Quote` o `LowerThird` (largo) |

## 3. Confirmar antes de editar
Mostrar a la persona un resumen corto del estilo detectado, por ejemplo:

> Del estilo de la referencia voy a tomar: cortes muy rápidos (~30 por minuto), subtítulos en MAYÚSCULAS
> al centro con la palabra clave en amarillo, zoom en cada remate, tarjetas blancas con texto negro y
> whoosh en cada transición. Tus colores: amarillo #FFD400 y negro. ¿Lo hago así?

Después aplicar los cambios en `theme.ts` / `lib.tsx` **del proyecto** (no de la plantilla), salvo que la
persona quiera dejar ese estilo como su estilo por defecto: en ese caso copiarlos también a
`template/src` y `template-reel/src` de la skill.

## Límites
- No usar logos, nombres, frases de marca, música ni clips del creador de referencia.
- Si la persona pide "que sea idéntico", explicar que se copia el lenguaje visual (ritmo, tipografía,
  colores, tipo de gráficos), no la identidad de otra persona.
