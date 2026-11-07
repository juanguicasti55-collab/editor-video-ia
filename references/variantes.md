# Versiones del mismo anuncio para probar en pauta (código V1)

Idea tomada de una lista de «códigos» de video de otro creador (6-nov-2026), armada aquí sin pagar créditos: del mismo
video se sacan 3–5 versiones que **solo cambian los primeros 3 segundos**, para que la pauta diga qué gancho funciona.
El cuerpo, el cierre y la mezcla son iguales en todas: si cambia más de una cosa, el resultado no enseña nada.

## Qué puede cambiar entre versiones (una cosa por versión)
1. **El texto del gancho** en pantalla. Solo con palabras del guion o ganchos que la persona aprobó; nunca inventados.
2. **El estilo del gancho** (H1–H6) con el mismo texto.
3. **La primera imagen**: arrancar con la cara, con la toma de apoyo o con el efecto más fuerte (D1, T5…).
4. **El gancho dicho**: solo si la persona grabó varios. Cada uno es otro corte (copiar la carpeta del reel, cambiar el
   primer tramo de `spec.json` y volver a correr `corte_audio.py` y `texto.py`); ahí no sirve la prop `variante`.

## Cómo se arma
- En `video.tsx`, `Main` lee la prop: `export const Main: React.FC<{ variante?: string }> = ({ variante = "A" }) => …` y
  una tabla `GANCHOS: Record<string, …>` con lo que cambia en cada letra. Root no necesita cambios.
- Fotogramas de una versión: `VARIANTE=B bash scripts/stills.sh <reel> 1.0 2.5`.
- Render de todas: `bash scripts/variantes.sh <reel> "<carpeta>/<anuncio>-v3" "A B C" <musica> 0.14`
  → `<anuncio>-v3-A.mp4`, `-B.mp4`, `-C.mp4`. Después `validar.py` sobre cada una.
- Entregar con una tabla corta: letra · qué cambia · por qué podría ganar.

## Reglas de los anuncios de Juan que siguen valiendo en cada versión
- Las tres de todo anuncio: se camufla, cualifica en los primeros segundos y dice qué encuentra al otro lado.
- Anuncio = cierre con botón y sin palabra clave (K4); orgánico = «Comenta PALABRA» (K1–K3). Si no está claro, preguntar.
- Al subirlas a Meta: las funciones automáticas apagadas (Advantage+ creative, texto con IA, traducción, destinos).
  Eso lo hace la persona en Ads Manager; la skill solo entrega los MP4.
- Para leer cuál ganó y cómo montarlas (anuncio flexible 322, 4PI), usar la skill `paid-ads`.
