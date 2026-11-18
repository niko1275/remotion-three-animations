# Cerebro Tramposo con narrador único

El [guion editable](../../src/voice/narration.ts) contiene siete bloques, de `n1` a `n7`, con frases, planos de origen y eventos visuales. Los bloques usan la voz del narrador de `configs/voices.ts`. Las grabaciones previas por diálogo conservan sus propios IDs. **Shorts → CerebroTramposoNarrado** reproduce exclusivamente los bloques del nuevo guion.

```cmd
npm run voices -- narration
npm start -- --no-open
```

El informe muestra los siete textos completos, el nombre real del MP3 importado, su duración medida, la entrada de la escena, sus planos y sus eventos. Antes de grabar, el MP3 y su duración figuran como `null`. Los tiempos de imagen parten de las duraciones originales. Abre la URL Local de Studio y elige **Shorts → CerebroTramposoNarrado** para revisar el montaje.

Una vez aprobado el guion, cada intervención se genera como un solo MP3. Por ejemplo, para generar la escena 1 con la clave local de ElevenLabs:

```cmd
npm run voices -- generate n1 --confirm-paid
```

Usa el ID correspondiente para las demás escenas. Para rehacer una toma que aún no has aprobado, añade `--replace`. También puedes importar un MP3 local con `npm run voices -- import n1 "ruta-del-archivo.mp3"`. Guarda la clave en `.env.local`. Los MP3 y las marcas quedan en el manifiesto local y no se suben al repositorio.

La imagen se ajusta a la duración útil de cada MP3. Los eventos se alinean con el inicio de la frase correspondiente cuando hay marcas por palabra. Sin marcas se estima la entrada en proporción al texto. Para corregir una entrada manualmente, añade `atSeconds` al evento en el guion. Ese tiempo se mide desde el inicio del MP3 original. El texto de cada bloque es la unión de sus frases en orden.

En Studio, `pauses` añade tiempo después de un bloque, por ejemplo `{"n4":0.25}`. El cierre no admite una pausa adicional después de la última frase. Puedes ajustar las pausas dentro de una escena mediante la puntuación del guion antes de generar la toma. Los recortes `--in` y `--out` permiten quitar silencio de los extremos sin partir palabras cuando hay marcas.

El cierre recupera el encuadre de la apertura y el narrador vuelve a entrar en el fotograma 0. Los subtítulos dejan libre la unión visual. La pista opcional `ambience` puede recorrer el montaje completo. Para usarla en un loop, el archivo y su punto de unión deben comprobarse al editar con las tomas definitivas.
