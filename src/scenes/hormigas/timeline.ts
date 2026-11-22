import {VINYL_FPS} from '../../timeline';

const takes = [
  {
    id: 'gancho', seconds: 3,
    narration: '¿Matas una hormiga y, de pronto, aparecen más? No es que estén buscando venganza.',
    labels: [[0, '¿Por qué llegan más?']],
  },
  {
    id: 'senales', seconds: 9,
    narration: 'Las hormigas se comunican con sustancias químicas que nosotros no podemos percibir.',
    labels: [[0.13, 'Un mensaje invisible']],
  },
  {
    id: 'alarma', seconds: 13,
    narration: 'En algunas especies, una hormiga en peligro puede liberar señales de alarma. Otras las detectan y se acercan para investigar o defender la colonia.',
    labels: [[0.12, 'En algunas especies'], [0.34, 'Señal de alarma'], [0.70, 'Otras se acercan']],
  },
  {
    id: 'rastro', seconds: 13,
    narration: 'Pero también puede que la primera hormiga estuviera siguiendo un rastro. Otras hormigas ya podían venir por ese mismo camino, quizá atraídas por comida.',
    labels: [[0.08, 'El rastro ya estaba'], [0.54, 'Camino hacia la comida']],
  },
  {
    id: 'remate', seconds: 10,
    narration: 'Así que no siempre llegan porque mataste a una: a veces responden a una alarma y otras simplemente ya venían en camino. No es venganza. Es comunicación química.',
    labels: [[0.12, 'Alarma o rastro'], [0.63, 'Comunicación química']],
  },
] as const;

export type AntTakeId = (typeof takes)[number]['id'];
export type AntVoiceFiles = Partial<Record<AntTakeId, string>>;
export type AntVoiceDurations = Partial<Record<AntTakeId, number>>;

export const antVoiceLead = 4;

export function buildAntTimeline(durations: AntVoiceDurations = {}) {
  let next = 0;
  const scenes = takes.map((take) => {
    const from = next;
    const audioSeconds = durations[take.id];
    const voiceFrames = audioSeconds === undefined ? 0 : Math.ceil(audioSeconds * VINYL_FPS);
    const duration = Math.max(take.seconds * VINYL_FPS, voiceFrames + antVoiceLead + 8);
    next += duration;
    return {...take, from, duration, end: next, voiceFrames};
  });
  return {scenes, durationInFrames: next};
}

export const antTimeline = buildAntTimeline();
