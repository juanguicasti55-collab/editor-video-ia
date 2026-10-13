#!/bin/bash
# Renderiza fotogramas de control en los segundos indicados y arma una hoja 2 columnas.
# Uso: stills.sh <carpeta edicion-...> 1.0 5.5 12.5 ...
set -e
WORK="$(cd "$1" && pwd)"; shift
cd "$WORK/remotion"; mkdir -p out/stills; rm -f out/stills/*.jpg
i=0
for s in "$@"; do
  i=$((i+1)); f=$(python3 -c "print(int(float('$s')*30))")
  npx remotion still src/index.ts Main "out/stills/$(printf %02d $i)_$s.jpg" --frame=$f --scale=0.5 --log=error 2>&1 | grep -v "network requests" || true
done
rows=$(( (i+1)/2 ))
ffmpeg -v error -y -pattern_type glob -i 'out/stills/*.jpg' -filter_complex "tile=2x$rows" out/hoja.jpg
echo "$WORK/remotion/out/hoja.jpg"
