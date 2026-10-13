#!/usr/bin/env python3
"""Lista de tomas reales: detecta la voz (Silero), agrupa por pausas y transcribe cada grupo por separado.
Más fiable que transcript.txt cuando hay muchas repeticiones o ruido (Whisper inventa o junta frases).
Uso: tomas.py <carpeta edicion-...> [desde] [hasta] [pausa=0.7]  → escribe tomas.txt y lo imprime."""
import sys
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from faster_whisper.vad import VadOptions, get_speech_timestamps
work = Path(sys.argv[1]); a = decode_audio(str(work / "audio16k.wav"), sampling_rate=16000)
lo = float(sys.argv[2]) if len(sys.argv) > 2 else 0; hi = float(sys.argv[3]) if len(sys.argv) > 3 else len(a) / 16000
gap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.7
ts = get_speech_timestamps(a, VadOptions(threshold=0.45, min_silence_duration_ms=160, speech_pad_ms=0, min_speech_duration_ms=80))
iv = [(t["start"] / 16000, t["end"] / 16000) for t in ts]
groups = []
for s, e in iv:
    if e < lo or s > hi: continue
    if groups and s - groups[-1][-1][1] < gap: groups[-1].append((s, e))
    else: groups.append([(s, e)])
m = WhisperModel("medium", device="cpu", compute_type="int8")
out = []
for g in groups:
    s, e = g[0][0], g[-1][1]
    if e - s < 0.35: continue
    segs, _ = m.transcribe(a[int(max(0, s - 0.25) * 16000):int((e + 0.3) * 16000)], language="es", condition_on_previous_text=False)
    txt = " ".join(x.text.strip() for x in segs)
    out.append(f"[{s:7.2f}-{e:7.2f}] {txt}   | voz: " + " ".join(f"{x:.2f}-{y:.2f}" for x, y in g))
(work / "tomas.txt").write_text("\n".join(out)); print("\n".join(out))
