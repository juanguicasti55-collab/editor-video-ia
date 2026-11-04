# Menú de efectos (se pregunta SIEMPRE, antes de planear escenas)

La skill no trae una edición predeterminada: ni tarjetas, ni paleta, ni pantalla dividida propias. Todo lo que se ve
sale de este menú (y de su marca). En la entrevista se le muestra a la persona y ella elige cuáles quiere en su video.
Con la herramienta de preguntas: tres preguntas de selección múltiple, una por grupo (4 opciones cada una, la
descripción corta de abajo como texto de la opción); el grupo 4 se ofrece aparte cuando el video es un testimonio o una historia. Siempre se puede escribir
«elige tú»: entonces se eligen 3–5 que calcen con el guion y se dice cuáles fueron.

Piezas: `references/fx-efectos.tsx` (copiar a `remotion/src/fx.tsx`), `references/mg.tsx` (→ `src/mg.tsx`: `BehindText`,
`Kin`, `Subs`, `TapButton`, `EndCard`, `BigNumber`, `ListCard`…) y `references/fx-documental.tsx` (→ `src/doc.tsx`). Lo que va detrás de la persona necesita su
recorte: `scripts/mascaras.py <reel> --tramos "a-b,…"` escribe `public/fg/00000.webp…` (la persona con transparencia,
cuadro por cuadro) y `src/mascaras.ts`. Los tramos deben cubrir todo lo que Cam2 muestra recortado (`on`, `vertigo` y
`shrink` hasta el final) y cada corrida borra la anterior, así que se pasan todos. **Si la persona tiene pelo, agregar
`--con-pelo`**: sin esa opción el pelo desaparece del recorte y no sale ningún error. Regla de ritmo: un efecto fuerte cada 4–8 s, uno por idea; nunca dos efectos grandes a la vez.

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

## Grupo 4 · Look completo (testimonios e historias)
| # | Efecto | Qué se ve | Cuándo usarlo | Pieza |
|---|---|---|---|---|
| 13 | **Documental cálido** | Color cálido con grano y viñeta, franjas de cine, capítulos en serif («I · Antes», «II · Lo que buscaba»), ficha de nombre, cita grande en itálica, recuadro de revista, frase tachada en tinta y portada «La historia de…» detrás de la persona | Testimonios, la historia de un alumno o cliente (real), contar un antes y un después | `Pelicula`, `Franjas`, `Capitulo`, `Rotulo`, `CitaGrande`, `Recuadro`, `TachaSerif`, `Destello`, `CierreDoc` (fx-documental.tsx) + `CoverStory` |

Subtítulos: además de los de la plantilla (`SubsV`), se puede ofrecer **manuscrita con la palabra clave en gruesa**
(`SubsDoc` de fx-documental.tsx, con `color` y `clave` de la marca; letra `HAND` de theme.ts).

Además, siempre disponibles sin preguntar (son la base, no un estilo): subtítulos, cortes con salto de encuadre y el
texto grande debajo del mentón (`Kin` de mg.tsx, ubicado con `scripts/caras.py`). El gancho textual de los reels es regla fija.

## Más efectos, si la persona pide algo que no está en el menú
- `references/efectos-17.md`: los 17 efectos del catálogo (teléfono flotante, collage de papel, glass type, pull-back…).
- `references/apoyo-visual.md` + `references/fx-apoyo-visual.tsx`: mostrar lo que se dice (`Cutaway`, `ArticleCard`,
  `ChatMock`, `Terminal`, `FileCard`, `Headline`, `Checklist`, `FollowSave`…).
- `references/mg.tsx`: kit de motion graphics sobre cámara (cifras, listas, flujos, preguntas, relojes, botón de cierre).
- Videos largos horizontales: el kit de `references/youtube-horizontal/` (se ofrece, no se aplica solo).

## Lecciones (de los videos donde se probaron)
- Persona recortada: va como imagen WEBP por cuadro con `<Img>`. Un segundo `OffthreadVideo` con máscara CSS hizo que
  la persona desapareciera o parpadeara en render (43 de 171 cuadros en un tramo).
- Cabeza calva con cielo o pared clara detrás: el modelo confunde el fondo con pelo; por eso `mascaras.py` va sin la
  clase pelo por defecto.
- Texto detrás de la cabeza: con la cabeza alta en el cuadro no hay espacio; usar letras de ~190 px y dos líneas
  como máximo, la segunda tapada solo a medias. Revisar que se lea con fotogramas.
- Fondo que cambia: el borde del recorte se nota en piernas y manos; usarlo en planos de la cintura para arriba.
- Zoom que atraviesa: máximo 2–3 por video, en cambios de idea reales; si no, marea.
- Todo lo de arriba de y≈210 lo tapa la barra de Instagram: `validar.py` (R7) lo avisa.
