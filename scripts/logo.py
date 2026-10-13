#!/usr/bin/env python3
"""Consigue el logo OFICIAL de una herramienta y lo deja en remotion/public/logos/<slug>.<ext>.

Uso:  logo.py <carpeta edicion-...> <slug> [--name "Nombre visible"] [--domain sitio.com]

Orden de búsqueda (se queda con el primero que encuentre):
  1. Biblioteca propia del skill  assets/logos/<slug>.svg|png   (ya verificados)
  2. svgl.app  (logos de marca en SVG, prefiere la variante para fondo oscuro)
  3. simple-icons  (SVG monocromo, se pinta en blanco)
  4. Sitio oficial (--domain): <img> SVG cuyo alt es el nombre, o apple-touch-icon >= 128 px
Si lo encuentra en 2-4 lo guarda también en la biblioteca del skill para la próxima vez.
Imprime la ruta pública ("logos/x.svg") o NOT_FOUND. SIEMPRE revisar el logo en un fotograma:
las fuentes 2-4 pueden traer una variante equivocada (color, versión vieja, otra marca).
"""
import argparse, json, re, shutil, struct, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
LIB = SKILL / "assets" / "logos"
UA = {"User-Agent": "Mozilla/5.0"}
# alias habituales → logo real
ALIAS = {"chatgpt": "openai", "gpt": "openai", "ghl": "gohighlevel", "highlevel": "gohighlevel",
         "claudecode": "claude", "claude-code": "claude"}


def get(url, timeout=15, tries=3):
    import time
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read(), r.headers.get("content-type", "")
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(1.5 * (i + 1))


def png_size(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    return (0, 0)


def from_svgl(name):
    try:
        data, _ = get("https://api.svgl.app?search=" + urllib.parse.quote(name))
        items = json.loads(data)
    except Exception:
        return None
    if not isinstance(items, list):
        return None
    norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    # coincidencia estricta: título igual, o que empiece con el nombre + espacio ("Claude AI").
    # Nada de "contiene": "make" encontraba "FrameMaker".
    def ok(title):
        return norm(title) == norm(name) or title.lower().startswith(name.lower() + " ")
    for it in items:
        if ok(it.get("title", "")):
            route = it.get("route")
            url = route.get("dark") or route.get("light") if isinstance(route, dict) else route
            try:
                return get(url)[0], "svg"
            except Exception:
                return None
    return None


def from_simple_icons(slug):
    base = SKILL / "engine" / "node_modules" / "simple-icons"
    p = base / "icons" / f"{slug}.svg"
    if not p.exists():
        return None
    # color oficial de la marca si se lee sobre fondo oscuro; si es muy oscuro, blanco
    fill = "white"
    for f in (base / "data" / "simple-icons.json", base / "_data" / "simple-icons.json"):
        if f.exists():
            data = json.loads(f.read_text())
            icons = data["icons"] if isinstance(data, dict) else data
            for ic in icons:
                if ic.get("slug") == slug or re.sub(r"[^a-z0-9]", "", ic.get("title", "").lower()) == slug:
                    h = ic["hex"]
                    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
                    if 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3:
                        fill = "#" + h
                    break
            break
    svg = p.read_text().replace("<svg ", f'<svg fill="{fill}" ', 1)
    return svg.encode(), "svg"


def from_site(domain, name):
    try:
        html = get("https://" + domain)[0].decode("utf-8", "ignore")
    except Exception:
        return None
    for tag in re.findall(r"<img[^>]*>", html, re.I):
        alt = re.search(r'alt="([^"]*)"', tag, re.I)
        src = re.search(r'src="([^"]+\.svg)"', tag, re.I)
        if alt and src and name.lower() in alt.group(1).lower():
            u = src.group(1)
            m = re.search(r"/u_(https?://.+\.svg)", u)  # desenvolver CDNs de optimización
            u = m.group(1) if m else urllib.parse.urljoin("https://" + domain, u)
            try:
                return get(u)[0], "svg"
            except Exception:
                pass
    for href in re.findall(r'<link[^>]*rel="apple-touch-icon[^"]*"[^>]*href="([^"]+)"', html, re.I):
        try:
            b = get(urllib.parse.urljoin("https://" + domain, href))[0]
            if min(png_size(b)) >= 128:
                return b, "png"
        except Exception:
            pass
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("work"); ap.add_argument("slug")
    ap.add_argument("--name"); ap.add_argument("--domain")
    a = ap.parse_args()
    slug = ALIAS.get(a.slug.lower(), a.slug.lower())
    name = a.name or slug
    out_dir = Path(a.work).expanduser().resolve() / "remotion" / "public" / "logos"
    out_dir.mkdir(parents=True, exist_ok=True)

    for ext in ("svg", "png"):
        p = LIB / f"{slug}.{ext}"
        if p.exists():
            shutil.copy(p, out_dir / p.name)
            print(f"logos/{p.name}  (biblioteca)"); return

    for fn, src in ((lambda: from_svgl(name), "svgl"), (lambda: from_simple_icons(slug), "simple-icons"),
                    (lambda: from_site(a.domain, name) if a.domain else None, "sitio oficial")):
        r = fn()
        if r:
            data, ext = r
            (out_dir / f"{slug}.{ext}").write_bytes(data)
            LIB.mkdir(parents=True, exist_ok=True)
            (LIB / f"{slug}.{ext}").write_bytes(data)
            print(f"logos/{slug}.{ext}  ({src}) — revisar en un fotograma"); return
    print("NOT_FOUND")


if __name__ == "__main__":
    main()
