# Tu cerebro puede hacerte confesar algo que nunca hiciste

## Dirección visual

La referencia principal es **EfectoFoco**. Sus personajes y muebles están construidos con campos de distancia en GLSL. Las sillas, cuerpos y extremidades combinan cajas redondeadas, cápsulas y esferas. El contorno se calcula al comparar rayos vecinos. La escena de prueba toma de ahí las proporciones sentadas, la geometría de cabeza, pelo y ojos, los colores, las sombras suaves y el grano. La sala oscura usa el foco cálido y las sombras frías de esa misma paleta.

**Workshop**, **HospitalStory** y **GraphicNovel** usan otras representaciones del personaje, con mallas pintadas o GLB. Revisé sus recursos de puesta en escena y sus animaciones por fotograma. La continuidad de este Short parte del personaje de EfectoFoco.

## Tratamiento de los siete momentos

| Momento | Acción, cámara y transición |
| --- | --- |
| 1. La acusación | Una luz cálida delimita la mesa en una sala oscura. Un plano de conjunto fija el eje. El investigador se inclina con las manos apoyadas junto al formulario. En el contraplano, el estudiante, más expuesto a la luz, recoge las manos y niega con la cabeza. La última pregunta se formula en el plano sobre el hombro del investigador, mientras la mirada del estudiante cae hacia la mesa. Es la apertura dramatizada. |
| 2. El experimento | Corte de la luz de la mesa al brillo de un monitor CRT. El mismo protagonista escribe mientras el monitor muestra las letras del dictado. «1996» entra con los rótulos de EfectoFoco. |
| 3. La trampa | El sistema falla, el investigador acusa al estudiante y el corte captura su sorpresa. Él niega la acusación y el acercamiento final muestra ALT en reposo. |
| 4. El falso testigo y la duda | Después del testimonio, corte entre su rostro y sus manos quietas. Baja la cabeza hacia los dedos y luego mira el teclado. El foco del monitor cae sobre la tecla mientras el resto conserva el tratamiento de sombras. |
| 5. El falso recuerdo | Tres cortes breves repiten una mano acercándose a Alt desde arriba, en perfil y desde la mirada del estudiante. Cada fragmento vuelve al comienzo del gesto. El rótulo «¿Y si sí la toqué?» y el regreso a sus manos quietas presentan la secuencia como una posibilidad. |
| 6. La revelación | El escritorio queda en penumbra y las cifras entran sucesivamente con el tamaño, peso y contorno del rótulo original. «69 % firmó una confesión falsa». «28 % mostró internalización de la culpa». La atribución visible identifica a Kassin y Kiechel (1996) y remite al grupo total del estudio. |
| 7. El cierre | La mirada en primera persona vuelve al plano general de la apertura. Una frase abierta enlaza con la acusación cuando se repite el Short. |

