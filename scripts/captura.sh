#!/bin/bash
# Captura REAL de una noticia o página web (Chrome sin ventana), lista para usar como tarjeta en el video.
# Uso: captura.sh "<url>" <salida.png> [ancho=1080] [alto=1600]
# Si la página pone un aviso de cookies que oscurece todo, la captura sale gris: aclárala con
#   python3 -c "from PIL import Image; im=Image.open('x.png').convert('RGB'); im.point(lambda v:min(255,int(v*2))).save('x.png')"
# y recorta solo el titular y la fecha (PIL .crop). Nunca escribir un titular a mano: siempre la captura de verdad.
set -e
URL="$1"; OUT="$2"; W="${3:-1080}"; H="${4:-1600}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || CHROME="$(command -v google-chrome || command -v chromium || true)"
[ -n "$CHROME" ] || { echo "Falta Google Chrome"; exit 1; }
PROF="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$PROF" --hide-scrollbars \
  --window-size="$W,$H" --virtual-time-budget=8000 --screenshot="$OUT" "$URL" >/dev/null 2>&1 || true
rm -rf "$PROF"
[ -s "$OUT" ] && echo "$OUT" || { echo "NO_CAPTURA"; exit 1; }
