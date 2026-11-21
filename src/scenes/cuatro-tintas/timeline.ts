export type Cue = readonly [seconds: number, text: string];

const script = [
  {
    id: 'apertura', seconds: 12,
    narration: 'Esta foto salió gota a gota. ¿Cómo lo hizo la impresora?',
    captions: [[0.35, 'Esta foto salió'], [2.6, 'gota a gota.'], [7.6, '¿Cómo lo hizo'], [9.5, 'la impresora?']],
  },
  {
    id: 'rodillos', seconds: 10.5,
    narration: 'Un rodillo de goma agarra la hoja y la lleva al lugar donde cae la tinta.',
    captions: [[0.45, 'Un rodillo de goma'], [2.7, 'agarra la hoja'], [4.6, 'y la lleva al lugar'], [7.5, 'donde cae la tinta.']],
  },
  {
    id: 'cabezal', seconds: 11.5,
    narration: 'La tinta pasa de su depósito a una pieza con agujeritos diminutos. Esa pieza se llama cabezal.',
    captions: [[0.4, 'La tinta pasa'], [2.2, 'de su depósito'], [4.1, 'a una pieza con'], [6.6, 'agujeritos diminutos.'], [8.4, 'Esa pieza se llama cabezal.']],
  },
  {
    id: 'gota', seconds: 13,
    narration: 'Un calentador forma una burbuja dentro de la tinta. Al crecer… la burbuja empuja una gota hacia el papel.',
    captions: [[0.35, 'Un calentador forma'], [2.35, 'una burbuja'], [4.2, 'dentro de la tinta.'], [6.3, 'Al crecer… la burbuja'], [8.9, 'empuja una gota'], [11.05, 'hacia el papel.']],
  },
  {
    id: 'pasada', seconds: 11,
    narration: 'El cabezal cruza la hoja soltando gotas en lugares precisos. En cada pasada imprime una franja.',
    captions: [[0.4, 'El cabezal cruza la hoja'], [3.2, 'soltando gotas en lugares precisos.'], [6.7, 'En cada pasada'], [8.6, 'imprime una franja.']],
  },
  {
    id: 'franjas', seconds: 10,
    narration: 'Los rodillos mueven la hoja un poquito. Así aparece una franja tras otra.',
    captions: [[0.4, 'Los rodillos mueven la hoja'], [3.4, 'un poquito.'], [5.65, 'Así aparece una franja'], [8.25, 'tras otra.']],
  },
  {
    id: 'verde', seconds: 11,
    narration: '¿Y ese verde? En esa parte del papel caen gotas de azul verdoso y amarillo.',
    captions: [[0.35, '¿Y ese verde?'], [2.45, 'En esa parte del papel'], [5.45, 'caen gotas de'], [7.35, 'azul verdoso y amarillo.']],
  },
  {
    id: 'salida', seconds: 9,
    narration: 'Ya salió la foto. Mira esa hoja… ahí empezamos.',
    captions: [[0.3, 'Ya salió la foto.'], [3.05, 'Mira esa hoja…'], [5.3, 'ahí empezamos.'], [7.3, '']],
  },
] as const satisfies readonly {id: string; seconds: number; narration: string; captions: readonly Cue[]}[];

export const printFps = 30;
export type PrintSceneId = typeof script[number]['id'];
export type PrintVoiceFiles = Partial<Record<PrintSceneId, string>>;

let next = 0;
export const printScenes = script.map((scene) => {
  const from = next;
  const duration = scene.seconds * printFps;
  next += duration;
  return {...scene, from, duration, end: next};
});
export const printOpeningFrames = printScenes[0].duration;
export const printLoopFrames = printOpeningFrames + 144;
export const printFullFrames = next;
