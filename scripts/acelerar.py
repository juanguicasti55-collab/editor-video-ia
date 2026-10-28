#!/usr/bin/env python3
"""Acelera la toma ya cortada SIN cambiar el tono de la voz (×1,05–1,15 se siente ágil y no se nota).

Uso:  acelerar.py <carpeta edicion-... | reels/<n>> --factor 1.1

Acelera public/cut.mp4 o public/cam.mp4 (y camwide.mp4 / screen.mp4 si existen) con setpts + atempo, y divide
entre el factor los tiempos de src/words.ts (y DURATION). Guarda la toma lenta como *_x1.mp4 para poder volver.
Correrlo ANTES de escribir video.tsx (o, si ya existe, rehacer los tiempos con retime.py). Después de acelerar,
volver a correr caras.py / detras.py / matte.py si se usan (miden sobre la toma).
Idea tomada de video-editor-architect (MIT, Enrique Rocha): en sus reels medía ×1,05–×1,15.
"""
import argparse, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from proyecto import remotion_dir, leer_palabras, escribir_palabras, duracion


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("proyecto")
    ap.add_argument("--factor", type=float, required=True)
    a = ap.parse_args()
    F = a.factor
    if not 0.5 <= F <= 2:
        raise SystemExit("--factor va de 0.5 a 2 (1.05–1.15 es lo normal)")
    rem = remotion_dir(a.proyecto)
    pub = rem / "public"
    hechos = []
    for n in ("cut.mp4", "cam.mp4", "camwide.mp4", "screen.mp4"):
        f = pub / n
        if not f.exists():
            continue
        lento = pub / (f.stem + "_x1.mp4")
        if not lento.exists():
            f.rename(lento)
        tiene_audio = bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index",
                                           "-of", "csv=p=0", str(lento)], capture_output=True, text=True).stdout.strip())
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(lento), "-vf", f"setpts=PTS/{F},fps=30"]
        cmd += ["-af", f"atempo={F}"] if tiene_audio else ["-an"]
        cmd += ["-c:v", "libx264", "-crf", "17", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", str(f)]
        subprocess.run(cmd, check=True)
        hechos.append(n)
    if not hechos:
        raise SystemExit(f"No hay tomas para acelerar en {pub}")
    W, dur, src = leer_palabras(rem)
    W = [{**w, "s": round(w["s"] / F, 3), "e": round(w["e"] / F, 3)} for w in W]
    nueva = duracion(pub / hechos[0])
    escribir_palabras(rem, W, nueva, src)
    print(f"×{F}: {', '.join(hechos)} · {dur or 0:.1f} s → {nueva:.1f} s · words.ts actualizado")
    print("Si ya hay video.tsx con tiempos escritos a mano: usa retime.py. Si usas caras/detras/matte: vuelve a correrlos.")


if __name__ == "__main__":
    main()
