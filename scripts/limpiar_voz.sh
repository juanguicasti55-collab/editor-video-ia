#!/bin/bash
# Limpia la voz de la toma ya cortada (ruido de fondo, retumbe grave, eses que silban) sin tocar el video.
# Uso: limpiar_voz.sh <carpeta del reel o edicion-...> [suave|fuerte]   (por defecto suave)
# Guarda la toma original como cam_sucio.mp4 / cut_sucio.mp4 para poder volver. Correr antes de render.sh.
# suave = para celular en sala tranquila · fuerte = aire acondicionado, calle o eco (puede sonar un poco «enlatado»).
# Escuchar antes y después: no se puede juzgar con medidores, la persona tiene que oírlo.
set -e
W="$(cd "$1" && pwd)"; NIVEL="${2:-suave}"
R="$W/remotion/public"; [ -d "$R" ] || R="$W/public"
F="$R/cam.mp4"; [ -f "$F" ] || F="$R/cut.mp4"
[ -f "$F" ] || { echo "No encuentro cam.mp4 ni cut.mp4 en $R"; exit 1; }
SUCIO="${F%.mp4}_sucio.mp4"; [ -f "$SUCIO" ] || cp "$F" "$SUCIO"
if [ "$NIVEL" = fuerte ]; then AF="highpass=f=90,afftdn=nf=-20:tn=1,deesser=i=0.4,agate=threshold=0.015:ratio=2:release=250"
else AF="highpass=f=80,afftdn=nf=-25:tn=1,deesser=i=0.25"; fi
ffmpeg -v error -y -i "$SUCIO" -map 0:v -map 0:a -c:v copy -af "$AF" -c:a aac -b:a 192k "$F"
echo "Voz limpia ($NIVEL): $F  · original en $SUCIO"
