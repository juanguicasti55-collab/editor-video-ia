#!/bin/bash
# Muestra limpia de una voz para CLONARLA (con permiso de la persona): saca el audio de un video, le quita la
# música de fondo con Demucs y lo normaliza. Los reels casi siempre traen música debajo; sin quitarla, el clon
# copia la música. Prueba rápida: si `silencedetect=n=-40dB` no encuentra ni un silencio, hay música.
# Uso: voz_muestra.sh <video o audio> <salida.mp3> [inicio_s] [duración_s]
# Ideal: 20-60 s de la persona hablando sola, sin otra voz. La primera vez instala Demucs (~1 GB, CPU).
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"; IN="$1"; OUT="$2"; SS="${3:-0}"; DUR="${4:-60}"
V="$SKILL/.venv-demucs"
if [ ! -x "$V/bin/python" ]; then
  echo "→ Instalando Demucs (una sola vez)…"
  python3 -m venv "$V"
  "$V/bin/pip" install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  "$V/bin/pip" install -q demucs soundfile
fi
TMP="$(mktemp -d)"
ffmpeg -v error -y -ss "$SS" -t "$DUR" -i "$IN" -vn -ac 2 -ar 44100 "$TMP/in.wav"
"$V/bin/python" -m demucs --two-stems=vocals -n htdemucs -o "$TMP/sep" "$TMP/in.wav" >/dev/null 2>&1
ffmpeg -v error -y -i "$TMP/sep/htdemucs/in/vocals.wav" -af "highpass=f=80,loudnorm=I=-18" -ac 1 -ar 44100 -b:a 192k "$OUT"
echo "Listo: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" | cut -c1-5) s)"
echo "Verifica que sea solo esa voz: \"$SKILL/.venv/bin/python\" -c \"from faster_whisper import WhisperModel as M; print(' '.join(s.text for s in M('small',compute_type='int8').transcribe('$OUT',language='es')[0]))\""
rm -rf "$TMP"
