# Menú de efectos y estilos (con código)

La skill no trae una edición predeterminada: todo lo que se ve sale de este menú y de la marca de la persona.
Cada pieza tiene un **código** para pedirla corto: «edita mi video con H6 C9 D1 D3 T4 K2».

**Cómo se ofrece (pregunta 2 de la entrevista):**
- Con la herramienta de preguntas: una pregunta de selección múltiple por grupo (máximo 4 opciones cada una; elegir las 4
  que más calzan con el guion y dejar «Otro» para el resto). Siempre se puede decir «elige tú».
- **Si la persona no elige (o dice «elige tú»), se eligen 5–6 y se dicen cuáles. Nunca se entrega un video sin efectos
  del menú** (corrección de Juan, 6-nov-2026: la v2 del anuncio Black salió solo con tarjetas y la devolvió).
- **Antes de construir, una ficha de estilo** de máximo 6 líneas: los códigos con su nombre y una línea de por qué calzan
  con este video. Si la persona dio una sensación («que se sienta tranquilo y caro»), se proponen 4–6 códigos y se espera su sí.
- **Presupuesto: 5–6 estilos por video. Mismo trabajo, mismo tratamiento**: si una cifra va detrás de la cabeza una vez,
  todas las cifras van detrás de la cabeza. Dejar respiros solo con la cara.
- **Colores y letras: se preguntan antes de cada video** (regla de Juan, 8-nov-2026: «los colores siempre veo ese verde, eso
  cambia siempre según la marca, pregunta antes»). Se piden los colores (fondo, acento, segundo color) y las letras (título,
  texto, serif fina, condensada) de la marca de ESE video y se escriben en `theme.ts`. Nunca se reusan los del video anterior,
  los de otra marca ni los del catálogo. Si la persona no tiene, se le proponen 2–3 combinaciones y se espera su sí. Las
  piezas toman los colores de `C` (`C.lime` = acento, `C.violet` = segundo) y las letras de `theme.ts`; si una pieza trae un
  color fijo, se cambia por los de la marca antes de usarla.
- **Retirados el 8-nov-2026 a pedido de Juan, no se vuelven a ofrecer ni a construir:** H5 (etiqueta a mano), D9 (cuerpo
  de texto), T2 (vertigo), G5 (portada de periódico), G6 (billete) y G7 (impacto). Sus códigos quedan vacíos para no
  confundir videos viejos.

Piezas (se copian al proyecto): `fx-principales.tsx` → `src/principales.tsx` (P1–P6) · `fx-efectos.tsx` → `src/fx.tsx` · `fx-estilos.tsx` → `src/estilos.tsx` · `mg.tsx` →
`src/mg.tsx` · `fx-documental.tsx` → `src/doc.tsx` · `fx-apoyo-visual.tsx` → `src/apoyo.tsx` · `fx-editorial.tsx` → `src/editorial.tsx` (C10, H7, A12–A15, D8, D10). · `fx-graficos.tsx` → `src/graficos.tsx` (H8–H9, C11–C12, D11–D13, T10, A16–A23, K5–K6, I1–I4).
Lo que va **detrás** de la persona necesita su recorte: `scripts/mascaras.py <reel> --tramos "a-b,…" --con-pelo` escribe
`public/fg/00000.webp…` y `src/mascaras.ts` (con `TOPS`, la coronilla por cuadro). Los tramos deben cubrir todo lo que
Cam2 muestra recortado (`on` y `shrink` hasta el final) y cada corrida borra la anterior: pasar todos.
**Si la persona tiene pelo, `--con-pelo`**: sin esa opción el pelo desaparece del recorte y no sale ningún error.

## Regla fija: nada sobre la cara
Ningún subtítulo, tarjeta ni gráfico entre los ojos y el mentón (corrección de Juan, 6-nov-2026). Hay tres lugares:
1. **Detrás de ella** (grupo D, con recorte): la palabra clave gigante, la cabeza tapa una parte y la cara queda libre.
   Juan: «hay textos que pueden ir detrás de ella, no debajo». Para las palabras que cargan la idea.
2. **Debajo del mentón**: tarjetas que hay que leer completas. `scripts/caras.py` da el mentón por toma; con zoom
   1,13 baja ~30 px. En planos de cintura para arriba suele quedar en y≈900–950.
3. **Encima de la cabeza**: solo si hay aire entre la coronilla (`TOPS`) y y≈220.

