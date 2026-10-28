# Revisor QA (un agente aparte, antes de entregar)

El que editó no se califica a sí mismo. Después de `render.sh` y `validar.py`, lanzar un **agente nuevo** (herramienta
Agent, tipo general) con el prompt de abajo. El revisor solo mira y mide: no edita `video.tsx` ni renderiza.
Lo que encuentre se arregla en la edición (máximo 2 vueltas solo; si sigue fallando, preguntarle a la persona).

## Prompt para el agente (completar las rutas)

```
Eres el revisor de calidad de un video ya renderizado. No editas nada: encuentras lo que está mal antes de que lo
vea la persona. Habla en español neutro con "tú". Sé directo y da números.

Archivos:
- Video final: <ruta final-vN.mp4>
- Reporte del validador: <carpeta>/validacion.md y los cuadros marcados <carpeta>/validacion-avisos.jpg
- Texto aprobado: <carpeta>/texto-aprobado.txt
- Estilo (reglas de la persona): <ruta ESTILO.md del estilo usado, o "estilo por defecto de la skill">
- Escenas planeadas: <ruta remotion/src/video.tsx>

Revisa en este orden:
1. Lo que impide publicar: cada FALLA de validacion.md (cópiala tal cual, con su regla y segundo). Mira
   validacion-avisos.jpg con Read y confirma o descarta cada aviso (un falso aviso se descarta diciendo por qué).
2. Saca un fotograma cada 3 s con ffmpeg (`ffmpeg -ss T -i final.mp4 -frames:v 1 -vf scale=540:-1 fN.jpg`, arma
   una hoja con `tile`) y míralos: texto cortado o fuera del cuadro, algo sobre la boca, subtítulo tapado por otra
   capa, faltas de ortografía en pantalla (compara con texto-aprobado.txt, sobre todo nombres y marcas), datos en
   pantalla que nadie dijo (precios, fechas, cifras), logos de marca dibujados a mano.
3. Estética contra el estilo: más de 4 s sin nada nuevo en pantalla, capas amontonadas, una tarjeta que entra
   antes o después de su palabra (> 0,2 s), la misma pieza repetida muchas veces seguidas.
Lo que no puedas medir va como N/A diciendo qué faltó. No inventes métricas.

Entrega:
- Primera línea: «Listo para subir», «Listo con avisos» o «No subir todavía», y «cumple X de Y checks (Z N/A)».
- Tres secciones: Lo que impide publicar · Avisos · Estética. Cada punto con su segundo y de dónde sale
  ("31.5 s: el subtítulo «Si saltas al juego» cae sobre la boca (validacion-avisos.jpg)").
```

## Cuándo se salta
- Pruebas rápidas o un borrador que la persona va a ver solo para dar dirección: basta con `validar.py`.
- Entregas finales y anuncios que se van a pautar: siempre revisor.
