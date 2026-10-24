#!/usr/bin/env python3
"""Motion graphics (sin cámara): crea el proyecto a partir de la VOZ EN OFF ya grabada o generada.
Uso: mg_prep.py "<voz.wav|.mp3>" "<carpeta del proyecto>" [--model medium] [--lang es]

Crea <carpeta>/remotion (plantilla vertical template-reel + piezas de template-mg), copia la voz a
public/voz.wav, baja las fuentes a local (fuentes.py) y transcribe con tiempos por palabra →
src/words.ts, words.json y transcript.txt (con los tiempos que se usan en video.tsx).

OJO: NO se le pasa initial_prompt a Whisper. Con un prompt que traía "asimétrico", Whisper oyó "asimétrico"
donde la voz decía "simétrico". Si una palabra técnica sale rara, verificarla con oye.py (sin prompt) y
corregirla a mano en words.json/words.ts."""
import argparse, json, shutil, subprocess, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("voz"); ap.add_argument("carpeta")
ap.add_argument("--model", default="medium"); ap.add_argument("--lang", default="es")
a = ap.parse_args()

voz = Path(a.voz).expanduser().resolve()
work = Path(a.carpeta).expanduser().resolve(); work.mkdir(parents=True, exist_ok=True)
rem = work / "remotion"
if not rem.exists():
    shutil.copytree(SKILL / "template-reel", rem)
    for f in (SKILL / "template-mg" / "src").iterdir():
        shutil.copy(f, rem / "src" / f.name)
    (rem / "public" / "img").mkdir(parents=True, exist_ok=True)
if not (rem / "node_modules").exists():
    (rem / "node_modules").symlink_to(SKILL / "engine" / "node_modules")

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(voz), "-ar", "48000", str(rem / "public" / "voz.wav")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(voz), "-ac", "1", "-ar", "16000", str(work / "audio16k.wav")], check=True)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(voz)],
                           capture_output=True, text=True, check=True).stdout)
subprocess.run([sys.executable, str(SKILL / "scripts" / "fuentes.py"), str(rem)], check=True)

from faster_whisper import WhisperModel
m = WhisperModel(a.model, device="cpu", compute_type="int8")
segs, _ = m.transcribe(str(work / "audio16k.wav"), language=a.lang, word_timestamps=True)
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
(work / "words.json").write_text(json.dumps(words, ensure_ascii=False, indent=0))
(work / "transcript.txt").write_text("\n".join(lines))
(rem / "src" / "words.ts").write_text(
    f"export const DURATION = {dur + 0.05:.2f};\nexport const HAS_SCREEN = false;\nexport const SCREEN_H = 1200;\n"
    f"export const WORDS: {{ w: string; s: number; e: number }}[] = {json.dumps(words, ensure_ascii=False)};\n")
print("\n".join(lines))
print("\nTiempos por palabra:\n" + " ".join(f"{w['w']}@{w['s']}" for w in words))
print(f"\nListo ({dur:.1f} s). Siguiente: imágenes a {rem}/public/img, escenas en {rem}/src/video.tsx, luego stills.sh y render.sh.")
