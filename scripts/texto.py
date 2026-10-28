#!/usr/bin/env python3
"""Checkpoint de texto: el guion que va a quedar, ANTES de planear escenas o renderizar.

Uso:  texto.py <carpeta edicion-... | reels/<n>> [--modelo2 small] [--sin-segunda]

Lee remotion/src/words.ts (ya cortado) y la toma de cámara (public/cut.mp4 o cam.mp4) y escribe junto al proyecto:
  texto-propuesto.md   el guion con tiempos + lo que hay que revisar (⚠)
  texto-aprobado.txt   el guion en texto plano (si no existe). Es la referencia con la que validar.py compara el final.

Qué marca:
  - Palabra repetida seguida («quieres, quieres») o frase de 3+ palabras dicha dos veces en < 6 s.
  - SEGUNDA OPINIÓN: vuelve a transcribir el audio cortado con otro modelo (por defecto `small`, sin contexto previo)
    y compara palabra por palabra. Donde las dos lecturas no coinciden hay algo dudoso: una palabra comida en un
    corte, una muletilla, un tartamudeo que el primer modelo «limpió» o un nombre mal escrito.
    (En un video real, `medium` leyó «y quieres complementar» y `small` oyó «y quieres, quieres complementar»: era
    el tartamudeo del clip.)
  - Palabras con probabilidad < 0,35 en la segunda lectura.
Los tiempos son de la línea de tiempo YA CORTADA; si existe cut.json / reel.json también da el segundo del ORIGINAL
(el que pide `cut.py --drop` o `reel_prep.py --segments`).

Checkpoint: mostrarle el guion a la persona (o, si dio control total, decidir y anotarlo) antes de seguir.
Para quitar algo: rehacer el corte con --drop (tiempos del original) o, en reels, partir el tramo en --segments.
Nunca se agrega ni se reordena texto: solo se quita o se restaura lo que se dijo.
"""
import argparse, difflib, json, sys, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from proyecto import remotion_dir, camara, leer_palabras, norm, transcribir, audio16k, segunda_lectura


def mapa_original(base):
    """Función t_cortado -> t_original si hay cut.json (video largo) o reel.json (reel)."""
    segs = None
    for f, k in ((base / "cut.json", "segments"), (base / "reel.json", "parts")):
        if f.exists():
            d = json.loads(f.read_text())
            segs = d.get(k)
            if segs:
                break
    if not segs:
        return None
    segs = [(float(a), float(b)) for a, b in segs]

    def f(t):
        acc = 0.0
        for a, b in segs:
            if t <= acc + (b - a):
                return a + (t - acc)
            acc += b - a
        return segs[-1][1]
    return f


def repeticiones(W):
    out = []
    n = [norm(w["w"]) for w in W]
    for i in range(1, len(W)):
        if n[i] and n[i] == n[i - 1] and W[i]["s"] - W[i - 1]["s"] < 1.5:
            out.append((W[i - 1]["s"], W[i]["e"], f"palabra repetida seguida: «{W[i-1]['w']} {W[i]['w']}»"))
    for k in (5, 4, 3):
        for i in range(len(W) - k):
            g = n[i:i + k]
            if not all(g):
                continue
            for j in range(i + 1, min(len(W) - k + 1, i + 40)):
                if W[j]["s"] - W[i]["s"] > 6:
                    break
                if n[j:j + k] == g and j >= i + k:
                    out.append((W[i]["s"], W[j + k - 1]["e"], f"frase dicha dos veces: «{' '.join(w['w'] for w in W[i:i+k])}»"))
    # quitar solapadas (deja la más larga)
    out.sort(key=lambda x: (x[0], -(x[1] - x[0])))
    limpio = []
    for r in out:
        if limpio and r[0] < limpio[-1][1]:
            continue
        limpio.append(r)
    return limpio


def ventanas(W, dur, maxlen=6.0):
    """Tramos de ~2,5–6 s cortados en pausas reales (≥ 0,18 s), sin solapar. Cortos a propósito: con el audio entero
    el modelo «limpia» los tartamudeos guiándose por el contexto."""
    out, a, i = [], 0.0, 1
    while i < len(W):
        # candidatos: pausas dentro de (a+2.5, a+maxlen)
        cands = [k for k in range(i, len(W)) if W[k]["s"] - a <= maxlen + 1.5 and W[k - 1]["e"] - a >= 2.5]
        if not cands or W[-1]["e"] - a <= maxlen:
            break
        buenas = [k for k in cands if W[k]["s"] - W[k - 1]["e"] >= 0.18]
        k = buenas[0] if buenas else max(cands, key=lambda k: W[k]["s"] - W[k - 1]["e"])
        corte = (W[k - 1]["e"] + W[k]["s"]) / 2
        out.append((a, corte)); a = corte; i = k + 1
    out.append((a, (dur or W[-1]["e"]) + 0.2))
    return out


