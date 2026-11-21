export const VINYL_FPS = 30;
export const VINYL_WIDTH = 1080;
export const VINYL_HEIGHT = 1920;

type Cue = {readonly atFrame: number; readonly text: string};

type SceneDefinition = {
  readonly id: string;
  readonly title: string;
  readonly durationInFrames: number;
  readonly narration: string;
  readonly voiceLead: number;
  readonly voiceTail: number;
  readonly screenText: readonly Cue[];
  readonly visual: string;
  readonly camera: string;
  readonly animation: readonly Cue[];
  readonly transition: string;
  readonly sound: readonly Cue[];
};

export const vinylScenes = [
  {
    id: 'apertura',
    title: 'Una línea guarda música',
    durationInFrames: 270,
    narration: 'Estás dentro de una canción… Es el surco de un vinilo. Sus curvas guardan la forma del sonido.',
    voiceLead: 0,
    voiceTail: 22,
    screenText: [
      {atFrame: 0, text: 'Estás dentro de una canción'},
      {atFrame: 84, text: ''},
      {atFrame: 150, text: 'Curvas que guardan sonido'},
    ],
    visual: 'Macro rasante del surco continuo en V. Al alejarse la cámara, aparece el LP girando en el tocadiscos eléctrico del living.',
    camera: 'Macro rasante. Alejamiento continuo en perspectiva hasta el plano general del living.',
    animation: [
      {atFrame: 0, text: 'Recorrer un tramo del surco entre las dos paredes.'},
      {atFrame: 74, text: 'Alejarse sin perder la curva que seguía la cámara.'},
      {atFrame: 150, text: 'Revelar el disco completo y su única espiral.'},
    ],
    transition: 'Corte por coincidencia entre el LP y el disco de laca sobre el torno.',
    sound: [
      {atFrame: 0, text: 'Entra el crepitar.'},
      {atFrame: 150, text: 'Primera capa del motivo musical.'},
    ],
  },
  {
    id: 'torno',
    title: 'El corte del maestro',
    durationInFrames: 330,
    narration: 'Para grabar, la señal de la música hace vibrar una punta. La punta talla un surco que copia ese movimiento.',
    voiceLead: 6,
    voiceTail: 4,
    screenText: [
      {atFrame: 22, text: 'La punta vibra'},
      {atFrame: 134, text: 'El surco copia la vibración'},
    ],
    visual: 'La punta de zafiro vibra sobre la laca mientras talla una línea ondulada. La viruta sale del punto de corte.',
    camera: 'Plano oblicuo de mesa. Acercamiento lateral al punto de corte.',
    animation: [
      {atFrame: 0, text: 'Mostrar el cabezal y el disco de laca girando.'},
      {atFrame: 95, text: 'La punta vibra y avanza despacio hacia el centro.'},
      {atFrame: 164, text: 'La señal modula el surco continuo que talla la punta.'},
      {atFrame: 257, text: 'La viruta continua entra por el tubo de aspiración.'},
    ],
    transition: 'Corte desde la línea del torno a dos tramos ampliados del surco.',
    sound: [
      {atFrame: 16, text: 'Entrada seca del torno.'},
      {atFrame: 164, text: 'Roce fino de corte debajo de la locución.'},
    ],
  },
  {
    id: 'estereo',
    title: 'Un surco, dos canales',
    durationInFrames: 330,
    narration: 'Los graves dejan curvas más separadas. Los agudos, más juntas. En estéreo, una pared del surco guarda el canal izquierdo y la otra, el derecho.',
    voiceLead: 6,
    voiceTail: 12,
    screenText: [
      {atFrame: 10, text: 'Graves: curvas más separadas'},
      {atFrame: 69, text: 'Agudos: curvas más juntas'},
      {atFrame: 142, text: ''},
      {atFrame: 194, text: 'IZQ · DER'},
    ],
    visual: 'Grave y agudo a la misma escala y velocidad. Corte en V con la pared interior y la exterior identificadas.',
    camera: 'Frontal al tramo comparado. Giro hacia el corte transversal.',
    animation: [
      {atFrame: 0, text: 'Comparar el espaciado de las ondulaciones con la misma velocidad.'},
      {atFrame: 142, text: 'Girar para revelar las dos paredes inclinadas del surco.'},
      {atFrame: 185, text: 'Iluminar la pared interior, canal izquierdo.'},
      {atFrame: 269, text: 'Iluminar la pared exterior, canal derecho.'},
    ],
    transition: 'Corte del perfil en V al mismo perfil sobre la laca que entra al baño.',
    sound: [
      {atFrame: 15, text: 'Demostración suave de un tono grave.'},
      {atFrame: 69, text: 'Demostración suave de un tono agudo.'},
    ],
  },
  {
    id: 'galvanoplastia',
    title: 'El relieve se invierte',
    durationInFrames: 300,
    narration: 'Cubrimos la laca con níquel. Al despegar el metal, cada surco deja una cresta. De esa copia sale el molde.',
    voiceLead: 6,
    voiceTail: 7,
    screenText: [
      {atFrame: 16, text: 'Níquel sobre la laca'},
      {atFrame: 101, text: 'El hueco deja una cresta'},
      {atFrame: 181, text: 'De la copia al molde'},
    ],
    visual: 'Laca plateada en baño de níquel. Tres piezas muestran la secuencia negativo, positivo y negativo.',
    camera: 'Vista de la cuba. Repetir el encuadre del surco al separar la primera pieza.',
    animation: [
      {atFrame: 0, text: 'Sumergir la laca conductora y mostrar cómo se forma la capa de níquel.'},
      {atFrame: 98, text: 'Separar la cresta de metal del hueco de laca en el mismo encuadre.'},
      {atFrame: 181, text: 'Encadenar padre, madre y molde y enseñar sus perfiles alternados.'},
    ],
    transition: 'Corte del molde definitivo al mismo molde montado en la prensa.',
    sound: [
      {atFrame: 20, text: 'Agua breve al entrar al baño.'},
      {atFrame: 98, text: 'Pausa musical durante la primera separación.'},
    ],
  },
  {
    id: 'prensa',
    title: 'Del plástico al disco',
    durationInFrames: 210,
    narration: 'Dos moldes marcan el plástico caliente. Al enfriarse, el vinilo conserva las curvas.',
    voiceLead: 5,
    voiceTail: 9,
    screenText: [
      {atFrame: 22, text: 'Moldes y plástico caliente'},
      {atFrame: 133, text: 'El surco pasa al vinilo'},
    ],
    visual: 'Prensa de perfil. Dos moldes, uno por cara, rodean la galleta de PVC caliente.',
    camera: 'Perfil a media altura, con ambos moldes dentro del encuadre.',
    animation: [
      {atFrame: 0, text: 'Colocar la galleta de plástico entre los dos moldes.'},
      {atFrame: 78, text: 'Cerrar la prensa y extender el plástico caliente hasta formar el disco.'},
      {atFrame: 155, text: 'Abrir la prensa. El disco enfriado conserva el surco.'},
    ],
    transition: 'Corte por coincidencia del disco nuevo al plato del tocadiscos.',
    sound: [
      {atFrame: 78, text: 'Golpe seco de prensa.'},
      {atFrame: 152, text: 'Siseo breve y pausa al abrir.'},
    ],
  },
  {
    id: 'aguja',
    title: 'Una señal sale del surco',
    durationInFrames: 300,
    narration: 'Al girar el vinilo, las curvas hacen vibrar la aguja. La aguja mueve un imán y las bobinas generan una señal eléctrica.',
    voiceLead: 9,
    voiceTail: 9,
    screenText: [
      {atFrame: 66, text: 'La aguja sigue las curvas'},
      {atFrame: 148, text: 'La aguja mueve el imán'},
      {atFrame: 222, text: 'La vibración se vuelve señal'},
    ],
    visual: 'Tocadiscos eléctrico con brazo y cápsula de imán móvil. Una luz simboliza la señal en el cable.',
    camera: 'Viaje a ras de surco. Acercamiento a un corte de la cápsula y seguimiento del cable.',
    animation: [
      {atFrame: 0, text: 'Bajar la aguja hasta el surco.'},
      {atFrame: 78, text: 'Seguir las ondulaciones desde la altura de la aguja.'},
      {atFrame: 148, text: 'Mostrar el imán moviéndose junto a las bobinas fijas.'},
      {atFrame: 222, text: 'Seguir la señal por el cable.'},
    ],
    transition: 'El pulso por el cable nos lleva a la entrada de fono.',
    sound: [
      {atFrame: 16, text: 'Clic de contacto de la aguja.'},
      {atFrame: 294, text: 'Cortar la música justo antes de revelar la ecualización.'},
    ],
  },
  {
    id: 'ecualizacion',
    title: 'La corrección antes de sonar',
    durationInFrames: 360,
    narration: 'La señal viaja por el cable. El preamplificador corrige los graves y los agudos. Luego el amplificador hace vibrar el cono del parlante.',
    voiceLead: 12,
    voiceTail: 12,
    screenText: [
      {atFrame: 18, text: 'La señal viaja por cable'},
      {atFrame: 122, text: 'Se corrigen graves y agudos'},
      {atFrame: 265, text: 'El cono mueve el aire'},
    ],
    visual: 'Preamplificador de fono, dos bandas de frecuencias y parlante.',
    camera: 'Tres cuartos del preamplificador. Desplazamiento lateral hasta el cono del parlante.',
    animation: [
      {atFrame: 0, text: 'Mostrar el ajuste de grabación, menos graves y más agudos.'},
      {atFrame: 146, text: 'Invertir los ajustes al pasar por la entrada de fono.'},
      {atFrame: 266, text: 'Mover el cono y volver a transmitir la vibración al aire.'},
    ],
    transition: 'La onda de salida enlaza con el relieve del disco.',
    sound: [
      {atFrame: 0, text: 'Dejar espacio a la voz después de cortar la música.'},
      {atFrame: 266, text: 'Volver al motivo musical que se oyó en la apertura.'},
    ],
  },
  {
    id: 'bucle',
    title: 'La misma línea',
    durationInFrames: 180,
    narration: 'Ese aire en movimiento es lo que oyes. ¿Qué canción pondrías?',
    voiceLead: 6,
    voiceTail: 30,
    screenText: [
      {atFrame: 10, text: 'De curvas a sonido'},
      {atFrame: 68, text: '¿Qué canción pondrías?'},
      {atFrame: 125, text: ''},
    ],
    visual: 'El oyente inclina la cabeza. Los conos de los dos parlantes vibran. Regresamos al surco de la apertura.',
    camera: 'Entrar al macro cenital y recuperar posición y sentido de avance iniciales.',
    animation: [
      {atFrame: 0, text: 'Volver al disco desde el parlante.'},
      {atFrame: 126, text: 'Empalmar el relieve y el movimiento con el fotograma inicial.'},
    ],
    transition: 'Empalme de encuadre, dirección y crepitar con la apertura.',
    sound: [{atFrame: 132, text: 'Dejar solo el crepitar al cerrar el bucle.'}],
  },
] as const satisfies readonly SceneDefinition[];

