# Videos largos de YouTube (16:9) y reels sacados de ellos — estilo de Juan

Aprobado por Juan el 2026-10-12 con el video «Juan Doc Youtube» («recuerda este tipo de edición para YouTube y para los reels»).

## Video largo (horizontal 1920x1080)
1. `prep.py` para transcribir. Los tiempos por palabra del crudo no sirven para cortar: sacar la voz real (VAD) a `vad.json` y cortar con `corte_h.py` (copiarlo a la carpeta del proyecto, ajustar `DROPS` con tomas repetidas y muletillas). Corta, nivela la voz y vuelve a transcribir el corte → `remotion/src/words.ts` + `corte.txt` (los únicos tiempos que valen).
2. Copiar `yt.tsx` y `theme.ts` (oscuro + dorado, Outfit / Playfair / JetBrains Mono, @soyjuanggonzalez) a `remotion/src/`. Escenas en `video.tsx` (ver `ejemplo-video-doc-ia.tsx`).
3. Reglas que salieron de revisar fotogramas:
   - Juan se graba en selfie y su cara ocupa casi media pantalla: los textos laterales van con ancho ≤ 540 px y la cámara corrida al lado contrario (`L`/`R`: z 1.18, dx ±168). Chips de 42 px, clips flotantes de 430 px.
   - Texto detrás de la persona: a la izquierda (centro x≈455), líneas de ≤ 10 letras que quepan en ~800 px, sin contorno hueco. Recortar la persona solo en esos tramos con `matte_h.py`.
   - Tarjetas de capítulo sobre fondo oscurecido completo (`Shade side="all"`), no sobre la cara.
   - Clips del material comentado: fragmentos < 4 s, sin audio, con crédito. `to - from` ≤ duración del clip − 0,4 s. **Antes de usarlos, sacar una hoja de contacto de cada clip recortado y confirmar que muestra lo que dice el nombre** (el 12-oct cuatro clips estaban corridos y se descubrió después del render).
   - Sin barra de avance. Sin cierre de «Suscríbete» si no lo dice. En pantalla solo lo que dice en cámara o datos verificados.
   - `render.sh` resuelve mal una salida con ruta relativa: pasar siempre rutas absolutas.

## Reels desde el video largo (vertical 1080x1920, animación sencilla)
- `reels_h.py`: une tramos de `cut.mp4` (tiempos de `corte.txt`), recorta un cuadro 1:1 centrado en la cara y reubica las palabras.
- `reel.tsx`: gancho fijo arriba (etiqueta + título de dos líneas con palabras suyas), una etiqueta dorada que cambia con lo que dice, cámara en cuadro 1:1 con punch-in por tramo, clips de apoyo dentro del cuadro y subtítulos grandes de 2–3 palabras. Composiciones en `Root.tsx` (ver `ejemplo-Root-con-reels.tsx`).
- 50–60 s, el gancho es la frase más fuerte del video, cierre en una frase que remata. Uno de tema amplio (alcance) y uno para dueños de empresa.
