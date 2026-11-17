# Dirección artística del taller

Referencia: imagen del taller compartida en la conversación, con dos personajes, mesa verde, cámara elevada, luz lateral y bombilla dibujada. La distribución se conserva. Esta entrega mejora la interpretación procedural; no reproduce exactamente los personajes ni las texturas creadas a mano de la referencia.

Todos los fotogramas de fase se exportaron con Remotion en el fotograma 45, 1280 × 960, Chromium y WebGL `swangle`. Se inspeccionó cada imagen antes de continuar. La imagen final incluye una corrección adicional de suavidad de sombras.

| Fase | Cambio y evaluación visual | Fotograma |
| --- | --- | --- |
| 1. Iluminación | Luz lateral cálida, relleno frío, contactos y esquinas. La mesa se separa del fondo, pero las sombras y el tinte cálido necesitan moderación. | [Ver](01-lighting.png) |
| 2. Materiales | Rampa toon filtrada, variación tonal espacial y pinceladas suaves fijas. Se modera la dominante cálida y se usa VSM para las sombras. | [Ver](02-materials.png) |
| 3. Contornos | Siluetas extruidas por normal y líneas discretamente irregulares. Se reduce la cuadrícula para que no compita con los personajes. | [Ver](03-contours.png) |
| 4. Personajes | Abrigo largo, pliegues, puños, pulgar, cabello en masas mayores, asimetría y colores por cara. Se detectan mechones y pliegues demasiado destacados. | [Ver](04-characters.png) |
| 5. Composición | Cámara elevada y encuadre más cerrado; se integran mechones y pliegues. Personajes y cuaderno ganan presencia sin mover muebles. | [Ver](05-composition.png) |
| 6. Color | Saturación contenida, ajuste suave de contraste, sombras frías y viñeta. Corrección final de filtrado de sombras. | [Ver](06-grade.png) |

## Componentes reutilizables

- `Painted.tsx`: material toon con rampa filtrada, variaciones por normal y shader de pinceladas en coordenadas locales. No contiene tiempo ni ruido aleatorio. Los materiales se reutilizan y se liberan al desmontar.
- `Ink.tsx`: contorno por extrusión de normales; variación fija de grosor. Líneas de muebles memorizadas, sin generar geometrías en cada fotograma.
- `Atmosphere.tsx`: luces y oclusión de contacto analítica mediante planos con gradiente. Es una aproximación artística de AO, no SSAO ni oclusión global calculada sobre toda la geometría. Los contactos son colocados para esta distribución; hay que actualizarlos si los personajes caminan.
- `FilmGrade.tsx`: viñeta y gradientes de color compuestos por Chromium. El ajuste de saturación/contraste se aplica al lienzo. No usa historial temporal ni grano animado.
- `Characters.tsx`: mallas de secciones elípticas con asimetría y colores por triángulo. Conserva la secuencia de escritura, explicación y respuesta.

## Reproducir

```sh
npm ci
npm start -- --no-open
npm run render:workshop
```

Alternativa por software si ANGLE no está disponible:

```sh
npm run render:workshop -- --gl=swangle
```

Los parámetros de cámara están en `Kit.tsx`; luces y suavidad VSM en `Atmosphere.tsx`. La geometría moderada, los gradientes fijos y la ausencia de efectos temporales mantienen el coste acotado. El resultado puede variar entre controladores WebGL; la comprobación de determinismo compara ejecuciones del mismo entorno.

## Validación

- TypeScript y bundle completados.
- Seis fotogramas de fase exportados e inspeccionados.
- Dos renders independientes del fotograma 45 producen el mismo SHA-256: `dbc11db784466901ce6bd130f27e80d3312d11d5380576fbbe3417a275adec14`.
- Se exportó e inspeccionó un fotograma de Hospital después de los cambios compartidos.
- Exportación completa de Workshop: 8 segundos, 240 fotogramas, muestra de 640 × 480. Se inspeccionaron poses intermedias a intervalos de dos segundos.

[Vídeo final de muestra](../previews/workshop-animation.mp4)
