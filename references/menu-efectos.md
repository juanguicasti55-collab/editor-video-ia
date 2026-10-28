# Menú de efectos (se pregunta SIEMPRE, antes de planear escenas)

La skill no aplica ningún estilo ni paquete de efectos por defecto. En la entrevista se le muestra a la persona este
menú y ella elige cuáles quiere en su video. Con la herramienta de preguntas: tres preguntas de selección múltiple, una
por grupo (4 opciones cada una, la descripción corta de abajo como texto de la opción). Siempre se puede escribir
«elige tú»: entonces se eligen 3–5 que calcen con el guion y se dice cuáles fueron.

Piezas: `references/fx-efectos.tsx` (copiar a `remotion/src/fx.tsx`). Lo que va detrás de la persona necesita sus
máscaras: `scripts/mascaras.py <reel> --tramos "a-b,…"` (solo los tramos con efecto). Regla de ritmo: un efecto fuerte
cada 4–8 s, uno por idea; nunca dos efectos grandes a la vez.

## Grupo 1 · Detrás de la persona (necesitan máscaras)
| # | Efecto | Qué se ve | Cuándo usarlo | Pieza |
|---|---|---|---|---|
| 1 | **Texto detrás de la cabeza** | 1–2 palabras gigantes; la cabeza tapa parte de la segunda | La palabra clave de una frase | `BehindText` (mg.tsx) o `CoverStory` sin marco |
| 2 | **Portada de revista** | Título serif gigante detrás de la cabeza + marco fino | Remates, frases para recordar | `CoverStory` |
| 3 | **Notas pegadas en la pared** | Papelitos que aparecen uno por uno en la pared, al lado de la cabeza | Listas que dice («6 metodologías, cursos, PDFs») | `PaperWall` |
| 4 | **Pared de miniaturas** | La pared se llena de cuadritos de video, uno tras otro | «Una cosa detrás de otra», mucha cantidad | `ThumbWall` |

## Grupo 2 · Cámara y transiciones
| # | Efecto | Qué se ve | Cuándo usarlo | Pieza |
|---|---|---|---|---|
| 5 | **Fondo que cambia** | El fondo se pone blanco (o de color) y la persona queda delante | «Me quedé en blanco», cambios de tema | `WhiteOut` (máscaras) |
| 6 | **Vertigo** | El fondo se aleja mientras la persona queda del mismo tamaño | La frase clave, tensión | `Cam2 vertigo` (máscaras) |
| 7 | **Zoom que atraviesa** | La cámara se mete en el plano y sale en el siguiente | Entrar a una frase importante o a otra sección | `Cam2 zt` |
| 8 | **Marco de reel (frame break)** | El video se encoge a un marco de reel con título arriba y botón abajo | El llamado a la acción final | `Cam2 shrink` |

## Grupo 3 · Tarjetas y apoyo
| # | Efecto | Qué se ve | Cuándo usarlo | Pieza |
|---|---|---|---|---|
| 9 | **Checklist de vidrio** | Tarjeta translúcida «n de 3» que se marca al decir cada paso | Pasos, momentos, método | `GlassChecklist` |
| 10 | **Testimonio en chat** | Mensaje que se escribe solo mientras la persona lo lee | Citas de alumnos/clientes (solo reales; sin nombre ni foto inventados) | `ChatTestimonio` |
| 11 | **Órbita** | Etiquetas que giran alrededor de la persona, por delante y por detrás | A quién va dirigido, varias categorías | `Orbit` (back + front, máscaras) |
| 12 | **Palabra que se enfoca + zoom** | La palabra entra desenfocada y se enfoca; la cámara salta hacia adelante | Remates cortos | `FocusWord` + `punches` de cámara |

Además, siempre disponibles sin preguntar (son la base, no un estilo): subtítulos, cortes con salto de encuadre y el
texto grande debajo del mentón (`Kin` / tarjetas de la plantilla). El gancho textual de los reels es regla fija.

## Lecciones (de los videos donde se probaron)
- Texto detrás de la cabeza: con la cabeza alta en el cuadro no hay espacio; usar letras de ~190 px y dos líneas
  como máximo, la segunda tapada solo a medias. Revisar que se lea con fotogramas.
- Fondo que cambia: el borde del recorte se nota en piernas y manos; usarlo en planos de la cintura para arriba.
- Zoom que atraviesa: máximo 2–3 por video, en cambios de idea reales; si no, marea.
- Todo lo de arriba de y≈210 lo tapa la barra de Instagram: `validar.py` (R7) lo avisa.
