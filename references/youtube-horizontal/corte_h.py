#!/usr/bin/env python3
"""Corte horizontal (1920x1080) por la voz real (vad.json, detector Silero), no por los tiempos de Whisper.
Une tramos de voz separados por menos de GAP, quita los tramos de DROPS (tiempos del original), nivela la voz,
escribe remotion/public/cut.mp4 y retranscribe el corte → remotion/src/words.ts + corte.txt.
Uso: corte_h.py [--solo-transcribir]"""
import json, subprocess, sys
from pathlib import Path

W = Path(__file__).resolve().parent
SKILL = Path.home() / ".claude/skills/editor-video-ia"
sys.path.insert(0, str(SKILL / "scripts"))
GAP, PAD_IN, PAD_OUT = 0.30, 0.06, 0.12
DROPS = [(28.0, 35.15),    # primer intento de «apocalíptico optimista» + «algo así»
         (156.5, 158.2)]   # «ehh»
video = (W / "source.txt").read_text().strip()
out = W / "remotion/public/cut.mp4"

if "--solo-transcribir" not in sys.argv:
    iv = [(s, e) for s, e in json.loads((W / "vad.json").read_text())
          if not any(a <= (s + e) / 2 <= b for a, b in DROPS) and e - s >= 0.12]
    segs = []
    for s, e in iv:
        hit_drop = segs and any(segs[-1][1] <= a and b <= s for a, b in DROPS)
        if segs and s - segs[-1][1] < GAP and not hit_drop:
            segs[-1][1] = e
        else:
            segs.append([s, e])
    segs = [[max(0, s - PAD_IN), e + PAD_OUT] for s, e in segs]
    segs[-1][1] += 0.6
    fc = "".join(
        f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];"
        f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, e - s - 0.03):.3f}:d=0.03[a{i}];"
        for i, (s, e) in enumerate(segs))
    fc += "".join(f"[v{i}][a{i}]" for i in range(len(segs)))
    fc += (f"concat=n={len(segs)}:v=1:a=1[vc][ar];[vc]scale=1920:1080,fps=30,setsar=1[vo];"
           "[ar]highpass=f=90,acompressor=threshold=0.03:ratio=3:attack=8:release=140:makeup=2,aresample=48000[ac]")
    (W / "filter.txt").write_text(fc)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-filter_complex_script", str(W / "filter.txt"),
                    "-map", "[vo]", "-map", "[ac]", "-c:v", "libx264", "-crf", "17", "-preset", "fast",
                    "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    t, mp = 0.0, []
    for s, e in segs:
        mp.append([round(s, 3), round(e, 3), round(t, 3)]); t += e - s
    (W / "cut.json").write_text(json.dumps({"segments": mp}, indent=0))
    print(f"{len(segs)} tramos → {t:.1f}s", flush=True)

real = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)]))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-vn", "-ac", "1", "-ar", "16000", str(W / "cut16k.wav")], check=True)
from faster_whisper import WhisperModel
from fixes import fix_words
m = WhisperModel("medium", device="cpu", compute_type="int8")
PROMPT = ("Juan habla de un documental sobre inteligencia artificial: apocalíptico optimista, Sam Altman, Dario Amodei, "
          "Anthropic, Elon Musk, ChatGPT, Gemini, agentes autónomos, centro de operaciones IA, cuello de botella, renta universal.")
segs, _ = m.transcribe(str(W / "cut16k.wav"), language="es", word_timestamps=True, initial_prompt=PROMPT,
                       vad_filter=True, vad_parameters={"min_silence_duration_ms": 300})
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:7.2f}] " + " ".join(f"{w.word.strip()}@{w.start:.2f}" for w in s.words))
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(min(w.end, w.start + 0.95), 2)})
words = fix_words(words)
(W / "remotion/src/words.ts").write_text(
    f"export const DURATION = {real:.3f};\nexport const WORDS: {{ w: string; s: number; e: number }}[] = "
    + json.dumps(words, ensure_ascii=False) + ";\n")
(W / "cut_words.json").write_text(json.dumps(words, ensure_ascii=False))
(W / "corte.txt").write_text("\n".join(lines))
print(f"Listo: {real:.1f}s, {len(words)} palabras")