def rafagas(x, s, e):
    """Cuántos golpes de voz separados hay entre s y e (RMS cada 10 ms, umbral = pico del tramo − 22 dB)."""
    import numpy as np
    seg = x[int(s * 16000):int(e * 16000)]
    if len(seg) < 800:
        return 1
    r = np.array([np.sqrt(np.mean(seg[j:j + 320] ** 2)) + 1e-9 for j in range(0, len(seg) - 320, 160)])
    db = 20 * np.log10(r); on = db > db.max() - 22
    n, run, gap = 0, 0, 99
    for v in on:
        if v:
            if run == 0 and gap >= 5:
                n += 1
            run += 1; gap = 0
        else:
            gap += 1
            if gap >= 5:
                run = 0
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("proyecto")
    ap.add_argument("--modelo2", default="small")
    ap.add_argument("--sin-segunda", action="store_true")
    ap.add_argument("--lang", default="es")
    a = ap.parse_args()

    rem = remotion_dir(a.proyecto)
    base = rem.parent
    W, dur, _ = leer_palabras(rem)
    orig = mapa_original(base)
    fmt = lambda t: f"{t:6.2f}s" + (f" (original {orig(t):.2f}s)" if orig else "")

    avisos = [(s, e, d) for s, e, d in repeticiones(W)]
    # palabra «estirada»: una palabra corta que dura mucho y tiene 2+ golpes de voz adentro esconde algo que no se
    # transcribió (un tartamudeo, una palabra repetida, una muletilla)
    import numpy as np, subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(camara(rem)), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    for w in W:
        d = w["e"] - w["s"]
        if len(norm(w["w"])) <= 4 and d > 0.4 and rafagas(x, w["s"] + 0.03, w["e"]) >= 2:
            avisos.append((w["s"], w["e"], f"palabra estirada ({d:.2f} s, con 2+ golpes de voz): «{w['w']}» puede esconder algo que no se transcribió"))
    W2 = []
    if not a.sin_segunda:
        with tempfile.TemporaryDirectory() as td:
            wav = audio16k(camara(rem), Path(td) / "a.wav")
            P1, P2 = segunda_lectura(wav, a.modelo2, a.lang)
        faltan = {}   # palabras del modelo 1 que la segunda lectura no oye: solo cuentan si NINGUNA pasada las oye
        for W2 in (P1, P2):
            W2 = [w for k, w in enumerate(W2) if not w["w"].endswith(("...", "…")) and not (
                k and norm(w["w"]) == norm(W2[k - 1]["w"]) and w["s"] - W2[k - 1]["e"] < 0.05 and w["e"] - w["s"] < 0.25)]
            for s, e, d in repeticiones(W2):
                avisos.append((s, e, "segunda opinión: " + d))
            A = [norm(w["w"]) for w in W]
            B = [norm(w["w"]) for w in W2]
            for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=A, b=B, autojunk=False).get_opcodes():
                if op == "equal":
                    continue
                la = " ".join(w["w"] for w in W[i1:i2]) or "—"
                lb = " ".join(w["w"] for w in W2[j1:j2]) or "—"
                s = W[i1]["s"] if i1 < len(W) else (W2[j1]["s"] if j1 < len(W2) else 0)
                e = W[i2 - 1]["e"] if i2 > i1 else (W2[j2 - 1]["e"] if j2 > j1 else s)
                if op == "replace" and len(la) > 2 and difflib.SequenceMatcher(a=la.lower(), b=lb.lower()).ratio() > 0.8:
                    continue  # misma palabra con otra ortografía/puntuación
                if op == "delete":
                    for i in range(i1, i2):
                        faltan[i] = faltan.get(i, 0) + 1
                    continue
                tipo = {"insert": "la segunda lectura oye palabras de más", "replace": "las dos lecturas no coinciden"}[op]
                avisos.append((s, e, f"{tipo}: modelo 1 «{la}» · modelo 2 «{lb}»"))
            for w in W2:
                if w["p"] < 0.35 and len(norm(w["w"])) > 2:
                    avisos.append((w["s"], w["e"], f"palabra poco segura en la segunda lectura: «{w['w']}» (p={w['p']})"))
        for i, c in sorted(faltan.items()):
            if c == 2 and len(norm(W[i]["w"])) > 1:
                avisos.append((W[i]["s"], W[i]["e"], f"ninguna de las dos lecturas oye «{W[i]['w']}» (¿palabra comida en un corte?)"))
    avisos.sort()
    juntos = []
    for s_, e_, d_ in avisos:   # lo que cae en el mismo punto (±0,4 s) va en una sola línea
        if juntos and s_ <= max(juntos[-1][1], juntos[-1][0]) + 0.4:
            if d_ not in juntos[-1][2]:
                d_ = juntos[-1][2] + " · " + d_
            else:
                d_ = juntos[-1][2]
            juntos[-1] = (juntos[-1][0], max(juntos[-1][1], e_), d_)
        else:
            juntos.append((s_, max(s_, e_), d_))
    avisos = juntos

    # guion por frases
    lineas, cur, t0 = [], [], None
    for w in W:
        if t0 is None:
            t0 = w["s"]
        cur.append(w["w"])
        if w["w"].endswith((".", "?", "!", "…")) or len(cur) >= 16:
            lineas.append((t0, " ".join(cur))); cur, t0 = [], None
    if cur:
        lineas.append((t0, " ".join(cur)))

    md = ["# Texto propuesto", "", f"Duración: {dur or W[-1]['e']:.1f} s · {len(W)} palabras · segunda opinión: "
          + ("no" if a.sin_segunda else a.modelo2), ""]
    md += ["## ⚠ Revisar antes de seguir", ""]
    md += [f"- **{fmt(s)} → {e:.2f}s** · {d}" for s, e, d in avisos] or ["- Nada dudoso: las dos lecturas coinciden y no hay repeticiones."]
    md += ["", "## Guion", ""] + [f"`[{t:6.2f}]` {txt}" for t, txt in lineas]
    (base / "texto-propuesto.md").write_text("\n".join(md) + "\n")
    ap_txt = base / "texto-aprobado.txt"
    if not ap_txt.exists():
        ap_txt.write_text(" ".join(w["w"] for w in W) + "\n")
    print("\n".join(md))
    print(f"\n→ {base / 'texto-propuesto.md'}")
    if avisos:
        print(f"⚠ {len(avisos)} punto(s) para revisar.")


if __name__ == "__main__":
    main()