## P · Textos principales (los de base de todo video)
Regla de Juan, 9-nov-2026: *«tengas estos textos como principales y estilos los que son grandes que queden por detrás
siempre»*. Son los textos que se usan por defecto en cada video (se proponen primero en la ficha de estilo); los demás
grupos se suman encima. Colores y letras siguen saliendo de la marca de cada video (se preguntan antes). Piezas:
`fx-principales.tsx` → `src/principales.tsx`.

**Letra a mano = refuerzo** (Juan, 9-nov-2026): 4 letras de marcador para notas y para jugar en algunos subtítulos:
**A** Coming Soon (delgada, la de por defecto) · **B** Gochi Hand (de plumón) · **C** Shadows Into Light (fina y alta) ·
**D** Gaegu (redonda, separada). Se piden con `mano="a"`…`"d"`; en P2 también por tramos: `mano={[[12.0, 15.5, "b"]]}`.
**Color:** el acento NO es amarillo fijo. Va el color de la marca de ese video o el que la persona pida (`color`, `colorClave`,
`colorNota` en cada pieza).

🔴 **Lo grande va SIEMPRE detrás de la persona** (en el `behind` de Cam2, con recorte de `mascaras.py`). Lo mediano y lo
chico va delante, al costado de la cabeza o bajo el mentón, nunca sobre la cara.

| Código | Estilo | Tamaño · dónde | Qué se ve | Pieza |
|---|---|---|---|---|
| P1 | Título en dos letras | Grande · **detrás** | Línea en sans gruesa blanca en minúsculas + línea en serif cursiva del acento, más grande y montada encima; la cabeza tapa la base. Gancho y frases clave | `TituloDetras` |
| P2 | Palabra suelta al costado | Chico · delante, al lado de la cabeza | Subtítulo de una palabra en sans gruesa blanca a la altura de los ojos; las claves en serif cursiva del acento. Con `caras={FACES}` (de `caras.py`) se pone sola en el lado libre y, si la cara está al centro, cambia de lado cada frase. Algunos tramos pueden ir en letra a mano (`mano`) | `PalabraSuelta` |
| P3 | Título con nota a mano | Mediano · bajo el mentón | Línea en sans gruesa + debajo una línea en letra a mano que se escribe sola («1. pon a prueba la demanda»). Pasos y listas | `TituloNota` |
| P4 | Nota a mano | Mediano · pecho o costado | 1–3 líneas en letra a mano de marcador (trazo parejo, letras separadas, no cursiva), inclinadas, que se escriben solas. Comentarios aparte. La letra se elige con `mano` (A–D) | `NotaMano` |
| P5 | Serif con destellos | Mediano · pecho | Frases en serif fina; la frase con palabra clave en serif cursiva con dos destellos ✦ | `SubsSerif` |
| P6 | Tarjetas de perfil | Grande · **detrás**, encima de la cabeza | 2–4 tarjetas blancas en abanico: inicial en círculo, @cuenta, cifra, «seguidores», botón «Seguir». Solo cuentas y cifras reales | `TarjetasPerfil` |

**Estilo listo «Lanzamiento»** (`references/estilos/lanzamiento/`): P1 + P2 + P4 con las letras y los lugares de la captura
de referencia de Juan (Inter Tight + Instrument Serif cursiva + letra a mano A). Para pedirlo: «estilo Lanzamiento».

Cómo se combinan: P1 en el gancho y en las 2–4 frases que cargan la idea; P2 o P5 como subtítulo del resto (uno solo por
video); P3/P4 cuando se dice un paso o un comentario aparte; P6 cuando se habla de cuentas, creadores o resultados reales.
Mientras P1 está en pantalla se ocultan P2/P5 (`ocultar`) para no montar textos.
Medidas que funcionaron (prueba en un reel de Eli, 9-nov-2026): P1 con `size` 230 y `top` ≈ coronilla (`TOPS`) − 230, la
cursiva queda a la altura de la coronilla y la cabeza la tapa a medias; P6 con `top` ≈ coronilla − 330 (nunca arriba de
y≈210, la barra de Instagram); P3 y P5 desde el mentón para abajo (`caras.py`), en esa toma y≈1150.

