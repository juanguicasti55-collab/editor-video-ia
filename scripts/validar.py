#!/usr/bin/env python3
"""Valida un render con reglas fijas, antes de entregarlo. Dice «cumple X de Y reglas (Z N/A)».

Uso:  validar.py <carpeta edicion-... | reels/<n>> <final.mp4> [--cada 1.0] [--texto texto-aprobado.txt]
                 [--sin-texto] [--permitir-cara] [--sin-zona]

Reglas (cada FALLA dice el segundo y por qué; los AVISOS no bloquean pero hay que mirarlos):
  R1 Formato: H.264 + AAC, 30 fps, tamaño de la composición (vertical 1080×1920 / horizontal 1920×1080 o múltiplos).
  R2 Cuadros y sincronía: cuadros = duración × fps (±1) y audio vs video a ≤ 2 cuadros.
  R3 Sonoridad: −14 ±1 LUFS integrados y pico real ≤ −1 dBTP (estándar de Instagram / YouTube).
  R4 Sin negros ni congelados: nada negro ≥ 0,4 s ni imagen congelada ≥ 2 s (salvo los últimos 3,5 s: tarjeta final).
  R5 Texto: el audio dice el texto aprobado (texto-aprobado.txt, de texto.py): sin palabras que falten, sin palabras
     repetidas seguidas. Lo transcribe dos veces en tramos cortos (modelo small). Usa la voz SIN música (voz_sfx.wav,
     que deja render.sh): con música Whisper oye peor.
  R6 Cara: nada tapa la boca (FALLA) ni los ojos (AVISO), salvo --permitir-cara (el estilo lo permite).
  R7 Zona segura de Reels (solo vertical): nada importante en la franja de arriba (y < 210), abajo (y > 1600) ni en la
     columna de botones de la derecha (x > 945 entre y 1000 y 1600). Se ignoran las pantallas completas (tarjeta final).
Cómo encuentra lo que está encima de la cámara (R6 y R7): alinea la toma de cámara (public/cam.mp4 o cut.mp4) con el
cuadro final (ECC, cubre zooms y desplazamientos) y marca los bordes que están en uno y no en el otro: textos, tarjetas
y stickers. Sombras, destellos y cambios de brillo no cuentan. Los cuadros que no se pueden alinear (transiciones,
pantalla dividida muy distinta) quedan N/A.

Escribe junto al proyecto validacion.md y validacion-avisos.jpg (los cuadros con problema, marcados).
Sale con 0 si no falla nada, 2 si falla alguna regla.
Idea tomada de video-editor-architect (MIT, Enrique Rocha): validar con reglas fijas y reportar «cumple X de Y».
"""
import argparse, difflib, json, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from proyecto import remotion_dir, camara, leer_palabras, norm, segunda_lectura

FPS = 30


def probe(f):
    d = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-count_packets", "-show_entries",
                                            "stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_packets,duration",
                                            "-show_entries", "format=duration", "-of", "json", str(f)]))
    v = next(s for s in d["streams"] if s["codec_type"] == "video")
    a = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
    return v, a, float(d["format"]["duration"])


