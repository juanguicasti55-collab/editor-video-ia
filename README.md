# Editor de video con IA (skill para Claude)

Skill de Claude que edita videos grabados a cámara: corta pausas y tomas repetidas, pone subtítulos palabra por palabra, tarjetas animadas, zooms y música, y saca reels verticales del mismo material. También arma videos de motion graphics con voz en off a partir de un carrusel o un guion. Se usa hablándole a Claude: le dices qué video editar y él te hace unas preguntas antes de empezar.

La armó **Juan González** y la usa para editar sus propios videos. Aquí la explica en video: https://youtu.be/mpx_eZ0sHls

## Qué necesitas
- Claude (la app de escritorio o Claude Code) con skills activadas.
- Un computador con **ffmpeg**, **Node.js 18+** y **Python 3.9+**.
- Espacio: la primera vez descarga el modelo de transcripción (~1,5 GB).
- Solo para motion graphics: `yt-dlp` si vas a bajar un carrusel de Instagram (`pip install yt-dlp`); para clonar una voz, Demucs se instala solo la primera vez (~1 GB).

## Instalar
1. Copia la carpeta `editor-video-ia` dentro de la carpeta de skills de Claude (en Mac: `~/.claude/skills/`).
2. En la terminal: `bash ~/.claude/skills/editor-video-ia/scripts/setup.sh` (instala lo que falte; la primera vez tarda).
3. Abre Claude y escribe algo como: *«Usa la skill editor-video-ia para editar el video que está en mi carpeta Videos»*.

## Qué trae
- `SKILL.md`: las instrucciones que sigue Claude (entrevista inicial, cortes, escenas, render).
- `scripts/`: transcripción, cortes, recorte de la persona, render y mezcla de audio. Además:
  - `texto.py`: **checkpoint de texto** antes de editar: el guion que va a quedar y una segunda lectura con otro modelo
    que marca palabras repetidas, tartamudeos y palabras comidas en un corte.
  - `validar.py`: **validador con reglas fijas** sobre el video final («cumple X de Y reglas»): formato, sincronía,
    −14 LUFS, negros o congelados, el texto aprobado sin palabras de más ni de menos, nada sobre la boca y zona segura de Reels.
  - `acelerar.py`: acelera la toma ×1,05–1,15 sin cambiar el tono de la voz.
- `references/revisor-qa.md`: el revisor de calidad, un agente aparte que mira el video antes de entregarlo.
- `references/estilos/_plantilla/`: plantilla de estilo con historial de correcciones (lo que pides se queda para el próximo video).
- `template/` y `template-reel/`: plantillas de video largo y de reel (Remotion).
- `template-mg/`: piezas de motion graphics para videos sin cámara (gráficos + voz en off), por ejemplo a partir de un carrusel.
- `references/`: catálogo de piezas, reglas de ritmo, ejemplos y un kit para videos largos de YouTube.
- `assets/logos`: logos de herramientas para mostrar cuando se nombran.

## Qué NO trae
- **Música.** Usa la tuya (libre de derechos) o pide a Claude que te sugiera bibliotecas gratuitas.
- Videos de otros creadores ni material de clientes.

## Licencias de lo que usa
- **Remotion** (motor de edición): gratis para personas y empresas de hasta 3 empleados; las más grandes necesitan licencia (remotion.dev/license).
- Whisper, ffmpeg y OpenCV son de código abierto.
- Los logos de herramientas pertenecen a sus dueños y se usan solo para nombrarlas.

## Antes de publicar un video editado
- Si usas fragmentos de material de otra persona, deja el crédito en pantalla.
- Revisa el resultado completo: la skill te ayuda, pero tú firmas el video.

## Créditos
El checkpoint de texto, el validador con reglas fijas, el revisor aparte, la aceleración sin cambio de tono y el historial
de correcciones se inspiran en [video-editor-architect](https://github.com/Hainrixz/video-editor-architect) de
Enrique Rocha (MIT). El código de esta skill es propio.

## Licencia
MIT (archivo `LICENSE`): úsala, cámbiala y compártela. Los logos y el motor Remotion tienen sus propias licencias, arriba.

Hecha con Claude. Sin garantía.
