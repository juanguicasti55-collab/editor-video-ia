# Gancho textual (regla fija de todo reel)

Origen: la parte 1 de un reel de referencia en español sobre "tres textos que no faltan en edición" (oct-2026).
De ese reel **solo se toma la parte 1**; las otras dos partes no son regla de esta skill.

## La regla
**En los primeros 3 segundos de todo reel va un gancho textual:** una frase corta arriba que explica
exactamente de qué trata el video. Funciona como el título del video.

- **Corto:** 4–8 palabras, máximo 2 líneas. No es la transcripción de lo que se dice: es el título.
  Ejemplo del reel de referencia: la persona dice *"Tres tipos de texto que debes conocer para mejorar tu edición"*
  y el texto en pantalla dice **"Tres textos que no faltan en edición"**.
- **Dice el tema, no adorna:** quien lo lea sin audio tiene que saber de qué es el video.
- **Desde el primer fotograma:** visible en el fotograma 0, sin fundido de entrada (`HookTitle from={0}`, que ya es el valor
  por defecto). Se lee aunque el primer segundo de la toma esté desenfocado o la mano tape la cámara.
- **Mínimo hasta el segundo 3** (`to >= 3`). Puede quedarse más si la toma sigue siendo la misma.
- **Arriba, en zona segura:** entre y=230 y y≈450, centrado, con sombra para que se lea sobre cualquier fondo.
  Que no tape los ojos (si la cámara es muy cerrada, ver `reels.md` → empezar en `CAM_BOTTOM`).
- **Opcional `sub`:** una línea chica debajo que se escribe letra por letra (en la referencia: "versión Edits").
- **Opcional `recall`:** cuando la persona vuelve a nombrar el tema más adelante ("es como un título"), el gancho
  reaparece chico dentro de un recuadro, arriba.
- Va **además** de los subtítulos, no en lugar de ellos.

## Por qué (lo que dice la referencia, sin verificar)
La creadora compara dos videos suyos con el mismo formato: con gancho textual, **426K** vistas; sin gancho, **82,8K**.
Es un caso de ella, no una prueba controlada: los temas y las fechas son distintos. Se usa como regla porque cuesta
cero y deja el tema claro a quien ve sin sonido.

## Cómo se arma
```tsx
<HookTitle to={3.2} lines={["Tres textos que", "no faltan en edición"]} mark="edición" sub="versión Juan" recall={[[10.0, 11.5]]} />
```
- `lines`: el gancho partido en 2 líneas parejas. `mark`: una palabra como máximo.
- Antes de renderizar, revisar el fotograma 0 con `stills.sh` (segundo 0.0): el gancho tiene que estar entero y legible.
- Si la persona dio su propio gancho, **se usa textual**. Si no, la skill propone 2–3 opciones y la persona elige.
