#!/usr/bin/env python3
"""Persona recortada cuadro por cuadro, para poner textos y gráficos DETRÁS de ella con Cam2 (references/fx-efectos.tsx).

Uso (con el Python de .venv-matte, el mismo de matte.py):
  mascaras.py <carpeta del reel> [--tramos "5.2-7.9,10.1-14.9"] [--con-pelo]

Lee remotion/public/cam.mp4 (o cut.mp4) y escribe:
  remotion/public/fg/00000.webp …  la persona a tamaño completo con fondo transparente, solo en los tramos. Cada corrida
                                   borra las anteriores: pasar siempre todos los tramos.
  remotion/src/mascaras.ts         ULTIMA_MASCARA y TOPS (la coronilla en px por cuadro: para poner el texto de atrás
                                   justo encima de la cabeza).
--tramos: esos segundos, que deben cubrir todo lo que Cam2 muestra recortado (`on` y `shrink` hasta el final):
          un cuadro sin recorte hace fallar el render. Sin --tramos hace todo el video, que es lento y pesa mucho.
--con-pelo: OBLIGATORIO si la persona tiene pelo: sin esta opción el pelo desaparece del recorte, sin ningún error. Por
          defecto va sin la clase pelo porque en una cabeza calva el modelo confunde nubes o paredes con pelo.
Modelos: selfie_multiclass_256x256.tflite (se baja solo a assets/models la primera vez, 16 MB) y selfie_segmenter.tflite.
Revisar con fotogramas: pelo suelto, manos rápidas y objetos en la mano pueden recortarse mal.
"""
import argparse, json, subprocess, sys, urllib.request
from pathlib import Path
import numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

sys.path.insert(0, str(Path(__file__).resolve().parent))
from proyecto import remotion_dir, camara

SKILL = Path(__file__).resolve().parent.parent
MODELOS = SKILL / "assets" / "models"
SIMPLE = MODELOS / "selfie_segmenter.tflite"
MULTI = MODELOS / "selfie_multiclass_256x256.tflite"
MULTI_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite"
FONDO, PELO, PIEL_CUERPO, PIEL_CARA = 0, 1, 2, 3   # clases de selfie_multiclass


def bajar_modelo():
    if MULTI.exists():
        return
    print(f"Bajando {MULTI.name} (16 MB)…", flush=True)
    tmp = MULTI.with_suffix(".parcial")
    urllib.request.urlretrieve(MULTI_URL, tmp)
    tmp.rename(MULTI)


ap = argparse.ArgumentParser()
ap.add_argument("proyecto"); ap.add_argument("--tramos", default=""); ap.add_argument("--con-pelo", action="store_true")
a = ap.parse_args()
bajar_modelo()
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
out = rem / "public" / "fg"; out.mkdir(parents=True, exist_ok=True)
for viejo in out.glob("*.webp"):
    viejo.unlink()
crear = lambda f: vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=str(f)), output_confidence_masks=True))
multi, simple = crear(MULTI), crear(SIMPLE)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(cam), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
prev, i, n, tops = None, 0, 0, []
while True:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    if need is None or i in need:
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        chica = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.resize(rgb, (W // 2, H // 2))))
        cm = [c.numpy_view() for c in multi.segment(chica).confidence_masks]
        m = 1 - cm[FONDO] if a.con_pelo else 1 - cm[FONDO] - cm[PELO]
        m = cv2.resize(np.clip(m, 0, 1), (W, H))
        piel = cv2.resize(cm[PIEL_CUERPO] + cm[PIEL_CARA], (W, H))
        filas = np.where((piel > 0.5).sum(1) > 30)[0]
        if len(filas):   # por encima de la piel manda también el modelo simple: dibuja bien la cabeza y no ve el cielo
            y0 = int(filas[0]) + 40
            b = simple.segment(chica).confidence_masks[0].numpy_view()
            b = cv2.resize(b[:, :, 0] if b.ndim == 3 else b, (W, H))
            m[:y0, :] = np.minimum(m[:y0, :], b[:y0, :])
        if prev is not None:
            m = 0.65 * m + 0.35 * prev      # suaviza el parpadeo entre cuadros
        prev = m
        al = cv2.GaussianBlur(np.clip((m - 0.35) / 0.3, 0, 1), (0, 0), 1.6)
        filas = np.where((al > 0.5).sum(1) > 25)[0]
        tops.append(int(filas[0]) if len(filas) else -1)
        if not cv2.imwrite(str(out / f"{i:05d}.webp"), np.dstack([rgb[:, :, ::-1], (al * 255).astype(np.uint8)]), [cv2.IMWRITE_WEBP_QUALITY, 92]):
            raise SystemExit(f"No se pudo escribir el cuadro {i}")
        n += 1
    else:
        prev = None
        tops.append(-1)
    i += 1
# coronilla: rellenar huecos y suavizar
t = np.array(tops, float)
for k in range(len(t)):
    if t[k] < 0:
        t[k] = t[k - 1] if k and t[k - 1] >= 0 else H * 0.2
t = np.convolve(np.pad(t, 4, mode="edge"), np.ones(9) / 9, mode="valid")
multi.close(); simple.close()
(rem / "src" / "mascaras.ts").write_text(f"export const ULTIMA_MASCARA = {i - 1};\nexport const TOPS: number[] = {json.dumps([int(x) for x in t])};\n")
print(f"{n} cuadros recortados de {i} → {out}  ·  src/mascaras.ts")
