#!/usr/bin/env python3
"""Dónde está la cara en cada toma del corte, para que ningún texto caiga sobre la boca.
Uso: caras.py <carpeta del reel>   (después de corte_audio.py)
Escribe remotion/src/faces.ts → FACES = [{at, top, bottom, cx}] en px de 1080x1920 sin zoom (una fila por toma).
En video.tsx: const U = under(FACES, CAM); <Kin top={U(T.palabra)} …>  → el bloque arranca debajo del mentón."""
import json, subprocess, sys
from pathlib import Path
import cv2, numpy as np
R = Path(sys.argv[1]); c = json.loads((R / "corte.json").read_text()); cuts = c["cuts"] + [c["dur"]]
cam = str(R / "remotion/public/cam.mp4")
cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
out = []; last = {"top": 560, "bottom": 900, "cx": 540}
for i in range(len(cuts) - 1):
    boxes = []
    for k in (0.15, 0.35, 0.5, 0.65, 0.85):
        t = cuts[i] + (cuts[i + 1] - cuts[i]) * k
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", cam, "-frames:v", "1", "-vf", "scale=540:960,format=gray", "-f", "rawvideo", "-"])
        img = np.frombuffer(raw, np.uint8).reshape(960, 540)
        f = cas.detectMultiScale(img, 1.1, 6, minSize=(70, 70))
        if len(f):
            x, y, w, h = max(f, key=lambda r: r[2]); boxes.append((y * 2, (y + h) * 2, (x + w / 2) * 2))
    if boxes:
        last = {"top": int(min(b[0] for b in boxes)), "bottom": int(max(b[1] for b in boxes)), "cx": int(np.median([b[2] for b in boxes]))}
    out.append({"at": cuts[i], **last, "ok": bool(boxes)})
    print(f"toma {i + 1:2d} @{cuts[i]:6.2f}: cara y {last['top']}–{last['bottom']}  x {last['cx']}" + ("" if boxes else "  (sin detectar: uso la anterior)"))
(R / "remotion/src/faces.ts").write_text("export const FACES: { at: number; top: number; bottom: number; cx: number }[] = " + json.dumps([{k: v for k, v in o.items() if k != "ok"} for o in out]) + ";\n")