def frame(f, t, w, h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(f), "-frames:v", "1", "-vf", f"scale={w}:{h}",
                          "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).copy() if len(raw) == w * h * 3 else None


def capas(fin, cam):
    """Máscara de lo que está ENCIMA de la cámara en el cuadro final + cámara alineada. None si no se puede alinear."""
    gf = cv2.GaussianBlur(cv2.cvtColor(fin, cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32) / 255
    gc = cv2.GaussianBlur(cv2.cvtColor(cam, cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32) / 255
    warp = np.eye(2, 3, dtype=np.float32)
    try:  # primero a 1/4 y luego a tamaño completo
        s = 0.25
        w4 = warp.copy()
        cc, w4 = cv2.findTransformECC(cv2.resize(gf, None, fx=s, fy=s), cv2.resize(gc, None, fx=s, fy=s), w4,
                                      cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-5), None, 3)
        warp = w4.copy(); warp[:, 2] /= s
        cc, warp = cv2.findTransformECC(gf, gc, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 1e-5), None, 5)
    except cv2.error:
        return None, None, 0
    h, w = gf.shape
    al = cv2.warpAffine(cam, warp, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    valido = cv2.warpAffine(np.ones((h, w), np.uint8), warp, (w, h), flags=cv2.INTER_NEAREST + cv2.WARP_INVERSE_MAP) > 0
    ga = cv2.GaussianBlur(cv2.cvtColor(al, cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32) / 255
    cc = float(np.corrcoef(gf[valido].ravel(), ga[valido].ravel())[0, 1]) if valido.mean() > 0.3 else 0
    ef = cv2.GaussianBlur(np.abs(cv2.Laplacian(gf, cv2.CV_32F, ksize=3)), (7, 7), 0)
    ea = cv2.GaussianBlur(np.abs(cv2.Laplacian(ga, cv2.CV_32F, ksize=3)), (7, 7), 0)
    m = (ef > 0.05) & (ef > 3.0 * ea + 0.02)          # bordes fuertes que la cámara no tiene: texto, tarjetas, stickers
    m |= ~valido  # fuera de la cámara (cámara achicada, tarjeta que la tapa entera)
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    out = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= 220:
            out[lab == i] = 1
    return out.astype(bool), al, cc


_CASCADA = (cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
            if hasattr(cv2, "CascadeClassifier") else None)   # OpenCV 5 lo sacó: setup.sh instala opencv < 5


def cara(img):
    if _CASCADA is None:
        return None
    g = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    fs = _CASCADA.detectMultiScale(g, 1.1, 6, minSize=(img.shape[1] // 10, img.shape[1] // 10))
    return max(fs, key=lambda r: r[2] * r[3]) if len(fs) else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("proyecto"); ap.add_argument("final")
    ap.add_argument("--cada", type=float, default=1.0)
    ap.add_argument("--texto"); ap.add_argument("--sin-texto", action="store_true")
    ap.add_argument("--permitir-cara", action="store_true"); ap.add_argument("--sin-zona", action="store_true")
    ap.add_argument("--audio", help="audio SIN música para R5 (por defecto voz_sfx.wav de render.sh si existe; si no, el final)")
    a = ap.parse_args()
    rem = remotion_dir(a.proyecto); base = rem.parent; fin = Path(a.final).expanduser().resolve()
    R = {}            # regla -> (estado, detalle)
    avisos = []       # (t, texto)
    marcados = {}     # t -> lista de (rect, color, etiqueta)

    # R1 formato · R2 cuadros
    v, au, dur = probe(fin)
    W_, H_ = int(v["width"]), int(v["height"])
    num, den = map(int, v["r_frame_rate"].split("/")); fps = num / den
    vertical = H_ > W_
    prob = []
    if v["codec_name"] != "h264": prob.append(f"video {v['codec_name']} (debe ser h264)")
    if not au or au["codec_name"] != "aac": prob.append("sin audio AAC")
    if abs(fps - FPS) > 0.01: prob.append(f"{fps:.2f} fps (debe ser 30)")
    if (W_, H_) not in ((1080, 1920), (1920, 1080), (1440, 2560), (2560, 1440), (2160, 3840), (3840, 2160)):
        prob.append(f"tamaño {W_}×{H_}")
    R["R1 formato"] = ("FALLA" if prob else "PASA", "; ".join(prob) or f"h264 + aac · {W_}×{H_} · 30 fps")
    nfr = int(v.get("nb_read_packets") or 0); vd = float(v.get("duration") or dur); ad = float(au["duration"]) if au else 0
    prob = []
    if nfr and abs(nfr - round(vd * FPS)) > 1: prob.append(f"{nfr} cuadros para {vd:.2f} s")
    if au and abs(ad - vd) > 2 / FPS + 0.03: prob.append(f"audio {ad:.2f} s vs video {vd:.2f} s")
    R["R2 cuadros y sincronía"] = ("FALLA" if prob else "PASA", "; ".join(prob) or f"{nfr} cuadros · audio vs video {abs(ad - vd) * 1000:.0f} ms")

    # R3 sonoridad
    eb = subprocess.run(["ffmpeg", "-nostats", "-i", str(fin), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[0-9.]+) LUFS", eb); TP = re.findall(r"Peak:\s+(-?[0-9.]+) dBFS", eb)
    if I:
        i_, tp = float(I[-1]), float(TP[-1]) if TP else None
        prob = ([f"{i_} LUFS (debe ser −14 ±1)"] if abs(i_ + 14) > 1 else []) + ([f"pico {tp} dBTP (máx −1)"] if tp is not None and tp > -1 else [])
        R["R3 sonoridad"] = ("FALLA" if prob else "PASA", "; ".join(prob) or f"{i_} LUFS · pico {tp} dBTP")
    else:
        R["R3 sonoridad"] = ("N/A", "no se pudo medir")

    # R4 negros y congelados
    lim = max(0, dur - 3.5)
    log = subprocess.run(["ffmpeg", "-nostats", "-i", str(fin), "-t", f"{lim:.2f}", "-vf",
                          "blackdetect=d=0.4:pix_th=0.10,freezedetect=n=-55dB:d=2", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    negros = re.findall(r"black_start:([0-9.]+) black_end:([0-9.]+)", log)
    cong = re.findall(r"freeze_start: ([0-9.]+)", log)
    prob = [f"negro {float(s):.1f}–{float(e):.1f} s" for s, e in negros] + [f"congelado desde {float(s):.1f} s" for s in cong]
    R["R4 negros y congelados"] = ("FALLA" if prob else "PASA", "; ".join(prob) or "ninguno")

    # R5 texto
    if a.sin_texto:
        R["R5 texto"] = ("N/A", "--sin-texto")
    else:
        ref = Path(a.texto) if a.texto else base / "texto-aprobado.txt"
        if not ref.exists():
            R["R5 texto"] = ("N/A", f"falta {ref.name}: correr texto.py antes de renderizar")
        else:
            esperado = [w for w in ref.read_text().split() if norm(w)]
            A = [norm(w) for w in esperado]
            voz = Path(a.audio) if a.audio else next((p_ for p_ in (base / "voz_sfx.wav", base.parent / "voz_sfx.wav") if p_.exists()), fin)
            if voz == fin:
                avisos.append((0, "R5 se transcribió el final CON música: la música con voz puede tapar repeticiones (pasa --audio voz_sfx.wav)"))
            pasadas = segunda_lectura(voz)
            limpio = lambda P: [w for k, w in enumerate(P) if not w["w"].endswith(("...", "…"))]
            faltan_por = []; rep = {}; sobran = {}
            for P in map(limpio, pasadas):
                B = [norm(w["w"]) for w in P]
                f = {}
                for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=A, b=B, autojunk=False).get_opcodes():
                    if op == "delete" or (op == "replace" and difflib.SequenceMatcher(
                            a=" ".join(esperado[i1:i2]).lower(), b=" ".join(w["w"] for w in P[j1:j2]).lower()).ratio() <= 0.75):
                        t0 = P[min(j1, len(P) - 1)]["s"] if P else 0
                        for i in range(i1, i2):
                            f[i] = t0
                    if op == "insert":
                        sobran[round(P[j1]["s"], 1)] = " ".join(w["w"] for w in P[j1:j2])
                faltan_por.append(f)
                for k in range(1, len(P)):
                    if B[k] and B[k] == B[k - 1] and P[k]["s"] - P[k - 1]["e"] < 0.6:
                        rep[round(P[k]["s"], 1)] = P[k]["w"]
            faltan = sorted((faltan_por[0][i], esperado[i]) for i in faltan_por[0] if i in faltan_por[1] and len(A[i]) > 1)
            rep = sorted(rep.items()); rep = [r for k_, r in enumerate(rep) if not k_ or r[0] - rep[k_ - 1][0] > 1]
            prob = [f"{t:.1f}s no se oye «{x}»" for t, x in faltan] + [f"{t:.1f}s repite «{w}»" for t, w in rep]
            for t, x in sorted(sobran.items()):
                if not any(abs(t - r) < 1 for r, _ in rep):
                    avisos.append((t, f"R5 se oye «{x}» que no está en el texto aprobado (¿muletilla, música con voz o error de lectura?)"))
            R["R5 texto"] = ("FALLA" if prob else "PASA", "; ".join(prob[:12]) + (" …" if len(prob) > 12 else "") or f"{len(esperado)} palabras, coinciden (2 lecturas)")

    # R6 cara · R7 zona segura (muestreo de cuadros)
    try:
        cam = camara(rem)
    except SystemExit:
        cam = None
    w, h = (540, 960) if vertical else (960, 540)
    sx, sy = 1080 / w if vertical else 1920 / w, 1920 / h if vertical else 1080 / h
    boca, ojos, zona, na, revisados = [], [], [], 0, 0
    t = 0.5
    cam_dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(cam)])) if cam else 0
    while t < min(dur, cam_dur) - 0.1:
        F = frame(fin, t, w, h); Cm = frame(cam, t, w, h)
        t_ = round(t, 2); t += a.cada
        if F is None or Cm is None:
            na += 1; continue
        m, al, cc = capas(F, Cm)
        if m is None or cc < 0.6:
            na += 1; continue
        revisados += 1
        if m.mean() > 0.6:      # pantalla completa (tarjeta final, fondo de color): no se revisa
            continue
        r = cara(al)
        if r is not None and not a.permitir_cara:
            x, y, fw, fh = r
            zb = m[y + int(.62 * fh):y + int(.98 * fh), x + int(.25 * fw):x + int(.75 * fw)]
            zo = m[y + int(.22 * fh):y + int(.5 * fh), x + int(.15 * fw):x + int(.85 * fw)]
            if zb.size and zb.mean() > 0.12:
                boca.append(t_); marcados.setdefault(t_, []).append(((x, y + int(.62 * fh), fw, int(.36 * fh)), (0, 0, 255), "boca"))
            elif zo.size and zo.mean() > 0.2:
                ojos.append(t_); marcados.setdefault(t_, []).append(((x, y, fw, int(.5 * fh)), (0, 165, 255), "ojos"))
        if vertical and not a.sin_zona:
            Y = lambda v_: int(v_ / sy); X = lambda v_: int(v_ / sx)
            zonas = {"arriba (y<210)": m[:Y(210), :], "abajo (y>1600)": m[Y(1600):, :], "botones derecha": m[Y(1000):Y(1600), X(945):]}
            for nombre, z in zonas.items():
                if z.sum() > 350:
                    zona.append((t_, nombre)); marcados.setdefault(t_, []).append((None, (255, 0, 255), nombre))
    if revisados == 0:
        por = "no hay toma de cámara (motion graphics)" if cam is None else "no se pudo alinear ningún cuadro"
        R["R6 cara"] = ("N/A", por); R["R7 zona segura"] = ("N/A", por)
    else:
        if a.permitir_cara:
            R["R6 cara"] = ("N/A", "el estilo permite tapar la cara (--permitir-cara)")
        else:
            R["R6 cara"] = ("FALLA" if boca else "PASA", (f"algo tapa la boca en {', '.join(f'{x}s' for x in boca)}" if boca else
                                                          f"boca libre en {revisados} cuadros revisados ({na} N/A)"))
            avisos += [(x, "R6 algo tapa los ojos o la frente") for x in ojos]
        if not vertical or a.sin_zona:
            R["R7 zona segura"] = ("N/A", "solo aplica a verticales" if not vertical else "--sin-zona")
        else:
            avisos += [(x, f"R7 hay capas en la zona que tapa la interfaz de Reels: {z}") for x, z in zona]
            R["R7 zona segura"] = ("PASA", f"{len(zona)} aviso(s) de zona en {revisados} cuadros" if zona else f"zona libre en {revisados} cuadros")

    # hoja de avisos
    if marcados:
        tiles = []
        for t_, marcas in sorted(marcados.items())[:24]:
            img = frame(fin, t_, w // 2, h // 2)
            if img is None:
                continue
            for rect, col, lab in marcas:
                if rect:
                    x, y, rw, rh = [v_ // 2 for v_ in rect]; cv2.rectangle(img, (x, y), (x + rw, y + rh), col, 2)
            cv2.putText(img, f"{t_}s {' / '.join(l for _, _, l in marcas)}"[:38], (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            tiles.append(img)
        cols = 6
        while len(tiles) % cols:
            tiles.append(np.zeros_like(tiles[0]))
        hoja = np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)])
        cv2.imwrite(str(base / "validacion-avisos.jpg"), hoja)

    pasa = sum(1 for e, _ in R.values() if e == "PASA"); falla = sum(1 for e, _ in R.values() if e == "FALLA")
    nas = sum(1 for e, _ in R.values() if e == "N/A")
    md = [f"# Validación de {fin.name}", "", f"**Cumple {pasa} de {pasa + falla} reglas ({nas} N/A)**", ""]
    md += [f"- {'✅' if e == 'PASA' else '❌' if e == 'FALLA' else '➖'} **{k}** — {d}" for k, (e, d) in R.items()]
    md += ["", "## Avisos (no bloquean, hay que mirarlos)", ""] + ([f"- {t_:.1f}s · {d}" for t_, d in sorted(avisos)] or ["- Ninguno."])
    if marcados:
        md += ["", "Cuadros marcados: `validacion-avisos.jpg`"]
    (base / "validacion.md").write_text("\n".join(md) + "\n")
    print("\n".join(md))
    sys.exit(2 if falla else 0)


if __name__ == "__main__":
    main()
