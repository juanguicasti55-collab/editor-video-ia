#!/usr/bin/env python3
"""Baja fuentes de Google Fonts a <proyecto remotion>/public/fonts y escribe src/fuentes.ts (lista para theme.ts).
Hace falta porque el Chrome del render a veces no puede bajar de fonts.gstatic.com (proxy o certificados:
ERR_CERT_AUTHORITY_INVALID / "Failed to fetch"). curl sí puede. Resultado: el render no depende de internet.
Uso: fuentes.py <carpeta remotion> ["<familias en formato css2>"]
Por defecto: Cormorant Garamond 600/700 + cursiva 600, Jost 400-800, JetBrains Mono 500.
Si cambias de familias, cambia también SERIF/TITLE/MONO en src/theme.ts."""
import json, re, subprocess, sys
from pathlib import Path

DEF = "family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@400;500;700;800&family=JetBrains+Mono:wght@500"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"  # sin UA moderno no da woff2

rem = Path(sys.argv[1]).resolve()
q = sys.argv[2] if len(sys.argv) > 2 else DEF
out = rem / "public" / "fonts"; out.mkdir(parents=True, exist_ok=True)
css = subprocess.run(["curl", "-sS", "-A", UA, f"https://fonts.googleapis.com/css2?{q}&display=block"],
                     check=True, capture_output=True, text=True).stdout
fonts = []
for sub, b in re.findall(r"/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}", css, re.S):
    if sub not in ("latin", "latin-ext"):  # español: latin + latin-ext alcanza
        continue
    fam = re.search(r"font-family: '([^']+)'", b).group(1)
    st = re.search(r"font-style: (\w+)", b).group(1)
    wt = re.search(r"font-weight: (\d+)", b).group(1)
    url = re.search(r"url\((https://[^)]+)\)", b).group(1)
    ur = re.search(r"unicode-range: ([^;]+);", b).group(1)
    fn = f"{fam.replace(' ', '')}-{st}-{wt}-{sub}.woff2"
    subprocess.run(["curl", "-sS", "-o", str(out / fn), url], check=True)
    fonts.append([fam, st, wt, fn, ur])
ts = "// Generado por scripts/fuentes.py — no editar a mano.\nexport const FONTS: [string, string, string, string, string][] = "
(rem / "src" / "fuentes.ts").write_text(ts + json.dumps(fonts, ensure_ascii=False, indent=1) + ";\n")
print(f"{len(fonts)} archivos de fuente en {out}")
print("Familias:", ", ".join(sorted({f[0] for f in fonts})))
