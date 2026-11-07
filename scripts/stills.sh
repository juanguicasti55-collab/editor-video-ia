#!/bin/bash
# Renderiza fotogramas de control en los segundos indicados y arma una hoja 2 columnas.
# Uso: stills.sh <carpeta edicion-...> 1.0 5.5 12.5 ...
# VARIANTE=B stills.sh … muestra esa versión (references/variantes.md).
# Empaqueta el proyecto UNA vez (out/build) y saca todos los fotogramas de ese paquete: antes se empaquetaba por fotograma.
set -e
WORK="$(cd "$1" && pwd)"; shift
cd "$WORK/remotion"; mkdir -p out/stills; rm -f out/stills/*.jpg
PROPS=(); [ -n "${VARIANTE:-}" ] && PROPS=(--props "{\"variante\":\"$VARIANTE\"}")
npx remotion bundle src/index.ts --out-dir out/build --log=error 2>&1 | grep -v "network requests" || true
i=0
for s in "$@"; do
  i=$((i+1)); f=$(python3 -c "print(int(float('$s')*30))")
  npx remotion still out/build Main "out/stills/$(printf %02d $i)_$s.jpg" "${PROPS[@]}" --frame=$f --scale=0.5 --log=error 2>&1 | grep -v "network requests" || true
done
rows=$(( (i+1)/2 ))
ffmpeg -v error -y -pattern_type glob -i 'out/stills/*.jpg' -filter_complex "tile=2x$rows" out/hoja.jpg
echo "$WORK/remotion/out/hoja.jpg"
