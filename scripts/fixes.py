"""Correcciones de transcripción: nombres de herramientas que Whisper suele escuchar mal.
Agrega aquí los errores recurrentes de TUS videos (tu nombre, tu marca, tus herramientas).
Se aplica en cut.py y reel_prep.py. Agregar aquí los nuevos errores recurrentes."""
import re

# secuencias de palabras (minúsculas, sin puntuación) → reemplazo
MULTI = [
    (["go", "high", "level"], "GoHighLevel"),
    (["go", "hay", "level"], "GoHighLevel"),
    (["gog", "level"], "GoHighLevel"),
    (["go", "g", "level"], "GoHighLevel"),
    (["google", "g-level"], "GoHighLevel"),
    (["high", "level"], "HighLevel"),
    (["cloud", "cowork"], "Claude Cowork"),
]
SINGLE = {
    "cloud": "Claude", "clod": "Claude", "gojalevel": "GoHighLevel", "gohighlevel": "GoHighLevel",
    "8n": "n8n", "ene8ene": "n8n", "vídeo": "video",
    "heightfield": "Higgsfield",
}


def _norm(w):
    return re.sub(r"[^\wáéíóúñü-]", "", w.lower())


def _trail(w):
    m = re.search(r"[.,;:?!]+$", w)
    return m.group(0) if m else ""


def fix_words(words):
    out, i = [], 0
    while i < len(words):
        done = False
        for seq, rep in MULTI:
            n = len(seq)
            if [_norm(x["w"]) for x in words[i:i + n]] == seq:
                out.append({"w": rep + _trail(words[i + n - 1]["w"]), "s": words[i]["s"], "e": words[i + n - 1]["e"]})
                i += n; done = True; break
        if done:
            continue
        w = dict(words[i]); k = _norm(w["w"])
        if k in SINGLE:
            lead = "¿" if w["w"].startswith("¿") else ""
            w["w"] = lead + SINGLE[k] + _trail(w["w"])
        out.append(w); i += 1
    return out
