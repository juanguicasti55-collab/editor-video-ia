#!/bin/bash
# Render final: Remotion → (música con ducking opcional) → loudnorm -14 LUFS → 2ª pasada que mide y corrige a −14 LUFS / −1,5 dBTP.
# Uso: render.sh <carpeta edicion-...> "<ruta salida.mp4>" [musica.wav] [volumen_musica=0.16]
set -e
WORK="$(cd "$1" && pwd)"; OUT="$2"; MUSIC="${3:-}"; MVOL="${4:-0.16}"
cd "$WORK/remotion"
npx remotion render src/index.ts Main out/render.mp4 --crf=18 --log=error 2>&1 | grep -v "network requests" || true
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/render.mp4)
ffmpeg -v error -y -i out/render.mp4 -vn -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 "$WORK/voz_sfx.wav"
# Último paso antes del AAC, que sube los picos: −2,4 dBFS dejan el resultado por debajo de −1 dBTP.
# level=false es obligatorio: por defecto alimiter vuelve a subir la señal hasta 0 dB y el límite no sirve.
LIM="alimiter=limit=0.76:attack=2:release=60:level=false"
if [ -n "$MUSIC" ]; then
  FO=$(python3 -c "print(max(0,$D-1.6))")
  ffmpeg -v error -y -i "$WORK/voz_sfx.wav" -i "$MUSIC" -filter_complex \
    "[1:a]atrim=0:$D,asetpts=PTS-STARTPTS,aresample=48000,volume=$MVOL,afade=t=in:d=0.8,afade=t=out:st=$FO:d=1.6[m];[0:a]asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=400[md];[v][md]amix=inputs=2:normalize=0,$LIM[out]" \
    -map "[out]" -ar 48000 "$WORK/mezcla.wav"
else
  ffmpeg -v error -y -i "$WORK/voz_sfx.wav" -af "$LIM" -ar 48000 "$WORK/mezcla.wav"
fi
mux() { ffmpeg -v error -y -i out/render.mp4 -i "$1" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$OUT"; }
mide() { ffmpeg -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | awk '/^ +I:/{i=$2} /^ +Peak:/{p=$2} END{print i, p}'; }
mux "$WORK/mezcla.wav"

# 2ª pasada. El loudnorm de arriba es de una sola pasada: cuando una fuente suena mucho más fuerte que la otra
# (un clip de YouTube unido a la voz) deja el total en −16,5 o −17,4 LUFS. Aquí se mide el MP4 ya en AAC y se corrige
# con ganancia fija + limitador de pico real (sobremuestreado a 192 kHz) hasta quedar en −14 ±0,3 LUFS y ≤ −1,5 dBTP.
read -r I TP < <(mide)
G=0; L=0.79   # techo de −2 dBFS: el AAC sube los picos unas décimas
for k in 1 2 3 4; do
  OK=$(python3 -c "print(int(abs($I+14)<=0.3 and $TP<=-1.5))" 2>/dev/null || echo 1)
  [ "$OK" = 1 ] && break
  read -r G L < <(python3 -c "
G, L, I, TP = $G, $L, $I, $TP
G += -14 - I
if TP > -1.5: L *= 10 ** ((-1.5 - TP - 0.2) / 20)
print(round(G, 2), round(L, 4))")
  echo "Sonoridad ${I} LUFS / ${TP} dBTP → ganancia ${G} dB, techo $(python3 -c "import math;print(round(20*math.log10($L),1))") dBFS"
  ffmpeg -v error -y -i "$WORK/mezcla.wav" -af "volume=${G}dB,aresample=192000,alimiter=limit=$L:attack=1:release=50:level=false,aresample=48000" \
    -ar 48000 "$WORK/mezcla_final.wav"
  mux "$WORK/mezcla_final.wav"
  read -r I TP < <(mide)
done
echo "Listo: $OUT ($(printf %.1f $D)s)"
echo "    I: $I LUFS    Peak: $TP dBTP"
python3 -c "import sys; sys.exit(0 if abs($I+14)<=0.5 and $TP<=-1.5 else 1)" 2>/dev/null || echo "AVISO: la sonoridad quedó fuera de −14 LUFS / −1,5 dBTP; revisar la mezcla."
