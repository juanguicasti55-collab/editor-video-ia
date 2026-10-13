#!/usr/bin/env python3
"""Corte vertical a partir de tramos medidos sobre el audio (tomas.py / voz.py), de uno o varios videos,
con afinado de bordes y verificación de que no se coma ni se repita ninguna palabra.
Uso: corte_audio.py <carpeta del reel> <spec.json>
spec.json: {"sources": ["a.mp4", "b.mp4"],
            "segs": [[0, 4.86, 11.38, "texto que debe oírse en este tramo"], [1, 95.81, 99.97, "…"], ...],
            "pad_in": 0.06, "pad_out": 0.10, "tail": 0.5, "denoise": false, "prompt": "nombres propios…"}
segs = [índice de source, inicio de la voz, fin de la voz, texto esperado (opcional pero recomendado)].
Qué hace:
 1. AFINA cada borde: si el corte cae sobre sonido (final de palabra en voz baja), lo corre hasta el primer
    silencio cercano (máx. 0,25 s antes / 0,30 s después). Si no hay silencio cerca, no lo mueve y AVISA.
 2. Corta, une, nivela la voz y escribe public/cam.mp4 (1080x1920).
 3. Retranscribe el corte completo → src/words.ts (los subtítulos calzan con el corte) y escribe src/cuts.ts.
 4. VERIFICA tramo por tramo: transcribe cada tramo suelto y lo compara con el texto esperado; marca
    «FALTA» / «SOBRA» palabra por palabra, bordes con sonido y palabras repetidas en las uniones.
No dar el corte por bueno si queda algún ✗: ajustar los tiempos del tramo y volver a correr."""
import difflib, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
SKILL = Path(__file__).resolve().parent.parent
R = Path(sys.argv[1]); spec = json.loads(Path(sys.argv[2]).read_text())
pi, po, tail = spec.get("pad_in", 0.06), spec.get("pad_out", 0.10), spec.get("tail", 0.5)
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

