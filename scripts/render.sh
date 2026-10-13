#!/bin/bash
# Render final: Remotion → (música con ducking opcional) → loudnorm -14 LUFS.
# Uso: render.sh <carpeta edicion-...> "<ruta salida.mp4>" [musica.wav] [volumen_musica=0.16]
set -e
WORK="$(cd "$1" && pwd)"; OUT="$2"; MUSIC="${3:-}"; MVOL="${4:-0.16}"
cd "$WORK/remotion"
npx remotion render src/index.ts Main out/render.mp4 --crf=18 --log=error 2>&1 | grep -v "network requests" || true
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/render.mp4)
ffmpeg -v error -y -i out/render.mp4 -vn -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 "$WORK/voz_sfx.wav"
if [ -n "$MUSIC" ]; then
  FO=$(python3 -c "print(max(0,$D-1.6))")
  ffmpeg -v error -y -i "$WORK/voz_sfx.wav" -i "$MUSIC" -filter_complex \
    "[1:a]atrim=0:$D,asetpts=PTS-STARTPTS,aresample=48000,volume=$MVOL,afade=t=in:d=0.8,afade=t=out:st=$FO:d=1.6[m];[0:a]asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=400[md];[v][md]amix=inputs=2:normalize=0,alimiter=limit=0.89[out]" \
    -map "[out]" -ar 48000 "$WORK/mezcla.wav"
  A="$WORK/mezcla.wav"
else
  A="$WORK/voz_sfx.wav"
fi
ffmpeg -v error -y -i out/render.mp4 -i "$A" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
echo "Listo: $OUT ($(printf %.1f $D)s)"
ffmpeg -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" || true
