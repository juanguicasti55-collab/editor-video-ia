# Catálogo de 17 efectos de reel (modelados de un reel de referencia, oct-2026)

Origen: un reel vertical de 27 s de un creador que muestra **17 efectos hechos con Claude**, uno por segundo,
dentro de un "teléfono" que sostiene a cámara. Aquí está **lo que se ve** en cada efecto (revisado fotograma
a fotograma) y **cómo armarlo con esta skill**. No tenemos su código ni sus prompts: la columna "cómo" es la
propuesta de esta skill con las piezas que ya tiene (`matte.py`, `detras.py`, `lib.tsx`, `reel.tsx`).
Se copia el lenguaje visual, nunca su marca, sus clips ni sus textos. Los colores salen del `theme.ts` de la persona.

**Clave que destraba 11 de los 17:** recortar a la persona del fondo (`scripts/matte.py` → `fg.webm`) y apilar
`cámara → efecto → fg.webm`. Así cualquier cosa queda *detrás* de la persona. Es lento (~0,3 s por fotograma):
recortar solo los tramos con efecto (`scripts/detras.py`).

## Los 17

| # | Nombre | Lo que se ve | Cómo se arma aquí | Necesita matte | Dificultad |
|---|---|---|---|---|---|
| 1 | **Orbit** | Tarjetas (capturas, miniaturas) girando en elipse alrededor de la persona: unas pasan por delante, otras por detrás. Título en serif cursiva con destellos ("cool girl") | N tarjetas en `x = cx + R·cos(θ+ωt)`, `z = sin(θ+ωt)`; escala y opacidad según z; si z<0 se dibujan antes de `fg.webm`, si z>0 después. Título con fuente serif cursiva + `Sparkle` | Sí | Media |
| 2 | **Couch wall** | La pared de atrás se llena de capturas (miniaturas de reels con sus vistas) en mosaico; la persona sigue delante. Subtítulo cuya palabra clave entra desenfocada y se enfoca | Grilla de imágenes que entra con `pop` escalonado detrás de `fg.webm`. Palabra clave: `filter: blur(12px→0)` en 0,25 s | Sí | Baja |
| 3 | **UI World** | Mitad de arriba es una interfaz (chat de Claude): los clips "caen" en la caja ("Drop files here"), etiqueta amarilla "RAW CLIPS", se escribe el comando `/video-`. Persona abajo, subtítulo DROP CLIPS → TRIGGER THE… | `DualCam`/`CAM_BOTTOM` + `PromptCard` arriba. Nuevo: miniaturas que caen con `spring` y quedan en fila dentro de la caja; etiqueta tipo marcador | No | Media |
| 4 | **Frame break** | El video a pantalla completa se encoge hasta volverse un reel de Instagram (♥ 💬 ➤, usuario, botón Follow, barra de progreso) y las manos de la persona salen por fuera del marco | Escala de la cámara 1→0,72 con marco de reel dibujado encima; `fg.webm` con la misma escala pero **sin recorte** (`overflow: visible`) para que las manos tapen el borde | Sí | Media |
| 5 | **Digital zoom** | Punch-ins secos en cada palabra clave; subtítulo grande blanco y la segunda palabra en amarillo ("video / editing") | Ya existe: `punch(1.12–1.25)` en `KEYS` + `KEYWORDS` en `SubsV`. Boom suave en cada punch | No | Ya está |
| 6 | **Phone mockup** | Un iPhone flota al lado de la cara mostrando una app: notificación de un asistente ("Pausa el anuncio 3, pasa el presupuesto al 1") con botón **Aprobar** que se toca | Nuevo componente `PhoneMock` (marco de teléfono en CSS + contenido React adentro). Entra con `spring` desde el lado; el dedo/círculo toca el botón con `click` | No | Media |
| 7 | **Checklist** | Tarjeta oscura de vidrio arriba: "TODO LO QUE TIENES QUE HACER · 0 de 3"; cada paso aparece y se marca ✓ al decirlo (contador 1 de 3) | `Row icon="check"` dentro de una tarjeta con `backdropFilter: blur(18px)` y fondo `rgba(20,20,24,.7)`; contador "n de 3" con `pop` | No | Baja |
| 8 | **Headline wall** | Titulares, notas de papel y tweets pegados en la pared detrás de la persona, apareciendo uno a uno, con tipografías mezcladas (serif, máquina de escribir) y leve rotación | Igual que Couch wall pero con tarjetas de texto (−6° a +6°), sombra de papel, `pop` + `pop` sfx por nota | Sí | Baja |
| 9 | **Zoom-through cut** | Transición: la cámara se mete en una zona oscura del plano (ropa, sombra) y "la atraviesa" hasta el plano siguiente. Texto en mayúsculas muy espaciadas + palabra grande serif cursiva | Último 0,3 s del plano A: `scale 1→5` hacia el punto oscuro con blur creciente; primer 0,3 s del plano B: `scale 3→1` con blur bajando. `whoosh` en el corte | No | Baja |
| 10 | **Chart grow** | Gráfica de línea dibujada sobre la pared (días L M M J V S D), línea amarilla con brillo que sube y etiqueta-píldora "SCALE ↗"; la persona delante | SVG con `strokeDashoffset` animado + glow (`drop-shadow`), puntos que aparecen, píldora con `pop`. Detrás de `fg.webm` | Sí | Media |
| 11 | **Pull-back reveal** | El video se aleja y resulta estar dentro de la ventana de un editor (nombre de archivo, panel "Trabajando en": ✓ transcribí 1 clip, ✓ elegí la toma, ✓ corté 3 tomas, subtítulos, render 150 fotogramas; línea de tiempo con onda de audio avanzando) | Escala de la cámara 1→0,55 dentro de un marco de ventana; `AgentTasks` al lado; línea de tiempo con playhead. Número grande "%" que sube al fondo | No | Media |
| 12 | **Green screen** | La persona recortada sobre un fondo de color (degradado violeta) con una interfaz detrás (temporizador de foco 49:57, lista de tareas) y un titular serif ("Todo lo demás espera") | `fg.webm` del tramo completo sobre fondo + UI. El fondo original no se ve | Sí | Media |
| 13 | **Paper cut** | Collage tipo cuaderno: persona recortada con borde blanco de papel, sobre hoja cuadriculada; garabatos de crayón (azul, amarillo, rosado), cruces, espirales; letras recortadas de revista "1 0 0 %" que entran una a una y un círculo rojo las encierra | `fg.webm` con borde: dilatar la máscara 12 px en `matte.py` y pintarla blanca debajo. Garabatos como SVG dibujados con `strokeDashoffset`. Letras = tarjetas pequeñas con fondos distintos | Sí | Alta |
| 14 | **Doodle boil** | Contorno blanco dibujado a mano alrededor de la persona que "hierve" (tiembla) y doodles (claqueta, corazón, cuadro) que se dibujan y se rellenan con rayas rosadas | Contorno: borde de la máscara (`cv2.findContours`) exportado como trazo; "boil" = ruido nuevo en el trazo cada 3 fotogramas (≈10 fps, se ve hecho a mano). Doodles en SVG con `strokeDashoffset` | Sí | Alta |
| 15 | **Vertigo** | Dolly zoom: el fondo se estira/aleja mientras la persona queda del mismo tamaño. Subtítulo "SUCK AT DESIGN" con la última palabra en amarillo | Fondo = cámara con `scale 1→1,35`; persona = `fg.webm` con escala fija. El borde del recorte queda a la vista si se exagera: máximo ~1,35 en 1 s | Sí | Media |
| 16 | **Cover story** | Portada de revista: título serif gigante ("EDIT") detrás de la cabeza (la cabeza tapa parte de las letras), marco fino alrededor; las letras suben al entrar | Ya existe la base: `detras.py` + `BehindText`. Añadir serif display (p. ej. Playfair Display 800) y marco de 2 px a 30 px del borde | Sí | Baja |
| 17 | **Glass type** | Palabra 3D de vidrio/acrílico ("DESIGN") flotando detrás de la persona en la sala, con reflejos y leve giro | Capas de texto apiladas en `translateZ` con transparencia y borde claro, o `@remotion/three` con material de vidrio. Detrás de `fg.webm` | Sí | Alta |

