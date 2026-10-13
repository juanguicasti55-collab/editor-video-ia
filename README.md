# Editor de video con IA (skill para Claude)

Skill de Claude que edita videos grabados a cámara: corta pausas y tomas repetidas, pone subtítulos palabra por palabra, tarjetas animadas, zooms y música, y saca reels verticales del mismo material. Se usa hablándole a Claude: le dices qué video editar y él te hace unas preguntas antes de empezar.

La armó **Juan González** y la usa para editar sus propios videos. Aquí la explica en video: *(enlace del video 1 de su canal)*.

## Qué necesitas
- Claude (la app de escritorio o Claude Code) con skills activadas.
- Un computador con **ffmpeg**, **Node.js 18+** y **Python 3.9+**.
- Espacio: la primera vez descarga el modelo de transcripción (~1,5 GB).

## Instalar
1. Copia la carpeta `editor-video-ia` dentro de la carpeta de skills de Claude (en Mac: `~/.claude/skills/`).
2. En la terminal: `bash ~/.claude/skills/editor-video-ia/scripts/setup.sh` (instala lo que falte; la primera vez tarda).
3. Abre Claude y escribe algo como: *«Usa la skill editor-video-ia para editar el video que está en mi carpeta Videos»*.

## Qué trae
- `SKILL.md`: las instrucciones que sigue Claude (entrevista inicial, cortes, escenas, render).
- `scripts/`: transcripción, cortes, recorte de la persona, render y mezcla de audio.
- `template/` y `template-reel/`: plantillas de video largo y de reel (Remotion).
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

## Licencia
MIT (archivo `LICENSE`): úsala, cámbiala y compártela. Los logos y el motor Remotion tienen sus propias licencias, arriba.

Hecha con Claude. Sin garantía.
