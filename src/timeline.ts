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
    durationInFrames: 330,
    narration: 'Estás dentro de una canción… Esta línea hundida guarda la música en sus curvas.',
    voiceLead: 0,
    voiceTail: 30,
    screenText: [
      {atFrame: 0, text: 'Estás dentro de una canción'},
      {atFrame: 104, text: ''},
      {atFrame: 184, text: 'Curvas que guardan sonido'},
    ],
    visual: 'Macro rasante del surco continuo en V. Al alejarse la cámara, aparece el LP girando en el tocadiscos eléctrico del living.',
    camera: 'Macro rasante. Alejamiento continuo en perspectiva hasta el plano general del living.',
    animation: [
      {atFrame: 0, text: 'Recorrer un tramo del surco entre las dos paredes.'},
      {atFrame: 91, text: 'Alejarse sin perder la curva que seguía la cámara.'},
      {atFrame: 184, text: 'Revelar el disco completo y su única espiral.'},
    ],
    transition: 'Corte por coincidencia entre el LP y el disco de laca sobre el torno.',
    sound: [
      {atFrame: 0, text: 'Entra el crepitar.'},
      {atFrame: 184, text: 'Primera capa del motivo musical.'},
    ],
  },
  {
    id: 'torno',
    title: 'El corte del maestro',
    durationInFrames: 345,
    narration: 'La música hace vibrar una punta. Su movimiento queda grabado en la capa blanda del disco.',
    voiceLead: 9,
    voiceTail: 21,
    screenText: [
      {atFrame: 22, text: 'La punta vibra'},
      {atFrame: 132, text: 'El surco copia la vibración'},
    ],
    visual: 'La punta de zafiro vibra sobre la laca mientras talla una línea ondulada. La viruta sale del punto de corte.',
    camera: 'Plano oblicuo de mesa. Acercamiento lateral al punto de corte.',
    animation: [
      {atFrame: 0, text: 'Mostrar el cabezal y el disco de laca girando.'},
      {atFrame: 95, text: 'La punta vibra y avanza despacio hacia el centro.'},
      {atFrame: 132, text: 'La señal modula el surco continuo que talla la punta.'},
      {atFrame: 270, text: 'La viruta continua entra por el tubo de aspiración.'},
    ],
    transition: 'Corte desde la línea del torno a dos tramos ampliados del surco.',
    sound: [
      {atFrame: 16, text: 'Entrada seca del torno.'},
      {atFrame: 132, text: 'Roce fino de corte debajo de la locución.'},
    ],
  },
  {
    id: 'estereo',
    title: 'El espacio entre las curvas',
    durationInFrames: 360,
    narration: 'Un trueno grave deja curvas más separadas… Un silbido agudo las deja más juntas.',
    voiceLead: 9,
    voiceTail: 72,
    screenText: [
      {atFrame: 10, text: 'Graves: curvas más separadas'},
      {atFrame: 141, text: 'Agudos: curvas más juntas'},
      {atFrame: 288, text: ''},
      {atFrame: 311, text: 'IZQ · DER'},
    ],
    visual: 'Grave y agudo a la misma escala y velocidad. Corte en V con la pared interior y la exterior identificadas.',
    camera: 'Frontal al tramo comparado. Giro hacia el corte transversal.',
    animation: [
      {atFrame: 0, text: 'Comparar el espaciado de las ondulaciones con la misma velocidad.'},
      {atFrame: 288, text: 'Girar para revelar las dos paredes inclinadas del surco.'},
      {atFrame: 309, text: 'Iluminar la pared interior, canal izquierdo.'},
      {atFrame: 327, text: 'Iluminar la pared exterior, canal derecho.'},
    ],
    transition: 'Corte del perfil en V al mismo perfil sobre la laca que entra al baño.',
    sound: [
      {atFrame: 15, text: 'Demostración suave de un tono grave.'},
      {atFrame: 141, text: 'Demostración suave de un tono agudo.'},
    ],
  },
  {
    id: 'galvanoplastia',
    title: 'El relieve se invierte',
    durationInFrames: 330,
    narration: 'Cubrimos el disco con metal. Al separar esa capa… cada hueco deja una línea que sobresale.',
    voiceLead: 9,
    voiceTail: 21,
    screenText: [
      {atFrame: 22, text: 'Una capa de metal'},
      {atFrame: 160, text: 'La copia sobresale'},
      {atFrame: 287, text: ''},
    ],
    visual: 'Laca plateada en baño de níquel. Tres piezas muestran la secuencia negativo, positivo y negativo.',
    camera: 'Vista de la cuba. Repetir el encuadre del surco al separar la primera pieza.',
    animation: [
      {atFrame: 0, text: 'Sumergir la laca conductora y mostrar cómo se forma la capa de níquel.'},
      {atFrame: 126, text: 'Separar la cresta de metal del hueco de laca en el mismo encuadre.'},
      {atFrame: 287, text: 'Mostrar las copias de metal sobre el tanque.'},
    ],
    transition: 'Corte del molde definitivo al mismo molde montado en la prensa.',
    sound: [
      {atFrame: 20, text: 'Agua breve al entrar al baño.'},
      {atFrame: 126, text: 'Pausa musical durante la primera separación.'},
    ],
  },
  {
    id: 'prensa',
    title: 'Del plástico al disco',
    durationInFrames: 285,
    narration: 'Dos piezas de metal aprietan el plástico caliente. Así pasan las curvas al vinilo.',
    voiceLead: 9,
    voiceTail: 15,
    screenText: [
      {atFrame: 22, text: 'Metal y plástico caliente'},
      {atFrame: 167, text: 'El surco pasa al vinilo'},
    ],
    visual: 'Prensa de perfil. Dos moldes, uno por cara, rodean la galleta de PVC caliente.',
    camera: 'Perfil a media altura, con ambos moldes dentro del encuadre.',
    animation: [
      {atFrame: 0, text: 'Colocar la galleta de plástico entre los dos moldes.'},
      {atFrame: 111, text: 'Cerrar la prensa y extender el plástico caliente hasta formar el disco.'},
      {atFrame: 167, text: 'Abrir la prensa. El disco enfriado conserva el surco.'},
    ],
    transition: 'Corte por coincidencia del disco nuevo al plato del tocadiscos.',
    sound: [
      {atFrame: 111, text: 'Golpe seco de prensa.'},
      {atFrame: 167, text: 'Siseo breve y pausa al abrir.'},
    ],
  },
  {
    id: 'aguja',
    title: 'Una señal sale del surco',
    durationInFrames: 480,
    narration: 'Las curvas hacen vibrar la aguja y su imán. Unos rollos de alambre de cobre convierten ese movimiento en una señal eléctrica.',
    voiceLead: 9,
    voiceTail: 24,
    screenText: [
      {atFrame: 85, text: 'La aguja sigue las curvas'},
      {atFrame: 199, text: 'La aguja mueve el imán'},
      {atFrame: 383, text: 'La vibración se vuelve señal'},
    ],
    visual: 'Tocadiscos eléctrico con brazo y cápsula de imán móvil. Una luz simboliza la señal en el cable.',
    camera: 'Viaje a ras de surco. Acercamiento a un corte de la cápsula y seguimiento del cable.',
    animation: [
      {atFrame: 0, text: 'Bajar la aguja hasta el surco.'},
      {atFrame: 85, text: 'Seguir las ondulaciones desde la altura de la aguja.'},
      {atFrame: 199, text: 'Mostrar el imán moviéndose junto a las bobinas fijas.'},
      {atFrame: 383, text: 'Seguir la señal por el cable.'},
    ],
    transition: 'El pulso por el cable nos lleva a la entrada de fono.',
    sound: [
      {atFrame: 16, text: 'Clic de contacto de la aguja.'},
      {atFrame: 474, text: 'Cortar la música justo antes de revelar la ecualización.'},
    ],
  },
  {
    id: 'ecualizacion',
    title: 'La corrección antes de sonar',
    durationInFrames: 300,
    narration: 'Un aparato equilibra los sonidos graves y agudos… antes de que lleguen al parlante.',
    voiceLead: 9,
    voiceTail: 18,
    screenText: [
      {atFrame: 29, text: 'Se equilibran graves y agudos'},
      {atFrame: 209, text: 'La señal llega al parlante'},
    ],
    visual: 'Preamplificador de fono, dos bandas de frecuencias y parlante.',
    camera: 'Tres cuartos del preamplificador. Desplazamiento lateral hasta el cono del parlante.',
    animation: [
      {atFrame: 0, text: 'Mostrar el ajuste de grabación, menos graves y más agudos.'},
      {atFrame: 102, text: 'Invertir los ajustes al pasar por la entrada de fono.'},
      {atFrame: 209, text: 'Seguir la señal del amplificador hacia el parlante.'},
    ],
    transition: 'La onda de salida enlaza con el relieve del disco.',
    sound: [
      {atFrame: 0, text: 'Dejar espacio a la voz después de cortar la música.'},
    ],
  },
  {
    id: 'bucle',
    title: 'La misma línea',
    durationInFrames: 270,
    narration: 'El parlante vibra y mueve el aire… Así oyes la música.',
    voiceLead: 6,
    voiceTail: 30,
    screenText: [
      {atFrame: 14, text: 'El parlante mueve el aire'},
      {atFrame: 157, text: ''},
    ],
    visual: 'El oyente inclina la cabeza. Los conos de los dos parlantes vibran. Regresamos al surco de la apertura.',
    camera: 'Entrar al macro cenital y recuperar posición y sentido de avance iniciales.',
    animation: [
      {atFrame: 0, text: 'Mostrar cómo los parlantes empujan el aire.'},
      {atFrame: 157, text: 'Volver al disco y empalmar con el fotograma inicial.'},
    ],
    transition: 'Empalme de encuadre, dirección y crepitar con la apertura.',
    sound: [
      {atFrame: 0, text: 'Volver al motivo musical de la apertura.'},
      {atFrame: 244, text: 'Dejar solo el crepitar al cerrar el bucle.'},
    ],
  },
] as const satisfies readonly SceneDefinition[];

