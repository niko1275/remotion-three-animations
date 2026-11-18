# Voces y sincronización

La primera fase añade dos composiciones de prueba en **Shorts**, **LaAcusacionVoces** y **PruebaLoopVoces**. Las composiciones visuales aprobadas siguen disponibles con sus tiempos originales. El proyecto funciona con Node.js 18.20.4.

## Guion y personajes

[Guion maestro](guion-maestro.json) recoge literalmente las intervenciones de las siete escenas, con sus IDs, personaje, plano o planos, entradas y duraciones provisionales, y eventos disponibles. Los textos se leen de las líneas de tiempo originales. Los pensamientos de la escena 5 pertenecen al estudiante. La sincronización de imagen y audio de esta fase se aplica únicamente a la escena 1 y a los recortes de la prueba de unión.

- `s1-01` · Investigador · «Fuiste tú. Presionaste la tecla.»
- `s1-02` · Estudiante · «No. Estoy seguro de que no fui yo.»
- `s1-03` · Investigador · «Entonces, ¿por qué ella dice que te vio hacerlo?»
- `s7-03` · Narrador · «Y si alguien pudiera convencerte de que hiciste algo que nunca ocurrió...»

`npm run voices -- script` imprime el guion maestro. `npm run voices -- report` combina ese guion con los MP3, duraciones reales, timestamps y estado de aprobación locales. Para la escena 1 incluye los fotogramas recalculados con las pausas predeterminadas. Las demás escenas conservan entradas provisionales.

## Importar y revisar en local

Desde la carpeta del proyecto, detén Studio si está corriendo e instala las dependencias.

```cmd
npm ci
npm run voices -- import s1-01 "C:\ruta\investigador.mp3"
npm start -- --no-open
```

Abre la URL **Local** y selecciona **Shorts → LaAcusacionVoces**. Importa las otras intervenciones pasándoles su propio ID. Refresca Studio después de importar. Si el navegador conserva el manifiesto anterior, reinicia Studio para que recalcule la duración.

La herramienta mide el MP3 y conserva un archivo independiente para cada intervención en `public/voices/`. `manifest.json` guarda el texto exacto, la duración, los recortes y los tiempos disponibles. La carpeta está excluida de Git. Para sustituir un borrador usa `--replace`. Para proteger una toma aprobada usa `npm run voices -- approve s1-01`.

Opcionalmente pasa `--words "C:\ruta\palabras.json"` con marcas en segundos desde el inicio del **MP3 original**. Por ejemplo, para `s1-01`:

```json
[
  {"text":"Fuiste","start":0.06,"end":0.33},
  {"text":"tú.","start":0.34,"end":0.57},
  {"text":"Presionaste","start":0.76,"end":1.36},
  {"text":"la","start":1.38,"end":1.51},
  {"text":"tecla.","start":1.54,"end":1.98}
]
```

Sustituye los tiempos de ejemplo por los de tu toma. Para retirar silencio del archivo puedes indicar `--in 0.05 --out 2.12`. Con timestamps, el importador comprueba que el intervalo conserve las palabras completas. Sin timestamps, los rótulos se muestran por frases con un reparto estimado del tiempo y se desactiva el resaltado por palabra.

## Planos, pausas y subtítulos

`src/voice/timing.ts` convierte la duración útil a fotogramas a 30 fps. Recalcula las entradas y alarga o acorta las ventanas de diálogo. Las poses siguen siendo evaluadas por fotograma a través de las animaciones existentes. Cuando hay marcas por palabra, el corte interior de la primera intervención busca un fin de palabra y los eventos de gesto se pueden asociar a una palabra o a un segundo del MP3. Se mantiene una sola pista continua incluso al cruzar un corte de cámara.

Los valores predeterminados de las pruebas están en `src/voice/preview.tsx`. Puedes usar `subtitles: false`, ajustar el volumen de ambiente o proporcionar `pauses: {"s1-02": 0.45, "s1-03": 0.35}` para cambiar las pausas anteriores a esas frases. Los subtítulos reutilizan el rótulo de Efecto Foco y el resaltado por palabra se limita a palabras clave sincronizadas.

## Prueba de la unión

**Shorts → PruebaLoopVoces** usa 3 segundos del cierre y 3 de la apertura, dos veces. Las uniones de interés están en 0:03 y 0:09. Si importas la línea final que ya tengas como `s7-03`, su audio se coloca al ras del reinicio y `s1-01` empieza desde el primer fotograma del siguiente recorte. La composición evita recortar palabras en los bordes externos del extracto con los timestamps. Un MP3 que exceda el extracto y carezca de timestamps se omite en esa prueba. La escena 1 completa sigue reproduciendo su toma entera.

Para comprobar un ambiente continuo, coloca una pista local en `public/voices/ambiente.mp3` y asigna `ambience: 'voices/ambiente.mp3'` en las propiedades de la prueba. La pista se monta una sola vez durante los 12 segundos y sigue sonando sobre ambas uniones. Los rótulos dejan libres los fotogramas de unión. Ajusta los recortes de silencio tras oír las tomas definitivas. La prueba conserva las respiraciones que estén dentro del intervalo elegido.

## Preparar la primera prueba de ElevenLabs

Las cuatro voces del proyecto están en [configs/voices.ts](../../configs/voices.ts). Si tienes un `configs/voices.local.json` de la versión anterior, cualquier ID rellenado sigue teniendo prioridad. Puedes retirar ese archivo local para usar las cuatro voces del proyecto.

Ejecuta `npm run voices -- plan` para revisar las tres intervenciones de la escena 1, sus voces, planos y gestos. Este comando funciona sin clave y sin llamar a ElevenLabs.

Cuando autorices la generación, define `ELEVENLABS_API_KEY` en el entorno local de Node y ejecuta un comando por intervención desde CMD.

```cmd
npm run voices -- generate s1-01 --confirm-paid
npm run voices -- generate s1-02 --confirm-paid
npm run voices -- generate s1-03 --confirm-paid
```

Cada comando genera un MP3 local y guarda los timestamps disponibles en el manifiesto. La clave solo la lee el proceso de Node. El script no carga `.env` automáticamente y no incluye la clave en el navegador. Para revisar las tomas, abre **Shorts → LaAcusacionVoces**. Si quieres probar la unión con ambas voces, importa una toma local para `s7-03` o autoriza su generación por separado.

La generación usa el endpoint oficial con timestamps. Guarda el MP3 por intervención y la alineación de palabras disponible. Las respuestas exitosas se respaldan con su alineación original en `.voice-work/` para que una validación fallida no obligue a pagar otra vez. Ante un error de red, revisa el historial antes de reintentar. [API de ElevenLabs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
