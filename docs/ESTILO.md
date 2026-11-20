# ESTILO · Serie de divulgación

**Estado** · Aprobado por el usuario. **Fijo** identifica valores e instrucciones del usuario. **Propuesta aprobada** identifica valores sugeridos y adoptados.

## Formato y cámara

- **Fijo.** Formato vertical de 1080 × 1920 a 30 fps. Cámara en perspectiva con FOV cercano a 30°, aspecto de maqueta y tilt-shift leve. Los movimientos salen de `useCurrentFrame()`.
- **Fijo.** Cada diorama tiene piso y dos paredes en L, abierto hacia cámara. El primer plano queda suavemente desenfocado, el sujeto nítido y el fondo conserva detalle. Los objetos apoyan en una superficie y tienen sombra de contacto.
- **Propuesta aprobada.** FOV vertical de **30°**. Foco en el sujeto, con radios máximos de desenfoque de **10 px** en primer plano y **5 px** en el fondo, medidos en la composición de 1080 px de ancho.

## Paleta

| Uso | Color | Estado |
|---|---|---|
| Verde pálido | `#C9D2BE` | Fijo |
| Madera clara | `#B9A27E` | Fijo |
| Gris azulado | `#4A5560` | Fijo |
| Luz cálida | `#F4D58A` | Fijo |
| Contorno | `#1B1714` | Fijo |
| Negro del vinilo, con banda especular | `#141414` | Fijo |
| Cobre de piezas metálicas | `#AD7459` | Propuesta aprobada |
| Níquel de los moldes | `#AEB8B6` | Propuesta aprobada |
| Canal izquierdo, cálido | `#F4D58A` | Propuesta aprobada de aplicación |
| Canal derecho, frío | `#89A9BB` | Propuesta aprobada |

## Materiales y acabado

| Elemento | Fijo | Propuesta aprobada |
|---|---|---|
| Material | Toon de tres tonos planos mediante `MeshToonMaterial` o equivalente. | Rampa lineal de sombra, medio tono y luz **0,28 / 0,58 / 1,00**. Como textura de 8 bits, **71 / 148 / 255**, con muestreo de vecino más cercano y sin conversión sRGB. |
| Contorno | Inverted hull con copia expandida, caras invertidas y color `#1B1714`. | Expandir **0,012 u** a lo largo de la normal. Reservar el contorno para la silueta y los bordes visibles que ayuden a leer la forma. |
| Papel | Textura rayada sobre toda la imagen, en modo multiplicar y con opacidad baja. | Opacidad **6 %** y rayado fino inclinado **18°**. La textura queda quieta en pantalla. |
| Vinilo | Acabado satinado con banda especular en arco que gira junto al disco. | Arco toon de **60°**, ancho radial de **0,16 u**, color `#575B60` y opacidad **45 %**. |

## Muñeco

**Fijo.** Cabeza redonda, dos ojos como puntos negros y una ceja fina sobre cada uno. Cara con ojos y cejas únicamente. Torso de cápsula. Cejas, postura e inclinación de cabeza expresan neutralidad, duda o severidad. Geometría de formas suaves.

**Propuesta aprobada de escala.** Un LP de **3,00 u** de diámetro define la escala. La base del tocadiscos mide **4,40 × 3,65 × 0,42 u** en ancho, fondo y alto. El muñeco mide **3,08 u** de pie, el 70 % del ancho del tocadiscos.

| Pieza o expresión | Medida propuesta y aprobada |
|---|---|
| Cabeza | Esfera de **0,96 u** de diámetro. |
| Torso | Cápsula de **1,32 u** de alto y **0,82 u** de diámetro. |
| Brazos y piernas | Brazos de **0,94 × 0,26 u** y piernas de **0,62 × 0,30 u**, en largo y diámetro. Pies de **0,18 u** de alto. |
| Ojos y cejas | Ojos de **0,055 u** de diámetro, separados **0,38 u** entre centros. Cejas de **0,15 × 0,018 u**. |
| Neutra | Cejas horizontales y cabeza a **0°**. |
| Duda | Una ceja sube **0,055 u** e inclinación lateral de **10°**. |
| Severa | Cada ceja baja **16°** hacia el centro e inclinación hacia adelante de **6°**. |

## Iluminación

**Fijo.** Principal cálida `#F4D58A` en diagonal desde la ventana, con sombras proyectadas suaves sobre el piso y las paredes. Relleno frío desde el lado opuesto y luz de contorno detrás. Oclusión ambiental en esquinas y bajo objetos. Haz con polvo determinista a partir de una semilla y el fotograma.

**Propuestas aprobadas para Three.js.** Las posiciones son relativas a la zona de interés. Y es vertical y +Z apunta hacia el frente de la maqueta.

| Luz o efecto | Parámetros propuestos y aprobados |
|---|---|
| Principal direccional | `#F4D58A`, intensidad **2,15**, posición **(−4,5 · 6,5 · −2,5) u**. Shadow map **2048 × 2048**, filtrado PCF, radio **2,5 texeles**, `bias` **−0,00025** y `normalBias` **0,012 u**. |
| Relleno direccional | `#AFC3D4`, intensidad **0,58**, posición **(4,5 · 3,5 · 3,5) u**. |
| Contorno direccional | `#FFE4AF`, intensidad **0,85**, posición **(2 · 4 · −5) u**. |
| Hemisférica | Cielo `#D8E1DB`, suelo `#A29780`, intensidad **0,32**. |
| Oclusión ambiental | Radio de **0,22 u** y atenuación máxima de **24 %**. |
| Haz y polvo | Haz `#F4D58A` al **8 %** de opacidad y **40 motas** con semilla **1147**. El tiempo se calcula como fotograma dividido por FPS. |

## Textos en pantalla

- **Fijo.** Blanco, grueso y con borde oscuro. Máximo cinco palabras por rótulo. Ubicar el texto entre el **62 % y el 75 %** de la altura del cuadro, medido desde arriba.
- **Propuesta aprobada.** Space Grotesk **700**, tamaño **58 px**, relleno `#FFFFFF` y borde `#1B1714` de **4 px** en la composición de 1080 × 1920.

## Prioridades si algo choca

1. **Fijo.** Rigor en `AGENTS.md`.
2. **Fijo.** Este `docs/ESTILO.md`, con los valores aprobados.
3. **Fijo.** La lista de correcciones del usuario.
4. **Fijo.** Guía voxel aplicada a detalles de objetos, como biseles y piezas modulares. El surco usa geometría continua con sección en V y el muñeco usa formas suaves.

## Descartado

- Bocina de gramófono.
- Surco de cubos.
- Fondo vacío en degradado.

## Próxima revisión

**Fijo.** Tras aprobar esta guía, construir únicamente la escena 1, del macro rasante del surco al plano general del living con el tocadiscos eléctrico. Entregar tres capturas, de inicio, mitad y final. Las demás escenas esperan la aprobación de la escena 1.
