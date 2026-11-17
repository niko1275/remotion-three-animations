# Tu cerebro puede hacerte confesar algo que nunca hiciste

## Dirección visual

La referencia principal es **EfectoFoco**. Sus personajes y muebles están construidos con campos de distancia en GLSL. Las sillas, cuerpos y extremidades combinan cajas redondeadas, cápsulas y esferas. El contorno se calcula al comparar rayos vecinos. La escena de prueba toma de ahí las proporciones sentadas, la geometría de cabeza, pelo y ojos, los colores, las sombras suaves y el grano. La sala oscura usa el foco cálido y las sombras frías de esa misma paleta.

**Workshop**, **HospitalStory** y **GraphicNovel** usan otras representaciones del personaje, con mallas pintadas o GLB. Revisé sus recursos de puesta en escena y sus animaciones por fotograma. La continuidad de este Short parte del personaje de EfectoFoco.

## Tratamiento de los siete momentos

| Momento | Acción, cámara y transición |
| --- | --- |
| 1. La acusación | Una luz cálida delimita la mesa en una sala oscura. Un plano de conjunto fija el eje. El investigador se inclina con las manos apoyadas junto al formulario. En el contraplano, el estudiante, más expuesto a la luz, recoge las manos y niega con la cabeza. La última pregunta se formula en el plano sobre el hombro del investigador, mientras la mirada del estudiante cae hacia la mesa. Es la apertura dramatizada. |
| 2. El experimento | Corte de la luz de la mesa al brillo de un monitor CRT. El mismo protagonista escribe, el monitor se apaga y las manos se detienen. «1996» entra con los rótulos de EfectoFoco. |
| 3. El falso testigo | El estudiante sigue sentado. Una figura a un lado del monitor asegura haberlo visto tocar Alt. Él lo niega y baja los hombros. Un acercamiento gradual deja al testigo fuera del encuadre. |
| 4. La duda | Corte entre su rostro y sus manos quietas. Baja la cabeza hacia los dedos y luego mira el teclado. El foco del monitor cae sobre la tecla mientras el resto conserva el tratamiento de sombras. |
| 5. El falso recuerdo | Tres cortes breves repiten una mano acercándose a Alt desde arriba, en perfil y desde la mirada del estudiante. Cada fragmento vuelve al comienzo del gesto. El rótulo «¿Y si sí la toqué?» y el regreso a sus manos quietas presentan la secuencia como una posibilidad. |
| 6. La revelación | El escritorio queda en penumbra y las cifras entran sucesivamente con el tamaño, peso y contorno del rótulo original. «69 % firmó una confesión falsa». «28 % mostró internalización de la culpa». La atribución visible identifica a Kassin y Kiechel (1996) y remite al grupo total del estudio. |
| 7. El cierre | Regreso al rostro con un avance lento. La habitación se desvanece mientras el personaje sostiene la mirada. Entra la pregunta «¿Y si pudieran convencerte de recordar algo que nunca ocurrió?». |

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
| General | 0–42 | Silencio |
| Investigador | 42–135 | 53–121 |
| Estudiante | 135–231 | 149–221 |
| Sobre el hombro del investigador | 231–354 | 244–327 |

Los intervalos están en fotogramas a 30 fps, con el final excluido. Edita `shots` en `src/scenes/la-acusacion/timeline.ts` para ajustar la duración de cada plano y el texto, inicio y duración de las intervenciones. El inicio de cada intervención se mide desde el corte. Las pausas de articulación se miden desde el inicio de la intervención. `accusationCues` expone las posiciones absolutas y se actualiza al cambiar las duraciones. Úsalas como puntos de entrada al montar las voces definitivas. El movimiento de boca es provisional y los rótulos permanecen visibles durante las pausas dentro de una frase.
