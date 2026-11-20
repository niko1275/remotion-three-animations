# Cómo funciona un disco de vinilo

## Estado

- Etapa 1 aprobada. Guion de 76 segundos y tratamiento voxel basados en la referencia aprobada y el brief.
- Etapa 2 implementada para revisión. **Shorts → ViniloAnimatico** muestra ocho fichas provisionales con guion, cámara, acción, sonido, rótulos y cortes. La versión revisada por el usuario todavía muestra el modelo acústico en algunas fichas. Su reemplazo por un tocadiscos eléctrico es la primera corrección de producción.
- Fuente de verdad: `src/timeline.ts`. Los inicios son acumulados. El total estimado es de 2280 fotogramas a 30 fps, en 1080 × 1920. Si se indica un audio en `voiceFiles`, Remotion mide su duración y desplaza las escenas siguientes. El ajuste conserva las pausas de entrada y salida de cada escena.
- Las ocho escenas se trabajan sin locución. Se incorporará la voz con ElevenLabs cuando estén disponibles las tomas.
- Guía `docs/ESTILO.md` aprobada. **Shorts → ViniloEscena1** presenta la apertura independiente, con surco continuo en V, tocadiscos eléctrico, amplificador y dos parlantes en el living. La cámara se aleja en un plano continuo. La revisión es silenciosa.
- Escena 1 aprobada por el usuario. Se revisaron las capturas de los fotogramas 0, 135 y 269 a 1080 × 1920. La composición de revisión es **Shorts → ViniloEscena1**.
- Variante del gancho para revisar en Remotion. «Estás dentro de una canción» abre desde el primer fotograma. El rótulo se retira antes de revelar la espiral, y el texto de voz queda en el timeline para ElevenLabs.
- Escenas 2 a 8 construidas para revisión. **Shorts → ViniloCompleto** monta los ocho planos de producción en 2280 fotogramas. Las escenas 2–3 comparten el estudio, 4–5 comparten la fábrica y 6–8 reutilizan el living y el sistema eléctrico de la apertura. Cada bloque se revisó con capturas renderizadas desde la composición completa.

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
| El equipo del corto es un tocadiscos eléctrico. La señal de la cápsula llega por cable a la etapa de fono y al amplificador, que alimenta dos parlantes. El gramófono de bocina representa reproducción acústica, asociada históricamente a discos de goma laca. | Sí. Mostrar plato, brazo con contrapeso, cápsula y aguja. La onda del final sale de los conos de los parlantes. | [Ortofon, electromagnetismo](https://ortofon.com/pages/discovery-of-electromagnetism), [Smithsonian, reproducción mecánica](https://americanhistory.si.edu/explore/exhibitions/americas-listening/online/edisons-talking-machine), [Library of Congress, soportes y velocidades](https://loc.gov/marc/bibliographic/bd007s.html) |
| La curva RIAA atenúa graves y realza agudos al grabar. El preamplificador aplica el ajuste inverso. | Sí. | [Audio-Technica](https://docs.audio-technica.com/eu/Cartridges_Glossary_EN.pdf) |
| El LP de fondo gira a 33⅓ rpm. A 30 fps, son 54 fotogramas por vuelta. | Sí. La equivalencia es un cálculo. | [IASA](https://iasa-web.org/book/export/html/474) |

## Convenciones para las escenas

- Mantener la transformación voxel de la referencia y la paleta del brief. Reutilizar los componentes compartidos cuando estén disponibles. Modelos del torno, prensa y tocadiscos en archivos propios.
- Derivar el movimiento de `useCurrentFrame()`. Las escalas del macro, los colores de los canales, el vapor y el pulso de luz del cable son recreaciones didácticas.
- Los rótulos finales ocupan entre el 62 % y el 75 % del cuadro y tienen un máximo de cinco palabras. Las fichas de producción muestran además guion e indicaciones de montaje.
