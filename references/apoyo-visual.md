# Apoyo visual en reels: lo que se dice, se MUESTRA

Analizado el 23-oct-2026 a partir de 9 reels (los de más vistas) de tres cuentas de referencia.
Se revisaron fotograma a fotograma, uno cada 2 s, y se contaron los cortes. Se copia el lenguaje visual, nunca sus clips, marcas ni textos.

| Cuenta | Nivel | Qué hace |
|---|---|---|
| **tenfoldmarc** (de aquí salió `efectos-17.md`) | Con muchos efectos | Cada **2 a 4 s** entra algo nuevo arriba o al lado de la cabeza: tarjetas de interfaz (prompt de Claude, kit de marca, burbuja de DM con la palabra clave), logos de apps, muro de miniaturas detrás, abanico de tarjetas, cifra gigante amarilla («14,000», «100%»), botón Follow al final. Subtítulo blanco de 1-2 líneas con la palabra clave grande en amarillo, o un rótulo pequeño en mayúsculas espaciadas más una palabra grande en serif («serious / premium look.»). Imagen oscura y fría |
| **itsmegkilgore** | Intermedio | Capturas reales (sus reels, su Instagram, el timeline de CapCut, el kit de marca) que **flotan al lado de ella** en el segundo exacto en que las nombra. Cambia de plano (lejos en el sofá → selfie cerca → entra caminando). Subtítulo de **una palabra**, alternando sans blanca con serif cursiva amarilla. En su versión simple usa un título fijo arriba durante todo el video y apoyo **físico** (tablero, cartulinas) |
| **jessijeanhome** | Sencillo | **Pantalla dividida**: arriba el clip del que habla (podcast, fotos de archivo, otro creador) y abajo ella reaccionando. O vlog con un **corte de lugar cada ~3 s** y texto corto sobre la imagen. Subtítulos de una palabra en letra manuscrita. El gancho es un recuadro blanco con el tema y una foto real de lo que menciona |

## La regla que comparten las tres
1. **Si nombra algo, se ve.** Una noticia → la captura real del titular. Una persona → su foto. Una herramienta → su logo oficial o su interfaz. Una idea abstracta («la IA va a hacer todo») → una toma de apoyo (robots, fábrica, cohete).
2. **Nunca más de 3-4 s sin algo nuevo en pantalla.** Si un tramo de cámara pasa de 4 s, entra un apoyo, un acercamiento o un texto.
3. **El apoyo entra en el segundo exacto de la palabra** (±0,1 s) y con sonido (pop al aparecer, whoosh al cortar).
4. **La cara no se tapa.** Las tarjetas van en la franja de arriba (del borde superior hasta unos 560 px en 1080×1920, antes de los ojos), a los lados o cortan a pantalla completa 1,5-3 s mientras la voz sigue.

## Cómo elegir el nivel
- **Con muchos efectos** (estilo Marc): temas de herramientas, IA, «cómo hacer». Interfaces animadas arriba de la cabeza todo el video.
- **Intermedio** (estilo Meg): historia personal o explicación. Capturas y fotos flotando al lado, más cambios de plano.
- **Sencillo** (estilo Jessi): opinión o noticia. Cortes a toma de apoyo a pantalla completa y titulares reales; pocos gráficos.

Todos llevan apoyo visual. Lo que cambia es cuántos gráficos llevan.

## Las piezas (en `references/fx-apoyo-visual.tsx`, junto con las del catálogo de 17)
| Pieza | Para qué |
|---|---|
| `Cutaway` | Corte a toma de apoyo a pantalla completa (video o foto), con zoom seco al entrar, Ken Burns y crédito abajo |
| `ArticleCard` | Captura real (noticia, Wikipedia) flotando, con **marcador amarillo** que pinta la frase clave en su segundo y una etiqueta de la fuente («CNBC · 18 oct 2026») |
| `Broll` / `Float` (de `mg.tsx`) | Foto o clip en tarjeta con borde blanco y etiqueta (persona citada, foto de un evento) |
| `AppIcon` | Logo oficial en un cuadrado redondeado (Claude, Google, etc.) que salta al nombrarlo |
| `ChatMock` | Chat que se escribe solo: burbujas tuyas y del asistente, línea de estado («Leyendo la skill…») y sello ✓ o ✕ |
| `Terminal` | Consola que se escribe sola («> bórrala», «✓ hecho»), para Claude Code o cualquier herramienta |
| `FileCard` | Archivo o documento (p. ej. `SKILL.md`) con renglones que aparecen y se marcan ✓ o ✕; brillo cuando «lo lee» |
| `Folders` | Carpetas que saltan en fila |
| `DayStrip` | Lunes a viernes marcándose (para decir «todos los días lo mismo») |
| `CountPop` | 1, 2, 3 al contar en voz alta y una palabra de remate |
| `Checklist` | Ya no se queda fija: **aparece unos 3 s en cada cambio de paso y se va** (varias instancias con ventanas cortas), para dejar libre la franja de arriba |

## Dónde conseguir el material (siempre real y con crédito)
- **Noticias y páginas:** `scripts/captura.sh "<url>" salida.png`. Es una captura de verdad, nunca un titular escrito a mano. Si sale gris por el aviso de cookies, se aclara ×2 y se recorta solo el titular y la fecha. La fecha y el medio van en la etiqueta.
- **Videos y fotos libres:** `scripts/commons.py buscar "<tema>" --video` y luego `commons.py bajar "File:..." remotion/public/broll`. Solo baja dominio público, CC0, CC BY o CC BY-SA, e imprime el crédito, que va en pantalla. Buenos temas: lanzamientos (NASA y Space Force, dominio público), robots, fábricas, marchas y fotos oficiales de personas públicas.
- **Logos:** `scripts/logo.py`. **Revisa siempre el fotograma.** El 23-oct trajo el logo de Google Classroom en vez del de Google (ya corregido en el código y en la biblioteca).
- **Vertical:** los videos de Commons vienen en 16:9. Recorta una franja 9:16 sobre el sujeto (`crop=608:1080:X:0,scale=1080:1920`) y revisa que no quede un rótulo o una marca de agua dentro.
- **Nunca:** clips de otros creadores, de noticieros o de películas, ni fotos de Getty o de agencias sacadas de la nota. Si el usuario quiere un clip con derechos, pide permiso y usa menos de 10 s con crédito.

## Lo que se aprendió en el lote del 23-oct
- En el reel de la renta universal, tres titulares en papel escritos a mano se cambiaron por **capturas reales de CNBC y Wikipedia** con la frase subrayada, más cinco cortes a pantalla completa (robot, cohete, brazo robótico, la marcha de Berlín en tarjeta). Una foto apaisada a pantalla completa sale mal recortada (se veía media cabeza): las fotos horizontales van en tarjeta (`Broll`), no en `Cutaway`.
- En el reel de Claude, la lista de 4 pasos fija tapaba la parte de arriba durante 2 minutos. Ahora aparece solo en cada cambio de paso, y ese espacio se llenó con chat, terminal, `SKILL.md`, carpetas y días. Los textos de esas interfaces salen de las palabras de la persona.
- `W()` busca la n-ésima vez que aparece una palabra **sin tildes ni mayúsculas**. «Vamos» al final era la tercera vez que se decía «vamos», y la caja del cierre apareció desde el segundo 0. Para palabras repetidas, pasa siempre `n` o `after`.