# ---------- 1. afinar bordes ----------
HOP = 160  # 10 ms
aud, env, thr = {}, {}, {}
for i, src in enumerate(spec["sources"]):
    tmp = Path(tempfile.gettempdir()) / f"corte_src{i}_{abs(hash(src)) % 10**8}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", str(tmp)], check=True)
    a = decode_audio(str(tmp), sampling_rate=16000); tmp.unlink()
    n = len(a) // HOP
    e = 20 * np.log10(np.sqrt((a[:n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12))
    aud[i], env[i] = a, e
    # umbral de «todavía suena»: 38 dB bajo el nivel de la voz (ahí ya terminó la cola de la última sílaba), y nunca a menos de 9 dB del piso de ruido
    thr[i] = max(np.percentile(e, 15) + 9, np.percentile(e, 92) - 38)
    print(f"audio {i}: piso {np.percentile(e, 15):.0f} dB · voz {np.percentile(e, 92):.0f} dB · umbral {thr[i]:.0f} dB")
def loud(i, t): k = int(t * 100); return 0 <= k < len(env[i]) and env[i][k] > thr[i]
avisos = []; segs = []
for k, s in enumerate(spec["segs"]):
    i, a, b = s[0], float(s[1]), float(s[2]); exp = s[3] if len(s) > 3 else None
    a2, b2 = a, b
    if loud(i, a):   # el inicio cae sobre sonido: buscar silencio hacia atrás
        t = a
        while t > a - 0.25 and loud(i, t): t -= 0.01
        if not loud(i, t): a2 = t
        else: avisos.append(f"tramo {k + 1}: el INICIO ({a:.2f}) cae sobre sonido y no hay silencio cerca (¿toma pegada a la anterior?)")
    if loud(i, b):   # el final cae sobre sonido: buscar silencio hacia adelante
        t = b
        while t < b + 0.30 and loud(i, t): t += 0.01
        if not loud(i, t): b2 = t
        else: avisos.append(f"tramo {k + 1}: el FINAL ({b:.2f}) cae sobre sonido y no hay silencio cerca (¿palabra cortada o sigue hablando?)")
    segs.append([i, max(0, a2 - pi), b2 + po, exp, round(a2 - a, 2), round(b2 - b, 2)])
segs[-1][2] += tail

# ---------- 2. cortar ----------
rem = R / "remotion"
if not rem.exists():
    R.mkdir(parents=True, exist_ok=True); shutil.copytree(SKILL / "template-reel", rem)
    (rem / "node_modules").symlink_to(SKILL / "engine" / "node_modules")
pub = rem / "public"; pub.mkdir(exist_ok=True)
fc = ""
for k, (i, s, e, *_) in enumerate(segs):
    fc += (f"[{i}:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,setsar=1[v{k}];"
           f"[{i}:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.02,afade=t=out:st={e - s - 0.025:.3f}:d=0.025[a{k}];")
den = "afftdn=nr=12:nf=-28," if spec.get("denoise") else ""
fc += "".join(f"[v{k}][a{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[cam][ar];[ar]highpass=f=90,{den}acompressor=threshold=0.03:ratio=3:attack=8:release=140:makeup=2[ac]"
(R / "filter.txt").write_text(fc)
cmd = ["ffmpeg", "-v", "error", "-y"]
for s in spec["sources"]: cmd += ["-i", s]
cmd += ["-filter_complex_script", str(R / "filter.txt"), "-map", "[cam]", "-map", "[ac]", "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k", str(pub / "cam.mp4")]
subprocess.run(cmd, check=True)
t = 0; cuts = []
for _, s, e, *_ in segs: cuts.append(round(t, 2)); t += e - s

# ---------- 3. retranscribir el corte ----------
m = WhisperModel("medium", device="cpu", compute_type="int8")
cam = decode_audio(str(pub / "cam.mp4"), sampling_rate=16000)
sg, _ = m.transcribe(cam, language="es", word_timestamps=True, initial_prompt=spec.get("prompt"))
W = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in sg for w in s.words]
dur = len(cam) / 16000
(rem / "src" / "words.ts").write_text(f"export const DURATION = {dur:.3f};\nexport const HAS_SCREEN = false;\nexport const SCREEN_H = 1200;\n"
    "export const WORDS: { w: string; s: number; e: number }[] = " + json.dumps(W, ensure_ascii=False) + ";\n")
(R / "corte.json").write_text(json.dumps({"cuts": cuts, "segs": [s[:3] for s in segs], "dur": dur}))
(rem / "src" / "cuts.ts").write_text(f"export const CUTS: number[] = {json.dumps(cuts)};\n")

# ---------- 4. verificar ----------
norm = lambda s: re.sub(r"[^a-záéíóúüñ0-9 ]", "", s.lower()).split()
print("CORTES:", cuts); print(f"DUR: {dur:.2f}")
malos = 0
ends = cuts[1:] + [dur]
for k, (c0, c1) in enumerate(zip(cuts, ends)):
    piece = cam[int(c0 * 16000):int(c1 * 16000)]
    sgk, _ = m.transcribe(piece, language="es", condition_on_previous_text=False, initial_prompt=spec.get("prompt"))
    got = " ".join(x.text.strip() for x in sgk)
    exp = segs[k][3]; mov = f" (bordes movidos {segs[k][4]:+.2f}/{segs[k][5]:+.2f}s)" if segs[k][4] or segs[k][5] else ""
    if exp is None: print(f"   {k + 1:2d} [{c0:6.2f}] {got}{mov}"); continue
    A, B = norm(exp), norm(got)
    ops = [o for o in difflib.SequenceMatcher(None, A, B).get_opcodes() if o[0] != "equal"]
    if not ops: print(f" ✓ {k + 1:2d} [{c0:6.2f}] {got}{mov}")
    else:
        malos += 1
        dif = "; ".join((f"FALTA «{' '.join(A[i1:i2])}»" if i2 > i1 else "") + (" " if i2 > i1 and j2 > j1 else "") + (f"SOBRA/CAMBIA «{' '.join(B[j1:j2])}»" if j2 > j1 else "") for _, i1, i2, j1, j2 in ops)
        print(f" ✗ {k + 1:2d} [{c0:6.2f}] {got}{mov}\n        esperado: {exp}\n        {dif}")
# palabras repetidas alrededor de las uniones
ws = [(norm(w["w"]) or [""])[0] for w in W]
for c in cuts[1:]:
    idx = [j for j, w in enumerate(W) if abs(w["s"] - c) < 1.2]
    for j in idx:
        if j + 3 < len(ws) and len(ws[j]) > 2 and ws[j:j + 2] == ws[j + 2:j + 4]:
            avisos.append(f"posible repetición en la unión de {c:.2f}s: «{' '.join(ws[j:j + 4])}»")
for x in dict.fromkeys(avisos): print(" ⚠", x)
print(f"RESULTADO: {'todo coincide' if not malos and not avisos else f'{malos} tramo(s) con diferencias, {len(set(avisos))} aviso(s) — revisar antes de montar'}")
line = []
for w in W:
    line.append(f"{w['w']}@{w['s']}")
    if w["w"][-1:] in ".?!": print(" ".join(line)); line = []
if line: print(" ".join(line))
