#!/bin/bash
# Instala las dependencias de la skill (una sola vez; es seguro volver a correrlo).
# Primera vez: 5–15 minutos (descarga Remotion, el navegador de render y el modelo de transcripción).
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
falta=0
command -v ffmpeg >/dev/null || { echo "❌ Falta ffmpeg.  Mac: brew install ffmpeg  ·  Windows: winget install ffmpeg  ·  Linux: sudo apt install ffmpeg"; falta=1; }
command -v node >/dev/null || { echo "❌ Falta Node.js 18 o superior: https://nodejs.org (versión LTS)"; falta=1; }
command -v python3 >/dev/null || { echo "❌ Falta Python 3.9 o superior: https://www.python.org/downloads/"; falta=1; }
[ $falta = 1 ] && exit 1
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' || { echo "❌ Necesitas Python 3.9 o superior"; exit 1; }
if [ ! -x "$SKILL/.venv/bin/python" ]; then
  echo "→ Creando entorno de Python…"
  python3 -m venv "$SKILL/.venv"
fi
"$SKILL/.venv/bin/python" -c "import faster_whisper, numpy, cv2" 2>/dev/null || {
  echo "→ Instalando transcripción (faster-whisper) y detección de cara (OpenCV)…"
  "$SKILL/.venv/bin/pip" install -q --upgrade pip
  "$SKILL/.venv/bin/pip" install -q faster-whisper "av<16" numpy "opencv-python-headless<5"
}
if [ ! -d "$SKILL/engine/node_modules/remotion" ]; then
  echo "→ Instalando Remotion (motor de edición)…"
  (cd "$SKILL/engine" && npm install --silent)
fi
chmod +x "$SKILL"/scripts/*.sh 2>/dev/null || true
echo "✅ Listo: dependencias instaladas"
