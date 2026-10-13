#!/usr/bin/env python3
"""Reels verticales (1080x1920) a partir de fragmentos de un video largo ya transcrito con prep.py.

Uso:
  reel_prep.py <carpeta edicion-...> <nombre-reel> --segments "289.3-314.2,328.7-338.5"
               [--source "<video>"] [--words <words.json>] [--cam W:H:X:Y] [--screen W:H:X:Y] [--gap 0.35]

--segments  tramos del video ORIGINAL (segundos), en el orden en que van en el reel.
--source    video de donde cortar (por defecto el de source.txt). Útil si el gancho está mejor en
            otra grabación (p. ej. la toma cruda de la intro) — pasar también --words de esa grabación.
--cam       recorte de la cámara en píxeles del original, formato vertical (≈9:16). Si se omite, se
            detecta la cara y se recorta un 9:16 alrededor (sirve para grabaciones a cámara completa).
--screen    recorte de la ventana de pantalla (grabaciones de pantalla). Sin --screen: reel solo cámara.
--gap       pausas internas que se eliminan (jump cuts dentro de cada tramo).
--wide      recorte horizontal de la cara para la pantalla dividida (public/camwide.mp4). "auto" (default)
            lo calcula desde la cámara; "none" no lo genera. Revisarlo siempre con un fotograma.

Crea <carpeta>/reels/<nombre>/ con remotion/ (plantilla vertical), public/cam.mp4 (1080x1920),
public/screen.mp4 (1920 de ancho, si hay --screen) y src/words.ts con los tiempos ya del reel.
Imprime la transcripción del reel con tiempos nuevos para planificar escenas.
"""
import argparse, json, shutil, subprocess
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
PAD_IN, PAD_OUT, MAX_WORD = 0.06, 0.14, 0.95


def probe(v):
    d = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0",
                                            "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "json", v]))
    st = d["streams"][0]
    w, h = st["width"], st["height"]
    rot = next((abs(int(x["rotation"])) for x in st.get("side_data_list", []) if "rotation" in x), 0)
    return (h, w) if rot in (90, 270) else (w, h)  # grabaciones verticales con metadato de rotación


