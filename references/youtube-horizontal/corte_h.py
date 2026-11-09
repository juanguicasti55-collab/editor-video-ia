#!/usr/bin/env python3
"""Corte horizontal (1920x1080) por la voz real (vad.json, detector Silero), no por los tiempos de Whisper.
Une tramos de voz separados por menos de GAP, quita los tramos de DROPS (tiempos del original), nivela la voz,
escribe remotion/public/cut.mp4 y retranscribe el corte → remotion/src/words.ts + corte.txt.

Memoria: corta cada tramo a su propio archivo (seek + libx264 + pcm) y los une con el demuxer concat (-c:v copy).
Un solo filter_complex con un trim por tramo deja en cola los fotogramas decodificados de todos los tramos que aún
no tocan: con ~90 tramos de un 1080p de 5 min se comió 15 GB y el kernel lo mató. Así cada ffmpeg usa unos cientos de MB.
Sin deriva: los bordes de cada tramo se ajustan a la rejilla de fotogramas (múltiplos de 1/FPS) y cada pieza sale con
exactamente n fotogramas y n·48000/FPS muestras de audio, así que video y audio miden lo mismo y no se acumula redondeo.
cut.json guarda los desplazamientos REALES de cada tramo en cut.mp4 (medidos con ffprobe en cada pieza) y al final se
comprueba que cut.mp4 dure la suma de los tramos con ±2 fotogramas; si no, falla.
Uso: corte_h.py [--solo-transcribir | --solo-cortar]"""
import json, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

W = Path(__file__).resolve().parent
SKILL = Path.home() / ".claude/skills/editor-video-ia"
sys.path.insert(0, str(SKILL / "scripts"))
GAP, PAD_IN, PAD_OUT = 0.30, 0.06, 0.12
FPS, SR = 30, 48000            # SR / FPS = 1600 muestras por fotograma: duraciones exactas en los dos flujos
WORKERS = 2                    # ffmpeg en paralelo (cada uno con libx264 multihilo)
DROPS = [(28.0, 35.15),    # primer intento de «apocalíptico optimista» + «algo así»
         (156.5, 158.2)]   # «ehh»
video = (W / "source.txt").read_text().strip()
out = W / "remotion/public/cut.mp4"


def probe(path, *args):
    return subprocess.check_output(["ffprobe", "-v", "error", *args, "-of", "csv=p=0", str(path)], text=True).strip()


def pieza(i, fs, n, tmp):
    """Tramo [fs, fs+n) en fotogramas → pieza con n fotogramas y n·SR/FPS muestras exactas."""
    p = tmp / f"t{i:03d}.mov"
    d, ns = n / FPS, n * SR // FPS
    af = (f"aresample={SR},afade=t=in:d=0.02,afade=t=out:st={max(0, d - 0.03):.4f}:d=0.03,"
          f"apad,atrim=end_sample={ns}")                 # apad: si el original se acaba antes, rellena silencio
    vf = f"scale=1920:1080,fps={FPS},setsar=1,tpad=stop_mode=clone:stop=-1"   # y repite el último fotograma
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{fs / FPS:.6f}", "-t", f"{d + 0.5:.6f}", "-i", video,
                    "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-af", af, "-frames:v", str(n),
                    "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p",
                    "-c:a", "pcm_s16le", "-ar", str(SR), str(p)], check=True)
    nv = int(probe(p, "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets"))
    na = round(float(probe(p, "-select_streams", "a:0", "-show_entries", "stream=duration")) * SR)
    if nv != n or abs(na - ns) > SR // FPS // 2:
        sys.exit(f"Tramo {i}: esperaba {n} fotogramas / {ns} muestras, salió {nv} / {na}")
    return p, nv / FPS


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
    # Bordes a la rejilla de fotogramas, sin solapes y sin pasar del final del original.
    fin = int(float(probe(video, "-show_entries", "format=duration")) * FPS)
    frames, prev = [], 0
    for s, e in segs:
        fs, fe = max(round(s * FPS), prev), min(round(e * FPS), fin)
        if fe > fs:
            frames.append((fs, fe - fs)); prev = fe
    tmp = W / "tramos_tmp"
    shutil.rmtree(tmp, ignore_errors=True); tmp.mkdir()
    with ThreadPoolExecutor(WORKERS) as ex:
        piezas = list(ex.map(lambda a: pieza(a[0], *a[1], tmp), enumerate(frames)))
    lista = tmp / "lista.txt"
    lista.write_text("".join(f"file '{p.name}'\nduration {d:.6f}\n" for p, d in piezas))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista),
                    "-map", "0:v", "-map", "0:a", "-c:v", "copy",
                    "-af", "highpass=f=90,acompressor=threshold=0.03:ratio=3:attack=8:release=140:makeup=2",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)], check=True)
    t, mp = 0.0, []
    for (fs, n), (_, d) in zip(frames, piezas):
        mp.append([round(fs / FPS, 4), round((fs + n) / FPS, 4), round(t, 4)]); t += d
    ideal = sum(n for _, n in frames) / FPS
    real = float(probe(out, "-show_entries", "format=duration"))
    rv = float(probe(out, "-select_streams", "v:0", "-show_entries", "stream=duration"))
    shutil.rmtree(tmp)
    if max(abs(real - ideal), abs(rv - ideal)) > 2 / FPS:
        sys.exit(f"cut.mp4 dura {real:.3f}s (video {rv:.3f}s) y la suma de tramos es {ideal:.3f}s: deriva > 2 fotogramas")
    # segments: [inicio en el original, fin en el original, inicio REAL en cut.mp4]
    (W / "cut.json").write_text(json.dumps({"fps": FPS, "duration": round(real, 4), "segments": mp}, indent=0))
    print(f"{len(frames)} tramos → {ideal:.3f}s (cut.mp4: {real:.3f}s)", flush=True)
    if "--solo-cortar" in sys.argv:
        sys.exit(0)

real = float(probe(out, "-show_entries", "format=duration"))
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