export type VinylSceneId = typeof vinylScenes[number]['id'];
export type VoiceDurations = Partial<Record<VinylSceneId, number>>;
export type VoiceFiles = Partial<Record<VinylSceneId, string>>;

function retimeVoiceFrame(frame: number, lead: number, fromVoice: number, toVoice: number) {
  if (frame < lead) return frame;
  if (frame >= lead + fromVoice) return frame + toVoice - fromVoice;
  return lead + (frame - lead) * toVoice / fromVoice;
}

export function vinylVisualProgress(sceneId: VinylSceneId, frame: number, duration: number) {
  const plan = vinylScenes.find(({id}) => id === sceneId)!;
  const lead = plan.voiceLead;
  const pauseFrames = lead + plan.voiceTail;
  const visualFrame = retimeVoiceFrame(frame, lead, duration - pauseFrames, plan.durationInFrames - pauseFrames);
  return visualFrame / (plan.durationInFrames - 1);
}

export function buildVinylTimeline(voiceDurations: VoiceDurations = {}) {
  let nextFrame = 0;
  const scenes = vinylScenes.map((scene) => {
    const measuredSeconds = voiceDurations[scene.id];
    if (measuredSeconds !== undefined && (!Number.isFinite(measuredSeconds) || measuredSeconds <= 0)) {
      throw new Error(`La duración de la voz debe ser positiva en ${scene.id}.`);
    }
    const originalVoice = scene.durationInFrames - scene.voiceLead - scene.voiceTail;
    const measuredVoice = measuredSeconds === undefined ? originalVoice : measuredSeconds * VINYL_FPS;
    const voiceDurationInFrames = Math.max(originalVoice, Math.ceil(measuredVoice));
    const voicePlaybackRate = Math.min(1, measuredVoice / originalVoice);
    const durationInFrames = scene.voiceLead + voiceDurationInFrames + scene.voiceTail;
    const from = nextFrame;
    nextFrame += durationInFrames;

    // Retain positions within the leading silence, voice and tail as each take changes length.
    const retime = (cues: readonly Cue[]) => cues.map(({atFrame, text}) => {
      const frame = retimeVoiceFrame(atFrame, scene.voiceLead, originalVoice, voiceDurationInFrames);
      return {atFrame: Math.min(durationInFrames - 1, Math.round(frame)), text};
    });

    return {
      ...scene,
      from,
      end: nextFrame,
      durationInFrames,
      voiceDurationInFrames,
      voicePlaybackRate,
      screenText: retime(scene.screenText),
      animation: retime(scene.animation),
      sound: retime(scene.sound),
    };
  });

  return {scenes, durationInFrames: nextFrame};
}

export const vinylTimeline = buildVinylTimeline();
