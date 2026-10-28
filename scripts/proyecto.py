"""Utilidades compartidas: ubicar el proyecto Remotion de una edición y leer/escribir sus palabras.

Acepta cualquiera de estas rutas:  edicion-<slug>/  ·  edicion-<slug>/reels/<n>/  ·  .../remotion/
"""
import json, re, subprocess, unicodedata
from pathlib import Path

CAMARAS = ("cam.mp4", "cut.mp4")


def remotion_dir(ruta):
    p = Path(ruta).expanduser().resolve()
    for c in (p, p / "remotion"):
        if (c / "src" / "words.ts").exists():
            return c
    raise SystemExit(f"No encuentro remotion/src/words.ts en {p}")


def camara(rem):
    for n in CAMARAS:
        f = rem / "public" / n
        if f.exists():
            return f
    raise SystemExit(f"No encuentro la toma de cámara (public/cam.mp4 o public/cut.mp4) en {rem}")


_WORDS = re.compile(r"(export const WORDS[^=]*=\s*)(\[.*?\])(\s*;)", re.S)
_DUR = re.compile(r"(export const DURATION\s*=\s*)([0-9.]+)")


def leer_palabras(rem):
    src = (rem / "src" / "words.ts").read_text()
    m = _WORDS.search(src)
    if not m:
        raise SystemExit("words.ts no tiene 'export const WORDS = [...]'")
    d = _DUR.search(src)
    return json.loads(m.group(2)), (float(d.group(2)) if d else None), src


def escribir_palabras(rem, words, dur, src):
    src = _WORDS.sub(lambda m: m.group(1) + json.dumps(words, ensure_ascii=False) + m.group(3), src)
    if dur is not None:
        src = _DUR.sub(lambda m: m.group(1) + f"{dur:.3f}", src)
    (rem / "src" / "words.ts").write_text(src)


_NUM = {"0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete",
        "8": "ocho", "9": "nueve", "10": "diez", "un": "uno", "una": "uno"}


def norm(w):
    w = unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode()
    w = re.sub(r"[^a-z0-9]", "", w)
    return _NUM.get(w, w)


def duracion(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))


def transcribir(audio, modelo="small", lang="es", ventanas=None, **kw):
    """Palabras [{w,s,e,p}] con faster-whisper. `p` = probabilidad de la palabra.

    ventanas = [(desde, hasta), ...]: transcribe cada tramo POR SEPARADO (sin el contexto del resto). Así el modelo no
    «limpia» un tartamudeo o una palabra repetida guiándose por lo que viene antes, que es lo que pasa con el audio entero.
    """
    import numpy as np
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    if not ventanas:
        segs, _ = m.transcribe(str(audio), language=lang, word_timestamps=True, condition_on_previous_text=False, **kw)
        return [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)} for s in segs for w in s.words]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    out = []
    for a, b in ventanas:
        i0, i1 = max(0, int(a * 16000)), min(len(x), int(b * 16000))
        if i1 - i0 < 1600:
            continue
        segs, _ = m.transcribe(x[i0:i1], language=lang, word_timestamps=True, condition_on_previous_text=False, **kw)
        for s in segs:
            for w in s.words:
                out.append({"w": w.word.strip(), "s": round(a + w.start, 3), "e": round(a + w.end, 3), "p": round(w.probability, 3)})
    return out


def audio16k(video, destino):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-ac", "1", "-ar", "16000", str(destino)], check=True)
    return destino


def leer_audio(f):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def ventanas_silencio(x, min_len=2.5, max_len=6.0, desfase=0.0):
    """Tramos de min_len–max_len s cortados en silencios REALES del audio (RMS cada 10 ms, < pico − 32 dB durante
    ≥ 0,12 s), sin solapar, para que ninguna palabra quede partida. `desfase` corre la grilla (segunda pasada)."""
    import numpy as np
    hop = 160
    r = np.array([np.sqrt(np.mean(x[j:j + 320] ** 2)) + 1e-9 for j in range(0, max(1, len(x) - 320), hop)])
    db = 20 * np.log10(r); calla = db < np.percentile(db, 98) - 32
    centros, k = [], 0
    while k < len(calla):
        if calla[k]:
            j = k
            while j < len(calla) and calla[j]:
                j += 1
            if j - k >= 12:
                centros.append((k + j) / 2 * hop / 16000)
            k = j
        else:
            k += 1
    total = len(x) / 16000
    out, a = [], desfase if desfase and centros else 0.0
    if desfase:   # arrancar en el silencio más cercano al desfase
        a = min(centros, key=lambda c: abs(c - desfase)) if centros else 0.0
        out.append((0.0, a))
    while total - a > max_len:
        cand = [c for c in centros if a + min_len <= c <= a + max_len]
        c = cand[-1] if cand else next((c for c in centros if c > a + max_len), total)
        out.append((a, c)); a = c
    out.append((a, total))
    return [(s, e) for s, e in out if e - s > 0.3]


def segunda_lectura(audio, modelo="small", lang="es"):
    """Dos pasadas de `modelo` sobre ventanas cortas distintas (grilla corrida ~3 s). Whisper oye distinto según el
    contexto de la ventana: con dos pasadas se escapan menos tartamudeos y palabras repetidas."""
    x = leer_audio(audio)
    v1 = ventanas_silencio(x)
    v2 = ventanas_silencio(x, desfase=3.0)
    return transcribir(audio, modelo, lang, ventanas=v1, beam_size=5), transcribir(audio, modelo, lang, ventanas=v2, beam_size=5)
