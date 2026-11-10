import sys, glob, os, json
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from faster_whisper.vad import VadOptions, get_speech_timestamps
m = WhisperModel("medium", device="cpu", compute_type="int8")
d = sys.argv[1]; out = {}
for f in sorted(glob.glob(os.path.join(os.path.expanduser(d), "*.mp4"))):
    a = decode_audio(f, sampling_rate=16000)
    ts = get_speech_timestamps(a, VadOptions(threshold=0.4, min_silence_duration_ms=150, speech_pad_ms=0))
    sg, _ = m.transcribe(a, language="es", word_timestamps=True)
    ws = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in sg for w in s.words]
    out[f] = {"words": ws, "vad": [[round(t["start"] / 16000, 2), round(t["end"] / 16000, 2)] for t in ts], "dur": len(a) / 16000}
    print(f"{os.path.basename(f)[:46]:46s} dur {len(a)/16000:5.2f} voz {out[f]['vad']}\n   {' '.join(w['w'] + '@' + str(w['s']) for w in ws)}", flush=True)
json.dump(out, open(os.path.join(sys.argv[2] if len(sys.argv) > 2 else ".", "tr.json"), "w"), ensure_ascii=False)
