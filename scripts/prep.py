#!/usr/bin/env python3
"""Paso 1: crea el proyecto de edición, transcribe con tiempos por palabra y detecta el marco.

Uso:  prep.py "<ruta del video>" [--model medium] [--lang es]

Crea junto al video la carpeta  edicion-<slug>/  con:
  remotion/          proyecto Remotion (copia de template/, node_modules enlazado al engine)
  audio16k.wav       audio para Whisper
  words.json         [{w, s, e}] con tiempos del video ORIGINAL
  transcript.txt     texto por segmentos con tiempos (para leer rápido)
  contact.jpg        12 fotogramas en grilla (para revisar encuadre / marco)
  crop.txt           recorte sugerido W:H:X:Y en píxeles del original, o "none"
"""
import argparse, json, os, re, shutil, subprocess, sys, unicodedata
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def probe(video):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "json", video])
    d = json.loads(out)
    s = d["streams"][0]
    return s["width"], s["height"], float(d["format"]["duration"])


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:40] or "video"


def detect_crop(video, W, H, dur):
    """Busca un marco de grabación (ventana redondeada sobre un fondo liso/degradado,
    típico de Screen Studio y apps similares). Devuelve (w,h,x,y) o None."""
    import numpy as np
    sw = 960
    sh = round(H * sw / W / 2) * 2
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-ss", str(dur / 2), "-i", video, "-frames:v", "1",
        "-vf", f"scale={sw}:{sh},format=gray", "-f", "rawvideo", "-"])
    img = np.frombuffer(raw, np.uint8).reshape(sh, sw).astype(float)

    def edge(profile, n, from_start):
        # el borde es un salto fuerte dentro del 15% exterior, con zona lisa por fuera
        lim = int(n * 0.15)
        rng = range(2, lim) if from_start else range(n - 3, n - lim, -1)
        best, pos = 0, None
        for i in rng:
            if profile[i] > best:
                best, pos = profile[i], i
        outside = profile[1:pos - 1] if from_start and pos else profile[pos + 2:n - 1] if pos else []
        calm = len(outside) > 3 and np.median(outside) < best * 0.25
        return pos if (pos is not None and best > 12 and calm) else None

    band_r = img[int(sh * .3):int(sh * .7)]
    colprof = np.abs(np.diff(band_r, axis=1)).mean(axis=0)
    band_c = img[:, int(sw * .3):int(sw * .7)]
    rowprof = np.abs(np.diff(band_c, axis=0)).mean(axis=1)
    l, r = edge(colprof, len(colprof), True), edge(colprof, len(colprof), False)
    t, b = edge(rowprof, len(rowprof), True), edge(rowprof, len(rowprof), False)
    if None in (l, r, t, b):
        return None
    k = W / sw
    # meter el recorte unos píxeles para no llevarse la esquina redondeada, y forzar 16:9
    x0, x1, y0, y1 = (l + 1) * k, (r) * k, (t + 1) * k, (b) * k
    inset = 0.004 * W + 8
    x0, x1, y0, y1 = x0 + inset, x1 - inset, y0 + inset, y1 - inset
    w, h = x1 - x0, y1 - y0
    if w / h > 16 / 9:
        nw = h * 16 / 9; x0 += (w - nw) / 2; w = nw
    else:
        nh = w * 9 / 16; y0 += (h - nh) / 2; h = nh
    w, h, x0, y0 = [int(round(v / 2) * 2) for v in (w, h, x0, y0)]
    if w < W * 0.6:
        return None
    return w, h, x0, y0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--model", default="medium")
    ap.add_argument("--lang", default="es")
    a = ap.parse_args()

    video = str(Path(a.video).expanduser().resolve())
    W, H, dur = probe(video)
    work = Path(video).parent / f"edicion-{slugify(Path(video).stem)}"
    work.mkdir(exist_ok=True)
    print(f"Video: {W}x{H}, {dur:.1f}s  →  proyecto en {work}")
    if W < H:
        print("AVISO: el video es vertical; la plantilla está pensada para 16:9 horizontal.")

    # proyecto Remotion
    rem = work / "remotion"
    if not rem.exists():
        shutil.copytree(SKILL / "template", rem)
    nm = rem / "node_modules"
    if not nm.exists():
        nm.symlink_to(SKILL / "engine" / "node_modules")
    (work / "source.txt").write_text(video)

    # audio + fotogramas
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", str(work / "audio16k.wav")])
    n = 12
    fr = work / "frames"; fr.mkdir(exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"fps={n / dur:.5f},scale=640:-2", "-frames:v", str(n), str(fr / "f_%02d.jpg")])
    run(["ffmpeg", "-v", "error", "-y", "-i", str(fr / "f_%02d.jpg"), "-filter_complex", "tile=4x3", str(work / "contact.jpg")])

    # marco
    c = detect_crop(video, W, H, dur)
    (work / "crop.txt").write_text("none" if c is None else "%d:%d:%d:%d" % c)
    print("Recorte de marco:", "ninguno" if c is None else "%d:%d:%d:%d" % c)

    # transcripción
    from faster_whisper import WhisperModel
    m = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(str(work / "audio16k.wav"), language=a.lang, word_timestamps=True)
    words, lines = [], []
    for s in segs:
        lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
    (work / "words.json").write_text(json.dumps(words, ensure_ascii=False, indent=0))
    (work / "transcript.txt").write_text("\n".join(lines))
    print("\n".join(lines))
    print(f"\nListo. Siguiente: cut.py \"{work}\"")


if __name__ == "__main__":
    main()
