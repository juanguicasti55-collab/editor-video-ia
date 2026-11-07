#!/bin/bash
# Versiones del mismo anuncio para probar en pauta (references/variantes.md): renderiza una por letra.
# Uso: variantes.sh <carpeta del reel> "<salida base>" "A B C" [musica.wav] [volumen=0.16]
#   → <salida base>-A.mp4, -B.mp4, -C.mp4. video.tsx tiene que leer la prop `variante` en Main.
# Después: validar.py <reel> <salida base>-A.mp4 (y las demás).
set -e
W="$1"; BASE="$2"; LETRAS="$3"; MUSIC="${4:-}"; MVOL="${5:-0.16}"
[ -z "$LETRAS" ] && { echo "Faltan las letras: \"A B C\""; exit 1; }
# Rutas absolutas: render.sh cambia de carpeta y una ruta relativa de música o salida falla.
abs() { (cd "$(dirname "$1")" && echo "$(pwd)/$(basename "$1")"); }
W="$(abs "$W")"; BASE="$(abs "$BASE")"
if [ -n "$MUSIC" ]; then [ -f "$MUSIC" ] || { echo "No existe la música: $MUSIC"; exit 1; }; MUSIC="$(abs "$MUSIC")"; fi
for v in $LETRAS; do
  echo "== Versión $v"
  if [ -n "$MUSIC" ]; then VARIANTE="$v" bash "$(dirname "$0")/render.sh" "$W" "$BASE-$v.mp4" "$MUSIC" "$MVOL"
  else VARIANTE="$v" bash "$(dirname "$0")/render.sh" "$W" "$BASE-$v.mp4"; fi
  [ -s "$BASE-$v.mp4" ] || { echo "No salió $BASE-$v.mp4"; exit 1; }
done
