#!/usr/bin/env python3
"""Prepara los tramos donde va texto o imagen DETRÁS de la persona.
Uso: detras.py <carpeta del reel> "0.05-5.2,10.7-12.9,…"     (segundos del reel, después de corte_audio.py)
Para cada tramo corre matte.py (con .venv-matte) → public/fg_N.webm, y escribe src/fg.ts:
  export const FG = [{from, to, src}]  → se pasa a <CamBehind fg={FG} …> y cada <BehindText from={FG[i].from} to={FG[i].to}>.
Los tramos se redondean al fotograma. Recortar solo lo necesario: es lento."""
import json, subprocess, sys
from pathlib import Path
SKILL = Path(__file__).resolve().parent.parent
R = Path(sys.argv[1]); out = []
for n, rng in enumerate(sys.argv[2].split(","), 1):
    a, b = (round(float(x) * 30) / 30 for x in rng.split("-"))
    subprocess.run([str(SKILL / ".venv-matte/bin/python"), str(SKILL / "scripts/matte.py"), str(R), "--ss", f"{a:.4f}", "--t", f"{b - a:.4f}", "--out", f"fg_{n}.webm"], check=True)
    out.append({"from": round(a, 4), "to": round(b, 4), "src": f"fg_{n}.webm"})
(R / "remotion/src/fg.ts").write_text("export const FG: { from: number; to: number; src: string }[] = " + json.dumps(out) + ";\n")
print("fg.ts:", out)