## H · Ganchos (visibles desde el cuadro 0, 1–3 s)
| Código | Estilo | Qué se ve | Pieza |
|---|---|---|---|
| H1 | Título del gancho | Frase corta arriba que dice de qué trata (regla fija de los reels) | `HookTitle` (reel.tsx) |
| H2 | Gancho detrás de la cabeza | Línea chica + título gigante detrás, la persona recortada delante | `BehindText` (mg.tsx) |
| H3 | Mayúsculas cálidas | Mayúsculas crema con borde café grueso y una línea a mano color caramelo. Cercano | `GanchoEstilo estilo="h3"` |
| H4 | Recorte | Serif cursiva fina sobre una palabra gruesa en minúscula. Suave, editorial | `GanchoEstilo estilo="h4"` |
| H6 | Dos pesos | Mayúsculas gruesas sobre mayúsculas finas angostas, centrado; sube y se va a los ~3 s | `GanchoEstilo estilo="h6"` |
| H7 | Gancho en estudio | El fondo se vuelve un color plano de la marca y detrás de la cabeza pasan 2–3 frases, cada una en otra letra (serif · gruesa · cursiva de acento). Recorte | `GanchoEstudio` (editorial) en `behind` |
| H8 | Frase que se arma | El gancho aparece línea por línea arriba y se queda armado; lo clave en serif cursiva amarilla | `FraseQueSeArma` (graficos) |
| H9 | Respuesta a comentario | Burbuja blanca de un comentario REAL arriba + titular condensado y una línea en cursiva que lo responde | `RespuestaComentario` (graficos) |

## C · Subtítulos (nunca sobre la cara)
| Código | Estilo | Qué se ve | Pieza |
|---|---|---|---|
| C1 | Manuscrita + clave gruesa | Frase en letra a mano, la palabra clave en la gruesa de la marca | `SubsDoc` (fx-documental) / `SubsEli` |
| C2 | Una palabra | Una palabra gigante en mayúsculas a la vez, la clave en color. Rápido | `SubsEstilo estilo="c2"` |
| C3 | Sin subtítulos | Solo títulos y gráficos. Para piezas tranquilas o premium | — |
| C4 | Chicas + CLAVE grande | Palabras chicas en minúscula y la clave enorme en el color de acento | `SubsEstilo estilo="c4"` |
| C5 | Pastilla blanca | Frase que aparece palabra por palabra; la clave dentro de una pastilla blanca | `SubsEstilo estilo="c5"` |
| C6 | Línea + remate | Línea blanca chica y debajo el remate grande de color que entra desenfocado; sale desenfocándose | `SubsEstilo estilo="c6"` |
| C7 | Revista | Mayúsculas chiquitas muy espaciadas y la clave en serif cursiva grande que sube desde una máscara. Caro | `SubsEstilo estilo="c7"` |
| C8 | Bajo el mentón | Una sola línea en mayúsculas pequeñas justo debajo del mentón. Casi invisible | `SubsEstilo estilo="c8"` |
| C9 | Escalera | Cada palabra cae un escalón en diagonal (3–5 líneas) en el espacio libre; la clave en serif cursiva subrayada | `SubsEstilo estilo="c9"` (`x`, `y` = columna libre) |
| C10 | Karaoke en pastilla | Frase corta en serif chica sobre una pastilla del color de la marca; lo ya dicho en crema, lo que falta apagado. Discreto y caro | `SubsKaraoke` (editorial) |
| C11 | Palabra a palabra con cursiva | Una palabra a la vez, blanca y gruesa; las claves cambian a serif cursiva amarilla. Lo más simple que funciona | `SubsPalabra` (graficos) |
| C12 | Corchetes | Frase corta en mayúsculas; la clave en amarillo dentro de cuatro esquinas que se cierran | `SubsCorchetes` (graficos) |