**Cierre del reel:** subtítulos cinéticos gigantes que cruzan la pantalla de lado, palabra por palabra, y un número
enorme en amarillo ("26") al decirlo. Se arma con un `Quote` sin caja, texto de 160–220 px y `translateX` continuo.

## El formato del reel en sí (también se puede copiar)
- **Listicle rápido:** título fijo arriba en 2 líneas ("17 efectos que Claude puede crear"), lista numerada de los 17
  a la izquierda con el ítem activo resaltado en amarillo, y al centro un "teléfono" con cada ejemplo y su contador
  `01/17`. Cada efecto dura ~0,9 s. La voz solo dice los nombres, de corrido.
- **Después del listado:** una promesa ("voy a sacar 26 más en los próximos días") y CTA de palabra clave para la lista de espera.
- **Dato público del post (al 18-oct-2026):** 10.622 me gusta y 15.889 comentarios. Hubo más comentarios que me gusta:
  el CTA de "comenta PALABRA" mueve comentarios. Las vistas no aparecían.

## Cuáles conviene usar primero
- **Sin matte, rápidos:** 5 Digital zoom (ya está), 7 Checklist, 9 Zoom-through cut, 3 UI World, 6 Phone mockup, 11 Pull-back reveal.
  Sirven para mostrar un agente o una IA trabajando sin inventar nada.
- **Con matte, mucho impacto y poco trabajo:** 16 Cover story, 8 Headline wall, 2 Couch wall.
- **Los más caros:** 13 Paper cut, 14 Doodle boil, 17 Glass type. Dejarlos para piezas de alcance, no para el día a día.
- **Ojo con 10 Chart grow y 2 Couch wall:** si muestran cifras o vistas, tienen que ser datos reales de la persona.

## Lecciones
- Un efecto por idea. En el reel original cambian cada segundo porque el reel *es* el catálogo; en un reel normal,
  1 efecto fuerte cada 4–8 s basta.
- Todo lo que va detrás de la persona se revisa con fotogramas: manos rápidas y pelo suelto se recortan mal.
