#!/usr/bin/env python3
"""Máscaras de la persona cuadro por cuadro, para poner textos y gráficos DETRÁS de ella con Cam2 (references/fx-efectos.tsx).

Uso (con el Python de .venv-matte, el mismo de matte.py):
  mascaras.py <carpeta del reel> [--tramos "5.2-7.9,10.1-14.9"] [--modelo assets/models/selfie_segmenter.tflite]

Lee remotion/public/cam.mp4 (o cut.mp4) y escribe:
  remotion/public/m/00000.png …   máscara a media resolución (PNG negro con transparencia = la persona). Liviana y rápida
                                  (~4 cuadros/s), a diferencia de un video con alfa.
  remotion/src/mascaras.ts        ULTIMA_MASCARA y TOPS (la coronilla en px por cuadro: para poner el texto de atrás justo
                                  encima de la cabeza).
--tramos: solo esos segundos (lo que va detrás). Sin --tramos hace todo el video.
--modelo: selfie_segmenter.tflite (viene en assets/models) o selfie_multiclass_256x256.tflite (mejor pelo; bajarlo de
          storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/).
Revisar con fotogramas: pelo suelto, manos rápidas y objetos en la mano pueden recortarse mal.
"""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

sys.path.insert(0, str(Path(__file__).resolve().parent))
from proyecto import remotion_dir, camara

SKILL = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("proyecto"); ap.add_argument("--tramos", default="")
ap.add_argument("--modelo", default=str(SKILL / "assets/models/selfie_segmenter.tflite"))
a = ap.parse_args()
rem = remotion_dir(a.proyecto); cam = camara(rem)
d = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                        "stream=width,height,nb_frames", "-of", "json", str(cam)]))["streams"][0]
W, H = int(d["width"]), int(d["height"])
need = None
if a.tramos:
    need = set()
    for r in a.tramos.split(","):
        x, y = (float(v) for v in r.split("-"))
        need |= set(range(int(x * 30) - 1, int(y * 30) + 2))
out = rem / "public" / "m"; out.mkdir(parents=True, exist_ok=True)
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=a.modelo), output_confidence_masks=True))
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(cam), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
prev, i, n, tops = None, 0, 0, []
vacia = np.zeros((H // 2, W // 2, 4), np.uint8)
while True:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    if need is None or i in need:
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.resize(rgb, (W // 2, H // 2)))))
        cm = r.confidence_masks
        m = cm[0].numpy_view() if len(cm) == 1 else 1 - cm[0].numpy_view()
        m = cv2.resize(m, (W, H))
        if prev is not None:
            m = 0.65 * m + 0.35 * prev      # suaviza el parpadeo entre cuadros
        prev = m
        al = cv2.GaussianBlur(np.clip((m - 0.35) / 0.3, 0, 1), (0, 0), 1.6)
        filas = np.where((al > 0.5).sum(1) > 25)[0]
        tops.append(int(filas[0]) if len(filas) else -1)
        mk = (cv2.resize(al, (W // 2, H // 2), interpolation=cv2.INTER_AREA) * 255).astype(np.uint8)
        z = np.zeros_like(mk)
        cv2.imwrite(str(out / f"{i:05d}.png"), np.dstack([z, z, z, mk]), [cv2.IMWRITE_PNG_COMPRESSION, 1]); n += 1
    else:
        prev = None
        tops.append(-1)
        cv2.imwrite(str(out / f"{i:05d}.png"), vacia, [cv2.IMWRITE_PNG_COMPRESSION, 1])   # sin persona: Cam2 no la usa aquí
    i += 1
# coronilla: rellenar huecos y suavizar
t = np.array(tops, float)
for k in range(len(t)):
    if t[k] < 0:
        t[k] = t[k - 1] if k and t[k - 1] >= 0 else H * 0.2
t = np.convolve(np.pad(t, 4, mode="edge"), np.ones(9) / 9, mode="valid")
seg.close()
(rem / "src" / "mascaras.ts").write_text(f"export const ULTIMA_MASCARA = {i - 1};\nexport const TOPS: number[] = {json.dumps([int(x) for x in t])};\n")
print(f"{n} máscaras de {i} cuadros → {out}  ·  src/mascaras.ts")
