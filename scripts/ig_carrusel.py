#!/usr/bin/env python3
"""Baja las láminas (imágenes) y el texto de un carrusel PÚBLICO de Instagram, para convertirlo en video.
Uso: ig_carrusel.py "<url del post>" <carpeta>   →  <carpeta>/01.jpg, 02.jpg… + caption.txt + hoja.jpg

Cómo: yt-dlp solo baja videos, pero con --write-pages guarda la página del post, y ahí vienen las láminas
(`carousel_media` → `image_versions2.candidates[0]`, la de mayor resolución). Necesita yt-dlp (pip install yt-dlp).
Instagram responde 429 (Too Many Requests) a ratos: el script reintenta 4 veces con espera creciente. Si sigue
fallando, pedirle a la persona capturas de las láminas.
Después: LEER cada lámina (la imagen), porque el texto de las láminas no viene en el caption."""
import json, re, shutil, subprocess, sys, tempfile, time
from pathlib import Path

url, out = sys.argv[1], Path(sys.argv[2]).resolve()
out.mkdir(parents=True, exist_ok=True)
tmp = Path(tempfile.mkdtemp())
for intento in range(5):
    r = subprocess.run(["yt-dlp", "--no-warnings", "--skip-download", "--write-pages", "--write-info-json",
                        "-o", str(tmp / "post"), url], cwd=tmp, capture_output=True, text=True)
    dumps = [p for p in tmp.glob("*.dump") if "carousel_media" in p.read_text(errors="ignore")]
    if dumps:
        break
    if intento == 4:
        sys.exit("No se pudo leer el post (¿429 o post privado?):\n" + r.stderr[-400:])
    time.sleep(5 * 2 ** intento)

s = max(dumps, key=lambda p: p.stat().st_size).read_text(errors="ignore")
code = re.search(r"/p/([\w-]+)", url).group(1)
i = s.find(f'"code":"{code}"')  # bloque del post pedido (la página trae también posts relacionados)
j = s.find('"carousel_media":[', max(0, i - 5000)) if i >= 0 else s.find('"carousel_media":[')
blk = s[j:j + 400000]
items = re.split(r'\{"__typename":"XIGPolarisImageMedia"', blk)[1:]
n = 0
for it in items:
    m = re.search(r'"candidates":\[\{"url":"([^"]+)"', it)
    if not m:
        continue
    n += 1
    subprocess.run(["curl", "-sS", "-o", str(out / f"{n:02d}.jpg"), json.loads(f'"{m.group(1)}"')], check=True)
info = next(tmp.glob("*.info.json"), None)
if info:
    d = json.loads(info.read_text())
    (out / "caption.txt").write_text(f"{d.get('uploader', '')} · {d.get('upload_date', '')}\n\n{d.get('description', '')}")
if n:
    (out / "hoja.jpg").unlink(missing_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-pattern_type", "glob", "-i", str(out / "*.jpg"),
                    "-vf", "scale=360:-1,tile=5x2", "-frames:v", "1", str(out / "hoja.jpg")])
shutil.rmtree(tmp, ignore_errors=True)
print(f"{n} láminas en {out}" + ("" if n else " — no se encontraron (¿es un video y no un carrusel?)"))
