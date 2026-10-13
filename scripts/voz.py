#!/usr/bin/env python3
"""Dónde hay voz de verdad dentro de una ventana (detector de voz Silero sobre el audio, no las palabras de Whisper).
Uso: voz.py <carpeta edicion-...> "a-b,c-d,..."   → por ventana: tramos de voz y palabras con su tiempo.
Sirve para elegir los cortes cuando hay tomas repetidas, voz baja o ruido de fondo (los tiempos por palabra fallan ahí)."""
import json, sys
from pathlib import Path
from faster_whisper.audio import decode_audio
from faster_whisper.vad import VadOptions, get_speech_timestamps
work = Path(sys.argv[1]); a = decode_audio(str(work / "audio16k.wav"), sampling_rate=16000)
W = json.loads((work / "words.json").read_text())
OPT = VadOptions(threshold=0.45, min_silence_duration_ms=160, speech_pad_ms=0, min_speech_duration_ms=80)
def voz(lo, hi):
    lo2 = max(0, lo - 1.0)
    ts = get_speech_timestamps(a[int(lo2 * 16000):int((hi + 1.0) * 16000)], OPT)
    return [(lo2 + t["start"] / 16000, lo2 + t["end"] / 16000) for t in ts if lo2 + t["end"] / 16000 > lo and lo2 + t["start"] / 16000 < hi]
if __name__ == "__main__":
    for win in sys.argv[2].split(","):
        lo, hi = map(float, win.split("-"))
        print(f"## {lo}-{hi}  voz: " + " ".join(f"[{s:.2f}-{e:.2f}]" for s, e in voz(lo, hi)))
        if len(sys.argv) < 4: print("   " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in W if lo <= w["s"] < hi))