Fuentes del experimento y las cifras. [Kassin y Kiechel (1996)](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1996.tb00344.x) · [Kassin y Gudjonsson (2004), tabla 5](https://journals.sagepub.com/doi/full/10.1111/j.1529-1006.2004.00016.x)

## Revisión de la primera escena

Abre **Shorts → LaAcusacion** en Remotion Studio. La composición dura 11,8 segundos, en 540 × 960 a 30 fps.

```sh
npm start
npm run render:la-acusacion
```

El render guarda un MP4 sin audio en `out/la-acusacion.mp4`.

| Plano | Intervalo | Diálogo |
| --- | --- | --- |
| General | 0–42 | «Fuiste tú. Presionaste la tecla.» comienza en 0 |
| Investigador | 42–135 | La primera intervención continúa hasta 68 |
| Estudiante | 135–231 | 149–221 |
| Sobre el hombro del investigador | 231–354 | 244–327 |

Los intervalos están en fotogramas a 30 fps, con el final excluido. Edita `shots` en `src/scenes/la-acusacion/timeline.ts` para ajustar la duración de cada plano y el texto, inicio y duración de las intervenciones. El inicio de cada intervención se mide desde el corte. Las pausas de articulación se miden desde el inicio de la intervención. `accusationCues` expone las posiciones absolutas y se actualiza al cambiar las duraciones. Úsalas como puntos de entrada al montar las voces definitivas. El movimiento de boca es provisional y los rótulos permanecen visibles durante las pausas dentro de una frase.

## Escena 2 · El experimento

En **Shorts → ElExperimento** puedes revisar los cuatro planos a 1080 × 1920 y 30 fps. La versión provisional dura 18 segundos, sin audio.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| Laboratorio | 0–4 s | Presentación del estudiante, el CRT y el año 1996. |
| Tarea | 4–9 s | El estudiante escribe y el CRT muestra las letras del ejercicio de dictado. |
| Regla | 9–14 s | Detalle del teclado con «NO PRESIONAR ALT». |
| Anticipación | 14–18 s | Últimas pulsaciones en teclas de letras cercanas a ALT y corte directo. |

Edita los planos en `src/scenes/el-experimento/timeline.ts` y las tres intervenciones del narrador en `src/scenes/el-experimento/narration.ts`. Las duraciones se expresan en fotogramas. Las pulsaciones se ajustan a la duración de su plano. Los tiempos de narración son independientes y se pueden reubicar cuando se incorporen las voces.

`npm run render:el-experimento` guarda el MP4 en `out/el-experimento.mp4`. Para una muestra de menor resolución, usa `npm run render:el-experimento -- --width=540 --height=960`.

## Escena 3 · La trampa

Abre **Shorts → LaTrampa** en Studio. La escena provisional dura 18 segundos, en 1080 × 1920 a 30 fps y sin audio.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| Fallo | 0–4 s | Se congelan las letras y el cursor. Tras dos parpadeos breves aparece el error del sistema. |
| Acusación | 4–9 s | El investigador señala el CRT desde el costado de la mesa. El corte llega al terminar «Presionaste la tecla ALT». |
| Negación | 9–13 s | La advertencia continúa fuera de campo sobre la reacción del estudiante. Él retira las manos y responde. |
| Revelación | 13–18 s | La cámara avanza sobre ALT en reposo. La narración revela la falsa acusación antes del fundido a negro. |

En `src/scenes/la-trampa/timeline.ts` se editan por separado los planos, los inicios de las acciones, los diálogos y la narración. Los tiempos de sincronización están en fotogramas. El render con `npm run render:la-trampa` se guarda en `out/la-trampa.mp4`.

## Escena 4 · El falso testigo

Abre **Shorts → ElFalsoTestigo** en Studio. La composición dura 15 segundos a 1080 × 1920 y 30 fps. Las intervenciones se muestran como rótulos y la escena está preparada para incorporar audio más adelante.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| Investigador | 0–3 s | El investigador dirige la atención a la testigo. El estudiante sigue sentado. |
| Testigo | 3–6 s | Desde el fondo del laboratorio, la testigo confirma la acusación con un asentimiento breve. |
| Reacción | 6–10 s | El estudiante levanta la mirada y retira ligeramente las manos mientras escucha. |
| Duda | 10–15 s | La mirada baja hacia el teclado y la cámara se acerca. |

Los textos están en `src/scenes/el-falso-testigo/script.ts`. En `timeline.ts` están las duraciones de los planos y los tiempos independientes de diálogo, narración y acciones, en fotogramas. `Testigo.ts` contiene la geometría procedural del nuevo personaje. Para exportar un MP4, usa `npm run render:el-falso-testigo`.

## Escena 5 · El falso recuerdo

Abre **Shorts → ElFalsoRecuerdo** en Studio. La composición dura 16 segundos a 1080 × 1920 y 30 fps, sin audio.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| Duda | 0–3 s | Continuación del encuadre de la escena 4. El estudiante mira hacia abajo y se pregunta si pudo haber sido él. |
| Fragmento 1 | 3–6 s | La mano se acerca a ALT, vacila y se retira un poco. |
| Fragmento 2 | 6–9 s | El gesto reaparece a medio camino, desde el lado contrario. Se interrumpe y vuelve a avanzar. |
| Fragmento 3 | 9–12 s | El plano se estrecha alrededor del índice y ALT. El montaje corta mientras el dedo aún se acerca, por encima de la tecla. |
| Regreso | 12–16 s | Vuelve el campo sobre el estudiante y el CRT sigue en estado de error. Las manos se recogen. |

Los textos están en `src/scenes/el-falso-recuerdo/script.ts`. `timeline.ts` separa los tiempos de las voces, la duración de los planos y la trayectoria de cada fragmento. El acercamiento de la mano se calcula aparte de la señal del teclado. El MP4 se exporta con `npm run render:el-falso-recuerdo`.

## Escena 6 · Los resultados

Abre **Shorts → LosResultados**. La escena dura 18 segundos a 1080 × 1920 y 30 fps, sin audio.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| La confesión | 0–5 s | El estudiante firma una declaración ficticia. Aparece el 69 %. |
| La culpa | 5–10 s | El estudiante baja la mirada hacia sus manos. Aparece el 28 %. |
| Los detalles inventados | 10–14 s | Alternan tres fragmentos mentales de la escena anterior. Aparece el 9 %. |
| La verdad | 14–18 s | Acercamiento a ALT en reposo y fundido a negro. |

Las cifras usan el mismo denominador, los 75 participantes analizados. Son tres medidas del estudio. [Kassin y Kiechel (1996), resultados y discusión](https://saulkassin.org/wp-content/uploads/2024/07/kassin_kiechel_1996.pdf)

La narración está en `src/scenes/los-resultados/script.ts`; las duraciones y posiciones de las líneas, en `timeline.ts`. La trayectoria de la punta y el trazo escrito comparten los puntos de `signature.ts`. Exporta con `npm run render:los-resultados`.

## Escena 7 · El cierre

Abre **Shorts → ElCierre**. La composición dura 18 segundos a 1080 × 1920 y 30 fps, sin audio. La sala de la primera escena vuelve como representación dramática.

| Plano | Tiempo | Acción |
| --- | --- | --- |
| Regreso | 0–6 s | Plano general de la sala. El estudiante mantiene las manos juntas y la cabeza baja. |
| Primera persona | 6–13 s | Corte a la altura de sus ojos. El investigador sostiene la mirada y se adelanta apenas. |
| Enlace | 13–18 s | Regresa el plano general. Cámara y personajes se acomodan hasta coincidir con el fotograma inicial de la escena 1. |

La última frase de `src/scenes/el-cierre/script.ts` continúa hasta el límite de la composición. La intervención del investigador comienza en el fotograma 0 de la escena 1 y cruza su primer corte. Los rótulos se despejan en la unión para que el último y el primer fotograma compartan la misma imagen. Los tiempos de voz siguen editables en las líneas de tiempo de ambas escenas.

**Shorts → PruebaLoop** alterna los últimos 3 segundos de `ElCierre` y los primeros 3 de `LaAcusacion`, dos veces. Las uniones están en 0:03 y 0:09. La composición usa un solo lienzo de 1080 × 1920, como lo hará el montaje final. Exporta el cierre por separado con `npm run render:el-cierre`.
