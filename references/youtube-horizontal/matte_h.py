#!/usr/bin/env python3
"""Recorta a la persona del fondo para poder poner texto o imágenes DETRÁS de ella.
Uso (con el Python de .venv-matte):  matte.py <carpeta del reel> [--ss inicio --t duración --out fg_1.webm]
Recortar solo los tramos donde va algo detrás (un archivo por tramo): es lento (~0,3 s por fotograma).
Lee remotion/public/cam.mp4 y escribe remotion/public/fg.webm (misma duración y tamaño, con transparencia).
En Remotion: cámara → texto → <OffthreadVideo transparent src=fg.webm> con el mismo encuadre (ver CamBehind en mg.tsx).
Revisar siempre con fotogramas: pelo suelto, manos rápidas y objetos en la mano pueden recortarse mal."""
import argparse, subprocess, sys
from pathlib import Path
import numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
SKILL = Path.home() / ".claude/skills/editor-video-ia"
ap = argparse.ArgumentParser(); ap.add_argument("reel"); ap.add_argument("--src", default="cut.mp4"); ap.add_argument("--out", default="fg.webm")
ap.add_argument("--ss", type=float, default=0, help="segundo de inicio dentro de cam.mp4"); ap.add_argument("--t", type=float, default=0, help="duración (0 = hasta el final)")
a = ap.parse_args()
pub = Path(a.reel) / "remotion" / "public"; src = pub / a.src
W, H, FPS = 1920, 1080, 30
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpp.BaseOptions(model_asset_path=str(SKILL / "assets/models/selfie_segmenter.tflite")),
    running_mode=vision.RunningMode.VIDEO, output_confidence_masks=True))
rng = (["-ss", f"{a.ss:.3f}"] if a.ss else []) + (["-t", f"{a.t:.3f}"] if a.t else [])
dec = subprocess.Popen(["ffmpeg", "-v", "error", *rng, "-i", str(src), "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "30", "-deadline", "realtime", "-cpu-used", "6", "-row-mt", "1",
                        "-auto-alt-ref", "0", "-an", str(pub / a.out)], stdin=subprocess.PIPE)
n = 0; prev = None
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    small = cv2.resize(rgb, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    res = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(small)), int(n * 1000 / FPS))
    m = res.confidence_masks[0].numpy_view().astype(np.float32)
    if m.ndim == 3: m = m[:, :, 0]
    if prev is not None: m = 0.65 * m + 0.35 * prev   # suaviza el parpadeo entre fotogramas
    prev = m
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    m = np.clip((m - 0.35) / 0.4, 0, 1)                # borde más firme
    m = cv2.GaussianBlur(m, (0, 0), 2.2)
    rgba = np.dstack([rgb, (m * 255).astype(np.uint8)])
    enc.stdin.write(rgba.tobytes()); n += 1
    if n % 300 == 0: print(f"  {n} fotogramas…", flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print(f"Listo: {pub / a.out} ({n} fotogramas, {n / FPS:.1f}s)")
