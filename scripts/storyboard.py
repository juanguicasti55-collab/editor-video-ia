#!/usr/bin/env python3
"""Storyboard para aprobar ANTES de renderizar: una tarjeta por escena con el fotograma, lo que se dice, los efectos y el sonido.

Uso:
  storyboard.py <carpeta del reel o edicion-...> [storyboard.json]

storyboard.json (lo escribe Claude al planear las escenas, junto a video.tsx; por defecto <carpeta>/storyboard.json):
  {"titulo": "Black R3", "escenas": [
    {"at": 0.5, "nombre": "Gancho", "efectos": "H7 gancho en estudio", "sonido": "whoosh", "nota": "fondo verde de la marca"},
    {"at": 6.2, "efectos": "A12 barra de pedido", "sonido": "pop"}
  ]}
  `at` = segundo del video final (los tiempos de video.tsx). Si falta "dice", se toma de words.ts lo que se oye en esa escena
  (desde su `at` hasta el `at` de la siguiente).

Sale: <carpeta>/remotion/out/storyboard.html (abre en el navegador) y los fotogramas en out/storyboard/.
La persona lo revisa y dice qué cambiar por número de escena («en la 4 cambia el efecto»): se corrige video.tsx y se vuelve
a correr esto (segundos) en vez de renderizar el video entero (minutos). Se renderiza solo con su OK.
"""
import html, json, re, subprocess, sys
from pathlib import Path

if len(sys.argv) < 2:
    sys.exit(__doc__)
work = Path(sys.argv[1]).resolve()
rem = work / "remotion" if (work / "remotion").is_dir() else work
sb_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else work / "storyboard.json"
sb = json.loads(sb_path.read_text())
escenas = sorted(sb["escenas"], key=lambda e: e["at"])

wt = (rem / "src" / "words.ts").read_text()
m = re.search(r"WORDS[^=]*=\s*(\[.*?\]);", wt, re.S)
words = json.loads(m.group(1)) if m else []
dur = float(re.search(r"DURATION\s*=\s*([\d.]+)", wt).group(1)) if "DURATION" in wt else 1e9

out = rem / "out" / "storyboard"
out.mkdir(parents=True, exist_ok=True)
for f in out.glob("*.jpg"):
    f.unlink()
print("Empaquetando una vez…", flush=True)
subprocess.run(["npx", "remotion", "bundle", "src/index.ts", "--out-dir", "out/build", "--log=error"], cwd=rem, check=False)

cards = []
for i, e in enumerate(escenas):
    at = float(e["at"])
    fin = float(escenas[i + 1]["at"]) if i + 1 < len(escenas) else dur
    img = out / f"{i + 1:02d}.jpg"
    subprocess.run(["npx", "remotion", "still", "out/build", "Main", str(img), f"--frame={int(at * 30)}", "--scale=0.4", "--log=error"],
                   cwd=rem, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    dice = e.get("dice") or " ".join(w["w"] for w in words if at - 0.05 <= w["s"] < fin)
    print(f"  {i + 1:02d} · {at:5.1f}s · {e.get('efectos', '')}", flush=True)
    cards.append(f"""
    <article><img src="storyboard/{img.name}" alt="">
      <div class="meta"><b>{i + 1:02d}</b> · {at:.1f}–{fin:.1f} s{(' · ' + html.escape(e['nombre'])) if e.get('nombre') else ''}</div>
      <p class="dice">«{html.escape(dice)}»</p>
      <p><span>Efectos</span>{html.escape(e.get('efectos', '—'))}</p>
      <p><span>Sonido</span>{html.escape(e.get('sonido', '—'))}</p>
      {f'<p><span>Nota</span>{html.escape(e["nota"])}</p>' if e.get('nota') else ''}
    </article>""")

page = f"""<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard · {html.escape(sb.get('titulo', work.name))}</title>
<style>
body{{margin:0;background:#14130f;color:#f4eedf;font:16px/1.4 -apple-system,system-ui,sans-serif;padding:28px}}
h1{{font:400 40px Georgia,serif;margin:0 0 4px}} .sub{{opacity:.6;margin-bottom:24px}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}}
article{{background:#1f1d18;border-radius:12px;overflow:hidden}} img{{width:100%;display:block;aspect-ratio:9/16;object-fit:cover;background:#000}}
.meta{{padding:10px 12px 0;font-size:13px;opacity:.7}} .dice{{font:italic 17px Georgia,serif;margin:6px 12px}}
p{{margin:6px 12px;font-size:14px}} p span{{display:inline-block;width:62px;opacity:.5;font-size:11px;text-transform:uppercase;letter-spacing:1px}}
</style>
<h1>{html.escape(sb.get('titulo', work.name))}</h1>
<div class="sub">{len(escenas)} escenas · {dur:.1f} s · dime qué cambiar por número de escena antes de renderizar</div>
<main>{''.join(cards)}</main></html>"""
dest = rem / "out" / "storyboard.html"
dest.write_text(page)
print(dest)
