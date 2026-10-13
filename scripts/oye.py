#!/usr/bin/env python3
"""Retranscribe ventanas sueltas del audio (para tomas repetidas donde Whisper junta o estira frases).
Uso: oye.py <carpeta edicion-...> "a-b,c-d,..." """
import sys
from pathlib import Path
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
a = decode_audio(str(Path(sys.argv[1]) / "audio16k.wav"), sampling_rate=16000)
m = WhisperModel("medium", device="cpu", compute_type="int8")
for win in sys.argv[2].split(","):
    lo, hi = map(float, win.split("-"))
    segs, _ = m.transcribe(a[int(lo * 16000):int(hi * 16000)], language="es", word_timestamps=True, condition_on_previous_text=False)
    print(f"## {lo}-{hi}: " + " ".join(f"{w.word.strip()}@{lo + w.start:.2f}" for s in segs for w in s.words))