export type VinylSceneId = typeof vinylScenes[number]['id'];
export type VoiceDurations = Partial<Record<VinylSceneId, number>>;
export type VoiceFiles = Partial<Record<VinylSceneId, string>>;

export function buildVinylTimeline(voiceDurations: VoiceDurations = {}) {
  let nextFrame = 0;
  const scenes = vinylScenes.map((scene) => {
    const measuredSeconds = voiceDurations[scene.id];
    if (measuredSeconds !== undefined && (!Number.isFinite(measuredSeconds) || measuredSeconds <= 0)) {
      throw new Error(`La duración de la voz debe ser positiva en ${scene.id}.`);
    }
    const voiceDurationInFrames = measuredSeconds === undefined
      ? scene.durationInFrames - scene.voiceLead - scene.voiceTail
      : Math.ceil(measuredSeconds * VINYL_FPS);
    const durationInFrames = scene.voiceLead + voiceDurationInFrames + scene.voiceTail;
    const from = nextFrame;
    nextFrame += durationInFrames;

    // Retain positions within the leading silence, voice and tail as each take changes length.
    const originalVoice = scene.durationInFrames - scene.voiceLead - scene.voiceTail;
    const originalTailAt = scene.voiceLead + originalVoice;
    const tailAt = scene.voiceLead + voiceDurationInFrames;
    const retime = (cues: readonly Cue[]) => cues.map(({atFrame, text}) => {
      const frame = atFrame < scene.voiceLead
        ? atFrame
        : atFrame >= originalTailAt
          ? tailAt + atFrame - originalTailAt
          : scene.voiceLead + Math.round((atFrame - scene.voiceLead) * voiceDurationInFrames / originalVoice);
      return {atFrame: Math.min(durationInFrames - 1, frame), text};
    });

    return {
      ...scene,
      from,
      end: nextFrame,
      durationInFrames,
      voiceDurationInFrames,
      screenText: retime(scene.screenText),
      animation: retime(scene.animation),
      sound: retime(scene.sound),
    };
  });

  return {scenes, durationInFrames: nextFrame};
}

export const vinylTimeline = buildVinylTimeline();