## D · Detrás de la persona (necesitan recorte)
| Código | Efecto | Qué se ve | Pieza |
|---|---|---|---|
| D1 | Texto detrás de la cabeza | 1–2 palabras gigantes; la cabeza tapa parte. La palabra clave de una frase | `BehindText` (mg.tsx) |
| D2 | Portada de revista | Título serif gigante detrás de la cabeza + marco fino. Remates | `CoverStory` |
| D3 | Notas en la pared | Papelitos que aparecen uno por uno al lado de la cabeza. Listas que dice | `PaperWall` |
| D4 | Pared de miniaturas | La pared se llena de cuadritos de video. «Una cosa detrás de otra» | `ThumbWall` |
| D5 | Cifra que cuenta | Número enorme que sube detrás de la cabeza al decir la cifra. Solo cifras reales | `CifraDetras` |
| D6 | Gráfica que crece | Línea con brillo que se dibuja en la pared y se dispara al final. Datos reales o forma sin números | `GraficaDetras` |
| D7 | Apagón | La sala se oscurece y la persona queda iluminada, con la palabra detrás (anuncio Black) | `Look estilo="g3"` en `behind` + `BehindText` |
| D8 | Palabra ventana | Pantalla de un color con UNA palabra gigante; el video se ve solo dentro de las letras. 0,8–1,5 s en un remate. Sin recorte | `PalabraVentana` (editorial) |
| D10 | Clones | Copias de la persona aparecen a los lados, detrás de ella: «todas hacen lo mismo», «otra vez» | `Clones` (editorial) en `behind` |
| D11 | Número de sección | Número dorado gigante en serif cursiva a un costado, la cabeza le tapa una parte: «1», «2», «3» al empezar cada punto | `NumeroSeccion` (graficos) en `behind` |
| D12 | Vidrio acanalado | El fondo se vuelve un panel oscuro de vidrio estriado con una palabra condensada gigante | `VidrioAcanalado` (graficos) en `behind` |
| D13 | Cinta de luz | Una cinta de color brillante se dibuja en curva detrás de la persona | `CintaDeLuz` (graficos) en `behind` |

## T · Cámara y transiciones
| Código | Efecto | Qué se ve | Pieza |
|---|---|---|---|
| T1 | Fondo que cambia | El fondo se pone blanco y la persona queda delante. Cambios de tema | `WhiteOut` (recorte) |
| T3 | Zoom que atraviesa | La cámara se mete en el plano y sale en el siguiente. Máximo 2–3 por video | `Cam2 zt` |
| T4 | Marco de reel | El video se encoge a un marco de reel con íconos y la persona se sale del borde. Llamado final | `Cam2 shrink` (recorte) |
| T5 | Zoom digital | Salto seco a la cara en la palabra clave (sin desenfoque) con viñeta, y vuelta | `conZoomDigital` + `Vineta` |
| T6 | Barrido circular | Un círculo del color de la marca crece, cubre y se abre al siguiente plano. Cambio de sección | `CirculoWipe` |
| T7 | Saltos de encuadre | Zoom alterno 1 / 1,13 en cada corte dentro de una toma (base, siempre) | keys de `CamV`/`Cam2` |
| T8 | Congelar imagen | El cuadro se queda quieto como foto con borde blanco y una etiqueta («Esa era yo»); la voz sigue | `Congelar` |
| T9 | Barrido de color | La imagen va en blanco y negro y una línea de luz la deja a color: el antes y el después | `BarridoColor` |
| T10 | Cámara a saltos | El video baja a 12 cuadros por segundo (como stop motion) en un tramo corto | `CamaraSaltos` (graficos), justo después de Cam2 |

## A · Tarjetas y apoyos
| Código | Efecto | Qué se ve | Pieza |
|---|---|---|---|
| A1 | Checklist de vidrio | Tarjeta translúcida «n de 3» que se marca al decir cada paso | `GlassChecklist` |
| A2 | Testimonio en chat | Mensaje que se escribe solo mientras se lee (solo testimonios reales) | `ChatTestimonio` |
| A3 | Órbita | Etiquetas que giran alrededor de la persona, por delante y por detrás. A quién va dirigido | `Orbit` (back + front, recorte) |
| A4 | Palabra que se enfoca | La palabra entra desenfocada y se enfoca; con salto de cámara. Remates cortos | `FocusWord` |
| A5 | Notificación | Aviso tipo iPhone que baja con lo que se acaba de decir («Informe enviado») | `Notificacion` |
| A6 | Anillo que cuenta | Anillo de vidrio en el centro que cuenta hasta el número dicho y se va | `AnilloCuenta` |
| A7 | Calendario | Widget blanco que pasa los años para un salto en el tiempo («hace 10 años») | `Calendario` |
| A8 | Línea fija | Una línea a mano fija arriba todo el video (el llamado desde el segundo 1) | `BannerFijo` |
| A9 | Serie numerada | Título fijo + contador 01/10 + etiqueta grande de cada ítem. Listas largas | `Serie` |
| A10 | Nota con flecha | Nota a mano («antes») con una flecha dibujada que apunta a algo | `NotaFlecha` |
| A11 | Ranking | Tabla por niveles (S, A, B, C) que se llena al nombrar cada cosa. Ocupa ~520 px: con la cara abajo | `Ranking` |
| A12 | Barra de pedido | Barra tipo chat de IA que escribe el pedido («hazlo más elegante») y se vuelve «listo ✓». Pedido → resultado | `BarraPedido` (editorial) |
| A13 | Reloj de material | Reloj de fichas que baja de la duración cruda a la final (1:07 → 0:52). Solo duraciones reales | `RelojMaterial` (editorial) |
| A14 | Lista lateral | Panel angosto a un costado con todos los puntos; el que se dice se marca y arriba va «03 / 12». Videos de lista | `ListaLateral` (editorial) |
| A15 | Cursor en vivo | Cursor con etiqueta («Claude») que se mueve y dibuja un recuadro de selección con medidas | `CursorVivo` (editorial) |
| A16 | Contador que rueda | Tarjeta con dígitos que giran como tragamonedas hasta la cifra. Solo cifras reales | `ContadorRueda` (graficos) |
| A17 | Antes y después | Pantalla oscura con dos teléfonos inclinados (antes apagado, después a color) y una flecha | `AntesDespues` (graficos) |
| A18 | Camino de nodos | Puntos que brillan unidos por líneas que se dibujan, cada uno con su etiqueta en cursiva | `CaminoNodos` (graficos) |
| A19 | Tarjetas de vistas | Tarjetas apiladas a un costado con un número grande (vistas, ventas). Solo cifras reales | `TarjetasVistas` (graficos) |
| A20 | Ficha de marca | Tarjeta con «Aa» en la letra de la marca y sus colores | `FichaMarca` (graficos) |
| A21 | Cita de estudio | Hoja de artículo científico y la frase clave marcada con resaltador. Solo estudios reales | `CitaEstudio` (graficos) |
| A22 | Tira de video | Tira de cuadros del propio video y un marco que elige «la parte buena» | `TiraVideo` (graficos) |
| A23 | Título fijo en serif | El tema en serif blanca con borde negro, fijo arriba todo el video | `TituloFijo` (graficos) |

