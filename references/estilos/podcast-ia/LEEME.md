# Podcast o UGC armado con clips cortos de IA (Veo, Higgsfield…)

Para cuando Juan deja en Descargas una carpeta de clips de 4–10 s (hombre/mujer en un estudio de podcast, o una persona
hablando a cámara) y pide «unir y editar». Aprobado por él el 2026-10-14 con el v4 («esa era la idea»).

1. `transcribir.py ~/Downloads/<carpeta> <proyecto>` → `tr.json` y la transcripción de cada clip. Los clips no traen guion:
   el orden se deduce por el sentido de la conversación (decírselo a Juan al entregar).
2. `receta.json` con la carpeta y los clips en orden (`receta-ejemplo.json`). Si un clip repite una frase al final, se le
   pasan los tramos a conservar. `armar.py <proyecto> receta.json` quita silencios de cabeza y cola (cada clip trae ~1 s
   mudo y su primer fotograma es la imagen de referencia), acorta pausas internas, iguala el volumen y escribe cam.mp4,
   words.ts y cuts.ts a 24 fps. Luego verificar tramo por tramo retranscribiendo cam.mp4.
3. `plantilla-video.tsx`: podcast sencillo (corte seco entre quien habla, acercamiento leve en los saltos de la misma
   persona, gancho textual arriba desde el fotograma 0, subtítulos grandes y etiquetas cortas arriba con lo que se nombra).
   **UGC** (Juan, 2026-10-14: «debe parecer más orgánico, no tanta edición»): sin gancho ni etiquetas; solo `Subs` de
   `mg.tsx` (blancos, sin caja, 62 px) y, al nombrar el test, una etiqueta tipo sticker «Test gratis ↓».
4. Sin música salvo que la pida. Render con `scripts/render.sh` (−14 LUFS). Entregas en `Edicion videos/Ads editados/`.

Voz en off sobre tomas sin audio (caso v3): cada toma se estira (≈0,8×) o se repite en espejo para cubrir su frase;
saltar el primer segundo de cada toma (arranca en la imagen de referencia).
