#!/usr/bin/env python3
"""Paso 2: jump cuts. Quita pausas usando los tiempos por palabra, recorta el marco,
pasa a 1920x1080 y genera remotion/public/cut.mp4 + remotion/src/words.ts (tiempos ya cortados).

Uso:  cut.py <carpeta edicion-...> [--gap 0.28] [--crop auto|none|W:H:X:Y] [--drop "12.3-14.1,..."]

--gap   pausa mínima (s) que se elimina. 0.28 = ritmo ágil tipo YouTube; 0.4 = más respirado.
--drop  tramos del video ORIGINAL a eliminar además de las pausas (tomas falsas, repeticiones).
Imprime la transcripción con los tiempos NUEVOS: esos son los que se usan en video.tsx.
"""
import argparse, json, subprocess
from pathlib import Path

PAD_IN, PAD_OUT = 0.06, 0.12   # aire antes/después de cada tramo para no comer sílabas
MAX_WORD = 0.95                # Whisper a veces "estira" una palabra sobre un silencio


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("work")
    ap.add_argument("--gap", type=float, default=0.28)
    ap.add_argument("--crop", default="auto")
    ap.add_argument("--drop", default="")
    a = ap.parse_args()
    work = Path(a.work).expanduser().resolve()
    video = (work / "source.txt").read_text().strip()
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))

    import sys; sys.path.insert(0, str(Path(__file__).resolve().parent)); from fixes import fix_words
    W = fix_words(json.loads((work / "words.json").read_text()))
    for w in W:
        if w["e"] - w["s"] > MAX_WORD:
            w["e"] = round(w["s"] + 0.8, 2)
    drops = []
    for part in filter(None, a.drop.split(",")):
        x, y = part.split("-"); drops.append((float(x), float(y)))
    W = [w for w in W if not any(x <= (w["s"] + w["e"]) / 2 <= y for x, y in drops)]

    segs = []
    for w in W:
        if segs and w["s"] - segs[-1][1] < a.gap:
            segs[-1][1] = w["e"]
        else:
            segs.append([w["s"], w["e"]])
    segs = [[max(0, s - PAD_IN), min(dur, e + PAD_OUT)] for s, e in segs]
    merged = []
    for s, e in segs:
        if merged and s <= merged[-1][1]:
            merged[-1][1] = e
        else:
            merged.append([s, e])

    t, mp = 0.0, []
    for s, e in merged:
        mp.append((s, e, t)); t += e - s

    def remap(x):
        for s, e, o in mp:
            if s - 0.01 <= x <= e + 0.01:
                return round(o + min(max(x, s), e) - s, 3)
        return None

    nw = [{"w": w["w"], "s": remap(w["s"]), "e": remap(w["e"])} for w in W]
    nw = [w for w in nw if w["s"] is not None]

    crop = a.crop
    if crop == "auto":
        crop = (work / "crop.txt").read_text().strip() if (work / "crop.txt").exists() else "none"
    vf = ("crop=%s," % crop if crop != "none" else "") + \
        "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30"

    parts = "".join(
        f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];"
        f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, e - s - 0.03):.3f}:d=0.03[a{i}];"
        for i, (s, e) in enumerate(merged))
    parts += "".join(f"[v{i}][a{i}]" for i in range(len(merged)))
    parts += f"concat=n={len(merged)}:v=1:a=1[vc][ac];[vc]{vf}[vo]"
    (work / "filter.txt").write_text(parts)

    out = work / "remotion" / "public" / "cut.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-filter_complex_script", str(work / "filter.txt"),
                    "-map", "[vo]", "-map", "[ac]", "-c:v", "libx264", "-crf", "17", "-preset", "fast",
                    "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    real = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)]))

    (work / "cut.json").write_text(json.dumps({"segments": merged, "duration": real, "words": nw}, ensure_ascii=False, indent=1))
    (work / "remotion" / "src" / "words.ts").write_text(
        f"export const DURATION = {real:.3f};\nexport const WORDS: {{ w: string; s: number; e: number }}[] = "
        + json.dumps(nw, ensure_ascii=False) + ";\n")

    print(f"{dur:.1f}s → {real:.1f}s ({len(merged)} tramos). Recorte: {crop}\n")
    # transcripción con tiempos nuevos, agrupada por frases, para planificar escenas
    line, start = [], None
    for w in nw:
        if start is None: start = w["s"]
        line.append(f"{w['w']}@{w['s']:.2f}")
        if w["w"].endswith((".", "?", "!")) or len(line) >= 14:
            print(f"[{start:6.2f}] " + " ".join(line)); line, start = [], None
    if line: print(f"[{start:6.2f}] " + " ".join(line))


if __name__ == "__main__":
    main()