## K · Cierres
| Código | Cierre | Cuándo | Pieza |
|---|---|---|---|
| K1 | Comenta PALABRA clásico | Orgánico | `CommentCTA` (reel.tsx) |
| K2 | Tarjeta «Comenta» | Orgánico: tarjeta blanca con aro de color, escribe «Comenta» y la palabra en degradado | `ComentaCTA` |
| K3 | Comentario en vivo | Orgánico: hoja de comentarios delante del pecho, la palabra se escribe, se publica y le cae un corazón; con `respuesta`, la cuenta contesta («Te lo envío por mensaje») | `ComentarioEnVivo` |
| K4 | Botón | **Anuncios**: «toca el botón de abajo», sin palabra clave | `TapButton` / `EndCard` (mg.tsx) |
| K5 | Botón que brilla | **Anuncios**: pantalla oscura, ondas y un botón con brillo que se presiona | `BotonBrillo` (graficos) |
| K6 | Comenta con destellos | Orgánico: «COMENTA» chico, la palabra grande en amarillo, una línea y destellos | `ComentaDestellos` (graficos) |

## G · Look de color
| Código | Look | Qué se ve | Pieza |
|---|---|---|---|
| G1 | Cálido de cine | Tono cálido suave y viñeta | `Look estilo="g1"` |
| G2 | Sepia suave | Sepia cálido, texto crema; va con la órbita y una línea en serif cursiva | `Look estilo="g2"` |
| G3 | Editorial oscuro | Sala oscurecida, tono petróleo, viñeta; en `behind` la persona queda iluminada | `Look estilo="g3"` |
| G4 | Documental cálido | Grano, franjas de cine, capítulos en serif, ficha de nombre, cita grande. Testimonios e historias reales | `Pelicula`, `Franjas`, `Capitulo`, `Rotulo`, `CitaGrande`, `Recuadro`, `TachaSerif`, `Destello`, `CierreDoc` (fx-documental) + `CoverStory` |

## I · Insertos a pantalla completa (reemplazan la cámara 1–3 s; la voz sigue)
| Código | Inserto | Qué se ve | Pieza |
|---|---|---|---|
| I1 | Pictograma | Fondo cálido con un dibujo de líneas que se traza solo (monitor, silla, play, olla, gráfico, persona, documento, reloj) y la palabra en cursiva. Cuando no hay toma de apoyo | `Pictograma` (graficos) |
| I2 | Cifra con gráfica | Número enorme que sube y una línea que se dispara. Solo datos reales | `CifraGrafica` (graficos) |
| I3 | Artículo resaltado | Página de periódico con el titular y el párrafo reales; un resaltador marca la frase | `ArticuloResaltado` (graficos) |
| I4 | Palabra a pantalla completa | Fondo cálido oscuro: conteo 1-2-3, palabra repetida apilada, máquina de escribir o palabra con brillo | `PalabraPantalla` (graficos) |

