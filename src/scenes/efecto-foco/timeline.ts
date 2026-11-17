const start = [-2.2, 0, -1.5];
const end = [-1.6, 0, -1.35];

function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function mix(a: number[], b: number[], t: number) {
  return a.map((value, i) => value + (b[i] - value) * t);
}

export function timeline(t: number) {
  const state = {
    T: t,
    PP: mix(start, end, smoothstep(0.1, 1, t)),
    WK: smoothstep(0.1, 0.2, t) * (1 - smoothstep(0.9, 1, t)),
    SP: smoothstep(1.25, 1.33, t),
    LT: t - 0.55,
    F: 0,
  };

  if (t < 2.7) {
    return {
      ...state,
      CAM: mix([1.9, 2.5, 3.9], [1.7, 2.4, 3.6], smoothstep(0, 2.7, t)),
      TA: [-0.75, 1.15, -0.9],
      F: Math.max(0, 1 - t / 0.2),
      caption: t < 0.25 ? '' : t < 1.25 ? 'Entras tarde.' : 'Y todos te miran.',
    };
  }

  if (t < 4.7) {
    return {
      ...state,
      CAM: mix([-1.45, 1.76, -1.18], [-1.32, 1.7, -1.04], smoothstep(2.7, 4.7, t)),
      TA: [1, 1, 1],
      caption: 'Sientes cada mirada.',
    };
  }

  const ease = smoothstep(4.7, 6.9, t);
  const distance = 1.75 - 0.55 * ease;
  return {
    ...state,
    CAM: [end[0] + 0.674 * distance, 1.25 - 0.1 * ease, end[2] + 0.739 * distance],
    TA: [end[0], 1.22 - 0.14 * ease, end[2]],
    F: Math.max(0, Math.min(1, (t - 6.75) / 0.25)),
    caption: t < 5.9 ? 'Y justo hoy, la mancha.' : '¿De verdad la vieron?',
  };
}
