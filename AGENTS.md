# Cómo funciona un disco de vinilo

## Estado

- Etapa 1 aprobada. Guion de 76 segundos y tratamiento voxel basados en la referencia aprobada y el brief.
- Etapa 2 implementada para revisión. **Shorts → ViniloAnimatico** muestra ocho fichas provisionales con guion, cámara, acción, sonido, rótulos y cortes. La referencia de estilo en esta etapa es el brief y el reel voxel aprobados.
- Fuente de verdad: `src/timeline.ts`. Los inicios son acumulados. El total estimado es de 2280 fotogramas a 30 fps, en 1080 × 1920. Si se indica un audio en `voiceFiles`, Remotion mide su duración y desplaza las escenas siguientes. El ajuste conserva las pausas de entrada y salida de cada escena.
- A la espera de aprobación de la etapa 2 para producir los textos exactos de ElevenLabs en `public/audio/voz/escenaNN.txt`. La etapa 4 empieza con la apertura macro y continúa una escena por vez, tras aprobación. Verificar `docs/ESTILO.md` y la ubicación de `Pieza`, `Muneco`, `Escenario`, `Textos` y `Papel` antes de construir escenas.

## Rigor

| Afirmación | ¿Documentada? | Fuente |
|---|---|---|
| Una espiral continua por cara en un LP convencional. | Sí. | [BBC, monografía 5](https://downloads.bbc.co.uk/rd/pubs/archive/pdffiles/monographs/bbc_monograph_05.pdf) |
| La punta de zafiro calentada talla la laca sobre aluminio y deja una viruta continua que se aspira. | Sí, para la variante de corte mostrada. | [Takt Direct](https://www.takt-direct.com/templates-faq/), [SST](https://www.sst-ffm.de/en/ausstattung) |
| A la misma velocidad de avance, los agudos quedan más juntos que los graves. | Sí, por la relación entre velocidad, frecuencia y longitud de onda. | [OpenStax](https://openstax.org/books/physics/pages/13-2-wave-properties-speed-amplitude-frequency-and-period) |
| En estéreo, pared interior izquierda y exterior derecha. | Sí. | [IASA](https://iasa-web.org/book/export/html/474) |
| Laca plateada, baño de níquel y copias padre negativo, madre positiva y molde negativo. | Sí, para galvanoplastia de tres pasos. | [MPO](https://mpo-international.com/en/blog/vinyl-pressing-the-secrets-behind-mpos-craftsmanship/), [Electromastering Lab](https://recordplating.com/our-processes/) |
| Dos moldes prensan PVC caliente. La prensa enfría el disco antes de abrir. | Sí. | [The VinyLab](https://www.thevinylab.com/our-process) |
| En una cápsula de imán móvil, la aguja mueve el imán junto a bobinas fijas. El parlante convierte la señal amplificada en sonido. | Sí. | [Ortofon, cápsula de imán móvil](https://ortofon.com/pages/what-is-moving-magnet/), [Ortofon, electromagnetismo](https://ortofon.com/pages/discovery-of-electromagnetism) |
| La curva RIAA atenúa graves y realza agudos al grabar. El preamplificador aplica el ajuste inverso. | Sí. | [Audio-Technica](https://docs.audio-technica.com/eu/Cartridges_Glossary_EN.pdf) |
| El LP de fondo gira a 33⅓ rpm. A 30 fps, son 54 fotogramas por vuelta. | Sí. La equivalencia es un cálculo. | [IASA](https://iasa-web.org/book/export/html/474) |

## Convenciones para las escenas

- Mantener la transformación voxel de la referencia y la paleta del brief. Reutilizar los componentes compartidos cuando estén disponibles. Modelos del torno, prensa y tocadiscos en archivos propios.
- Derivar el movimiento de `useCurrentFrame()`. Las escalas del macro, los colores de los canales, el vapor y el pulso de luz del cable son recreaciones didácticas.
- Los rótulos finales ocupan entre el 62 % y el 75 % del cuadro y tienen un máximo de cinco palabras. Las fichas de producción muestran además guion e indicaciones de montaje.