## V · Versiones y sonido
| Código | Qué hace | Cómo |
|---|---|---|
| V1 | Versiones para pauta: 3–5 MP4 del mismo anuncio que solo cambian los primeros 3 s | `references/variantes.md` + `scripts/variantes.sh` |
| V2 | Voz limpia: quita ruido de fondo, retumbe y eses que silban (suave o fuerte) | `scripts/limpiar_voz.sh <reel> [suave\|fuerte]` antes del render |

Siempre disponibles sin preguntar (son la base): los textos principales (P1–P6), subtítulos, saltos de encuadre (T7), el texto grande debajo del mentón
(`Kin` de mg.tsx, ubicado con `caras.py`) y el gancho textual de los reels (H1 o el que se elija).

## Verlos en movimiento
`references/catalogo.tsx` arma un video de ~3 min con TODOS los efectos de este menú (más 25 piezas de motion graphics sobre cámara, que se piden por nombre) sobre la grabación de la persona,
cada uno con su código y nombre arriba (instrucciones en su cabecera). Sirve para la pregunta 2 cuando la persona quiere
ver antes de elegir. Tarda: recorte de todo el video (~17 min por minuto de grabación) + ~15 min de render.
`references/catalogo-mg.tsx` hace lo mismo con las 14 piezas de motion graphics SIN cámara (template-mg).

## Más, si la persona pide algo que no está aquí
- `references/efectos-17.md`: los 17 efectos del catálogo de referencia (teléfono flotante, collage de papel, vidrio…).
- `references/apoyo-visual.md` + `fx-apoyo-visual.tsx`: mostrar lo que se dice (`Cutaway`, `ArticleCard`, `ChatMock`, `Terminal`…).
- `references/mg.tsx`: kit de motion graphics sobre cámara (cifras, listas, flujos, preguntas, relojes, botón de cierre).
- Videos largos horizontales: el kit de `references/youtube-horizontal/` (se ofrece, no se aplica solo).

## Lecciones (de los videos donde se probaron)
- (7-nov-2026, 13 reels de 4 cuentas) El reel con más vistas de la muestra (952 mil) no tiene casi efectos: título fijo en serif
  y una palabra a la vez (A23 + C11). Los efectos suben la retención, pero el gancho y el tema mandan: en piezas de historia
  personal o testimonio, menos efectos. Los de muchos efectos (pantallas, nodos, vidrio) funcionan en anuncios de producto.
- Las piezas de pantalla completa (I1–I4, A17, K5, D8) tapan la cara: máximo 1,5 s cada una, como golpe y no como escena, y
  no más de 2–3 por video. La voz sigue debajo. Ocultar los subtítulos en esos tramos.
- Persona recortada: va como imagen WEBP por cuadro con `<Img>`. Un segundo `OffthreadVideo` con máscara CSS hizo que
  la persona desapareciera o parpadeara en render (43 de 171 cuadros en un tramo).
- Cabeza calva con cielo o pared clara detrás: el modelo confunde el fondo con pelo; por eso `mascaras.py` va sin la
  clase pelo por defecto. Con pelo, `--con-pelo` siempre.
- Texto detrás de la cabeza (D1, D5): se ubica con `TOPS` (coronilla). Lo que funcionó en el anuncio Black (cabeza en
  y≈350): letras de 170–290 px con `top` ≈ coronilla − 150, para que la cabeza tape la base y la palabra se lea. Una
  palabra de más de 8 letras se achica (≤ 180 px) para no tocar los bordes. Revisar siempre con fotogramas.
- Fondo que cambia (T1) y apagón (D7): el borde del recorte se nota en piernas y manos; mejor en planos de la cintura
  para arriba. Con el apagón al 85 % la banca y el fondo se adivinan y la persona no flota.
- Zoom que atraviesa (T3): máximo 2–3 por video, en cambios de idea reales; si no, marea.
- Órbita (A3): con etiquetas de ~18 letras, `rx` ≤ 260 o se salen por los lados; `cy` a la altura del pecho (≈1000),
  nunca a la de la cara.
- Todo lo de arriba de y≈210 lo tapa la barra de Instagram: `validar.py` (R7) lo avisa. Para TikTok la zona es más
  grande: nada importante en los 450 px de abajo ni en los 100 px de la derecha desde los dos tercios para abajo.
