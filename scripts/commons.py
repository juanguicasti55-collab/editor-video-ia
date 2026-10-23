"""Busca y baja tomas de apoyo LIBRES de Wikimedia Commons (videos y fotos con licencia clara).
Uso:
  commons.py buscar "Falcon 9 launch" [--video|--foto] [-n 8]   → lista título, tamaño, licencia y autor
  commons.py bajar "File:Nombre.webm" <carpeta destino> [--ancho 1280]  → baja el archivo e imprime el crédito

Solo sirve material con licencia libre (dominio público, CC0, CC BY, CC BY-SA). El crédito que imprime
va en pantalla («Video: U.S. Space Force · dominio público»). Nunca usar sin crédito.
"""
import json, re, sys, urllib.parse, urllib.request
from pathlib import Path

UA = "editor-video-ia/1.0 (https://github.com/juanguicasti55-collab/editor-video-ia)"
API = "https://commons.wikimedia.org/w/api.php?"
LIBRES = re.compile(r"public domain|cc0|cc by|cc-by|pd", re.I)


def api(**q):
    q["format"] = "json"
    req = urllib.request.Request(API + urllib.parse.urlencode(q), headers={"User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=30))


def info(title, ancho=None):
    q = dict(action="query", prop="imageinfo", iiprop="url|size|extmetadata", titles=title)
    if ancho:
        q["iiurlwidth"] = ancho
    p = next(iter(api(**q)["query"]["pages"].values()))
    if "imageinfo" not in p:
        return None
    i = p["imageinfo"][0]
    m = i["extmetadata"]
    autor = re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip()
    return {
        "titulo": p["title"], "w": i.get("width"), "h": i.get("height"), "dur": round(i.get("duration") or 0),
        "licencia": m.get("LicenseShortName", {}).get("value", "?"), "autor": autor[:80],
        "url": (i.get("thumburl") if ancho and "thumburl" in i else i["url"]).split("?")[0],
    }


def buscar(texto, tipo, n):
    mime = {"video": " filemime:video/webm", "foto": " filemime:image/jpeg"}.get(tipo, "")
    r = api(action="query", list="search", srnamespace=6, srlimit=n, srsearch=texto + mime)
    for x in r["query"]["search"]:
        d = info(x["title"])
        if not d:
            continue
        ok = "✓" if LIBRES.search(d["licencia"]) else "✗"
        extra = f"{d['dur']}s" if d["dur"] else ""
        print(f"{ok} {d['titulo']} | {d['w']}x{d['h']} {extra} | {d['licencia']} | {d['autor']}")


def bajar(title, dest, ancho):
    d = info(title, ancho)
    if not d:
        sys.exit("NO_EXISTE")
    if not LIBRES.search(d["licencia"]):
        sys.exit(f"LICENCIA_NO_LIBRE: {d['licencia']}")
    Path(dest).mkdir(parents=True, exist_ok=True)
    nombre = Path(urllib.parse.unquote(d["url"].split("/")[-1])).name
    out = Path(dest) / re.sub(r"[^\w.\-]+", "_", nombre)
    req = urllib.request.Request(d["url"], headers={"User-Agent": UA})
    out.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    print(out)
    print(f"CRÉDITO: {d['autor']} · {d['licencia']} (Wikimedia Commons)")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "buscar":
        tipo = "video" if "--video" in a else "foto" if "--foto" in a else ""
        n = int(a[a.index("-n") + 1]) if "-n" in a else 8
        buscar(a[1], tipo, n)
    elif len(a) >= 3 and a[0] == "bajar":
        ancho = int(a[a.index("--ancho") + 1]) if "--ancho" in a else None
        bajar(a[1], a[2], ancho)
    else:
        print(__doc__)
