#!/usr/bin/env python3
"""Une clips cortos de IA (Veo, Higgsfield…) en un video vertical tipo podcast o UGC.
Uso: armar.py <proyecto> receta.json
receta.json: {"carpeta": "~/Downloads/juan", "clips": ["prefijo1", ["prefijo2", [[1.57, 3.62]]], ...]}
  - cada clip en el orden de la conversación; opcionalmente con los tramos de voz a conservar (si no, se usan los
    del detector de voz de transcribir.py). Requiere <proyecto>/tr.json (salida de transcribir.py).
Qué hace: quita silencios de cabeza y cola de cada clip y pausas internas > 0,35 s (sin cortar sobre sonido),
iguala cada clip a -18 LUFS, une a 1080x1920 y 24 fps y escribe remotion/public/cam.mp4, src/words.ts y src/cuts.ts
(cuts: segundo, si cambia la persona y quién habla, H/M según el nombre del archivo)."""
import json, os, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np
from faster_whisper.audio import decode_audio
SKILL = Path(__file__).resolve().parents[3]
GAP, PI, PO, PO_TURN, FPS = 0.35, 0.06, 0.12, 0.16, 24
P = Path(sys.argv[1]).resolve(); R = json.loads(Path(sys.argv[2]).read_text()); D = Path(os.path.expanduser(R["carpeta"]))
TR = json.loads((P / "tr.json").read_text())
def find(key): return next(str(D / f) for f in sorted(os.listdir(D)) if f.startswith(key))
def lufs(f):
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", subprocess.run(["ffmpeg", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr)[-1])
rem = P / "remotion"
if not rem.exists():
    shutil.copytree(SKILL / "template-reel", rem); (rem / "node_modules").symlink_to(SKILL / "engine" / "node_modules")
    shutil.copy(SKILL / "references/mg.tsx", rem / "src/mg.tsx")
    r = (rem / "src/Root.tsx").read_text().replace("export const FPS = 30;", "export const FPS = 24;"); (rem / "src/Root.tsx").write_text(r)
pub = rem / "public"; pub.mkdir(exist_ok=True)
segs = []
for item in R["clips"]:
    key, force = (item[0], item[1]) if isinstance(item, list) else (item, None)
    f = find(key); a = decode_audio(f, sampling_rate=16000); n = len(a) // 160; dur = len(a) / 16000
    env = 20 * np.log10(np.sqrt((a[:n * 160].reshape(n, 160) ** 2).mean(1) + 1e-12)); thr = max(np.percentile(env, 15) + 9, np.percentile(env, 92) - 38)
    loud = lambda t: 0 <= int(t * 100) < n and env[int(t * 100)] > thr
    parts = []
    for s, e in (force or TR[f]["vad"]):
        if e - s < 0.2 and not any(s - 0.1 <= w["s"] <= e for w in TR[f]["words"]): continue
        if parts and s - parts[-1][1] < GAP: parts[-1][1] = e
        else: parts.append([s, e])
    g = lufs(f)
    for j, (s, e) in enumerate(parts):
        while s > 0.02 and loud(s - 0.01): s -= 0.01
        if not force:
            while e < dur - 0.02 and loud(e): e += 0.01
        last = j == len(parts) - 1
        segs.append({"f": f, "s": round(max(0.0, s - PI) * FPS) / FPS, "e": round(min(dur - 0.01, e + (PO_TURN if last else PO)) * FPS) / FPS,
                     "new": j == 0, "gain": -18 - g, "who": "H" if os.path.basename(f).lower().startswith("man") else "M"})
files = list(dict.fromkeys(g["f"] for g in segs)); idx = {f: i for i, f in enumerate(files)}; fc = ""
for k, g in enumerate(segs):
    i = idx[g["f"]]
    fc += (f"[{i}:v]trim={g['s']:.4f}:{g['e']:.4f},setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:flags=lanczos,setsar=1[v{k}];"
           f"[{i}:a]atrim={g['s']:.4f}:{g['e']:.4f},asetpts=PTS-STARTPTS,aresample=48000,volume={g['gain']:.1f}dB,afade=t=in:d=0.015,afade=t=out:st={g['e'] - g['s'] - 0.02:.4f}:d=0.02[a{k}];")
fc += "".join(f"[v{k}][a{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[cam][ac]"
(P / "filter.txt").write_text(fc)
cmd = ["ffmpeg", "-v", "error", "-y"]
for f in files: cmd += ["-i", f]
subprocess.run(cmd + ["-filter_complex_script", str(P / "filter.txt"), "-map", "[cam]", "-map", "[ac]", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-c:a", "aac", "-b:a", "192k", str(pub / "cam.mp4")], check=True)
t = 0; W = []; cuts = []
for g in segs:
    cuts.append({"at": round(t, 3), "new": g["new"], "speaker": g["who"]})
    for w in TR[g["f"]]["words"]:
        m = (max(w["s"], g["s"]) + min(w["e"], g["e"])) / 2
        if g["s"] - 0.05 <= m <= g["e"] + 0.05:
            ns = t + max(w["s"], g["s"]) - g["s"]; W.append({"w": w["w"], "s": round(ns, 2), "e": round(max(t + min(w["e"], g["e"]) - g["s"], ns + 0.1), 2)})
    t += g["e"] - g["s"]
Dd = []
for w in sorted(W, key=lambda x: x["s"]):   # una palabra en el borde de dos tramos no se repite
    if Dd and Dd[-1]["w"].lower().strip(".,¿?¡!") == w["w"].lower().strip(".,¿?¡!") and w["s"] - Dd[-1]["s"] < 0.35: continue
    Dd.append(w)
(rem / "src/words.ts").write_text(f"export const DURATION = {t:.3f};\nexport const HAS_SCREEN = false;\nexport const SCREEN_H = 1200;\n"
    "export const WORDS: { w: string; s: number; e: number }[] = " + json.dumps(Dd, ensure_ascii=False) + ";\n")
(rem / "src/cuts.ts").write_text("export const CUTS: { at: number; new: boolean; speaker: string }[] = " + json.dumps(cuts) + ";\n")
print(f"DUR {t:.2f}s · {len(segs)} tramos"); print(" ".join(f"{w['w']}@{w['s']}" for w in Dd))
