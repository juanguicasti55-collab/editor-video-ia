#!/usr/bin/env python3
"""Reels verticales a partir del corte horizontal (cut.mp4): une tramos, recorta un cuadrado 1080x1080 centrado en la cara
y reubica las palabras → remotion/public/reel<X>.mp4 + remotion/src/reel<X>_words.ts. Tiempos = los de corte.txt."""
import json, subprocess
from pathlib import Path
W = Path(__file__).resolve().parent
REELS = {
    "A": [(0.0, 4.45), (7.0, 21.95), (42.36, 52.55), (52.76, 59.85), (280.2, 289.7), (599.92, 608.8)],
    "B": [(428.54, 441.72), (447.42, 449.38), (450.78, 471.95), (552.78, 564.64), (512.8, 524.42)],
}
CROPX = {"A": [420] * 6, "B": [420] * 5}  # x del recorte por tramo (420 = centrado)
words = json.loads((W / "remotion/src/words.ts").read_text().split("= ", 2)[2].rstrip().rstrip(";"))
for name, segs in REELS.items():
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for s, e in segs:
        cmd += ["-ss", f"{s:.3f}", "-t", f"{e - s:.3f}", "-i", str(W / "remotion/public/cut.mp4")]
    fc = "".join(f"[{i}:v]crop=1080:1080:{CROPX[name][i]}:0,setsar=1,fps=30[v{i}];[{i}:a]afade=t=in:d=0.02,afade=t=out:st={e - s - 0.04:.3f}:d=0.04[a{i}];" for i, (s, e) in enumerate(segs))
    fc += "".join(f"[v{i}][a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[v][a]"
    out = W / f"remotion/public/reel{name}.mp4"
    subprocess.run(cmd + ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    t, ws, cuts = 0.0, [], []
    for s, e in segs:
        cuts.append(round(t, 2))
        ws += [{"w": w["w"], "s": round(w["s"] - s + t, 2), "e": round(min(w["e"], e) - s + t, 2)} for w in words if s - 0.03 <= w["s"] < e - 0.05]
        t += e - s
    (W / f"remotion/src/reel{name}_words.ts").write_text(f"export const DURATION = {t:.3f};\nexport const CUTS = {json.dumps(cuts)};\nexport const WORDS: {{ w: string; s: number; e: number }}[] = " + json.dumps(ws, ensure_ascii=False) + ";\n")
    print(name, round(t, 1), cuts, " ".join(f'{w["w"]}@{w["s"]}' for w in ws))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-vf", "fps=1/3,scale=216:-1,tile=10x2", "-frames:v", "1", str(W / f"reel{name}_hoja.jpg")], check=True)