def detect_cam(video, segs, W, H, crop_frame):
    """Cara centrada → recorte 9:16 a altura completa (dentro del marco si lo hay)."""
    import cv2, numpy as np
    cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    xs = []
    for a, b in segs:
        for t in (a + (b - a) * k for k in (0.2, 0.5, 0.8)):
            raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1",
                                           "-vf", "scale=960:-2,format=gray", "-f", "rawvideo", "-"])
            h = len(raw) // 960
            img = np.frombuffer(raw, np.uint8)[: h * 960].reshape(h, 960)
            f = cas.detectMultiScale(img, 1.1, 6, minSize=(40, 40))
            if len(f):
                x, y, w, hh = max(f, key=lambda r: r[2])
                xs.append((x + w / 2) * W / 960)
    fx, fy, fw, fh = crop_frame
    cx = sorted(xs)[len(xs) // 2] if xs else fx + fw / 2
    ch = fh
    cw = int(round(ch * 9 / 16 / 2) * 2)
    x0 = int(min(max(cx - cw / 2, fx), fx + fw - cw))
    return cw, ch, x0, fy


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("work"); ap.add_argument("name")
    ap.add_argument("--segments", required=True)
    ap.add_argument("--source"); ap.add_argument("--words")
    ap.add_argument("--cam"); ap.add_argument("--screen")
    ap.add_argument("--gap", type=float, default=0.35)
    ap.add_argument("--wide", default="auto", help="recorte horizontal de la cara W:H:X:Y para la pantalla dividida, 'auto' o 'none'")
    a = ap.parse_args()

    work = Path(a.work).expanduser().resolve()
    video = a.source or (work / "source.txt").read_text().strip()
    import sys; sys.path.insert(0, str(SKILL / "scripts")); from fixes import fix_words
    words = fix_words(json.loads(Path(a.words or work / "words.json").read_text()))
    W, H = probe(video)
    segs_in = [tuple(map(float, s.split("-"))) for s in a.segments.split(",")]

    # dentro de cada tramo: jump cuts en pausas > gap
    parts, sel = [], []
    for A, B in segs_in:
        ws = [dict(w) for w in words if A - 0.05 <= w["s"] and w["e"] <= B + 0.3 and w["s"] < B]
        for w in ws:
            if w["e"] - w["s"] > MAX_WORD:
                w["e"] = round(w["s"] + 0.8, 2)
        cur = None
        for w in ws:
            if cur and w["s"] - cur[1] < a.gap:
                cur[1] = w["e"]
            else:
                if cur: parts.append(cur)
                cur = [w["s"], w["e"]]
        if cur: parts.append(cur)
        sel += ws
    parts = [[max(0, s - PAD_IN), e + PAD_OUT] for s, e in parts]
    merged = []
    for s, e in parts:  # solo fusionar si se solapan Y van en orden
        if merged and merged[-1][0] <= s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
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
    nw, seen = [], set()
    for w in sel:
        s, e = remap(w["s"]), remap(w["e"])
        if s is not None and (w["s"], w["w"]) not in seen:
            seen.add((w["s"], w["w"])); nw.append({"w": w["w"], "s": s, "e": e if e is not None else s + 0.3})
    nw.sort(key=lambda w: w["s"])

    # recortes
    frame = (0, 0, W, H)
    ct = work / "crop.txt"
    if not a.screen and not a.source and ct.exists() and ct.read_text().strip() != "none":
        cw_, ch_, cx_, cy_ = map(int, ct.read_text().split(":")); frame = (cx_, cy_, cw_, ch_)
    if a.source:  # otra grabación: detectar su marco
        import importlib.util
        spec = importlib.util.spec_from_file_location("prep", SKILL / "scripts" / "prep.py")
        prep = importlib.util.module_from_spec(spec); spec.loader.exec_module(prep)
        c = prep.detect_crop(video, W, H, float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video])))
        if c: frame = (c[2], c[3], c[0], c[1])
    cam = tuple(map(int, a.cam.split(":"))) if a.cam else detect_cam(video, merged, W, H, frame)

    out = work / "reels" / a.name
    rem = out / "remotion"
    if not rem.exists():
        shutil.copytree(SKILL / "template-reel", rem)
        (rem / "node_modules").symlink_to(SKILL / "engine" / "node_modules")
    pub = rem / "public"; pub.mkdir(exist_ok=True)

    fc = ""
    for i, (s, e) in enumerate(merged):
        fc += (f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];"
               f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0, e - s - 0.03):.3f}:d=0.03[a{i}];")
    fc += "".join(f"[v{i}][a{i}]" for i in range(len(merged)))
    fc += f"concat=n={len(merged)}:v=1:a=1[vc][ac];[vc]fps=30,split=2[c1][c2];"
    # cuadro ancho con la cara completa (pantalla dividida, DualCam): mismo centro que la cámara,
    # ~74 % de su alto, relación 1620x1140, dentro del marco de la grabación.
    wide = None
    if not a.screen and a.wide != "none":
        if a.wide != "auto":
            wide = tuple(map(int, a.wide.split(":")))
        else:
            cw, ch, cx, cy = cam
            fx, fy, fw, fh = frame
            wh = int(min(fh, ch * 0.74)) // 2 * 2
            ww = int(min(fw, wh * 1620 / 1140)) // 2 * 2
            wh = int(min(wh, ww * 1140 / 1620)) // 2 * 2
            wx = int(min(max(cx + cw / 2 - ww / 2, fx), fx + fw - ww))
            wy = int(min(max(cy + ch * 0.053, fy), fy + fh - wh))
            wide = (ww, wh, wx, wy)
    split = "split=3[c1][c2][c3]" if wide else "split=2[c1][c2]"
    fc = fc.replace("split=2[c1][c2]", split)
    fc += f"[c1]crop={cam[0]}:{cam[1]}:{cam[2]}:{cam[3]},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[cam];"
    if wide:
        fc += f"[c3]crop={wide[0]}:{wide[1]}:{wide[2]}:{wide[3]},scale=1620:1140:force_original_aspect_ratio=increase,crop=1620:1140[wide];"
    if a.screen:
        sw, sh, sx, sy = map(int, a.screen.split(":"))
        fc += f"[c2]crop={sw}:{sh}:{sx}:{sy},scale=1920:-2[scr]"
    else:
        fc += "[c2]nullsink"
    (out / "filter.txt").write_text(fc)
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", video, "-filter_complex_script", str(out / "filter.txt"),
           "-map", "[cam]", "-map", "[ac]", "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-c:a", "aac", "-b:a", "192k",
           str(pub / "cam.mp4")]
    if wide:
        cmd += ["-map", "[wide]", "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", str(pub / "camwide.mp4")]
    if a.screen:
        cmd += ["-map", "[scr]", "-an", "-c:v", "libx264", "-crf", "17", "-preset", "fast", str(pub / "screen.mp4")]
    subprocess.run(cmd, check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(pub / "cam.mp4")]))
    (rem / "src" / "words.ts").write_text(
        f"export const DURATION = {dur:.3f};\nexport const HAS_SCREEN = {'true' if a.screen else 'false'};\n"
        f"export const SCREEN_H = {round(1920 * int(a.screen.split(':')[1]) / int(a.screen.split(':')[0])) if a.screen else 1200};\n"
        f"export const WORDS: {{ w: string; s: number; e: number }}[] = " + json.dumps(nw, ensure_ascii=False) + ";\n")
    (out / "reel.json").write_text(json.dumps({"segments": segs_in, "parts": merged, "cam": cam, "wide": wide, "screen": a.screen,
                                               "source": video, "duration": dur}, indent=1))
    (out / "source.txt").write_text(video)

    print(f"Reel '{a.name}': {dur:.1f}s ({len(merged)} tramos). Cámara {cam}" + (f", cuadro ancho {wide}" if wide else "") + (f", pantalla {a.screen}" if a.screen else ""))
    line, start = [], None
    for w in nw:
        if start is None: start = w["s"]
        line.append(f"{w['w']}@{w['s']:.2f}")
        if w["w"].endswith((".", "?", "!")) or len(line) >= 14:
            print(f"[{start:6.2f}] " + " ".join(line)); line, start = [], None
    if line: print(f"[{start:6.2f}] " + " ".join(line))


if __name__ == "__main__":
    main()
