import {interpolate} from 'remotion';

export const fps = 30;
export const duration = 59 * fps;

export const narration = [
  {at: 0, text: 'Te abrochas el cinturón para estar más seguro. ¿Y si justo eso te da confianza para acelerar?'},
  {at: 5, text: 'Imagina que vas manejando. Aparece una curva y un muro te tapa la salida. Por si acaso, levantas el pie.'},
  {at: 14, text: 'Ahora rebobinemos. Mismo auto, misma curva. Esta vez piensas: “Voy bien protegido. Puedo pasar un poquito más rápido”. Y mantienes el pie en el acelerador.'},
  {at: 25, text: 'En 1975, el economista Sam Peltzman estudió las reglas de seguridad de los autos. Planteó que, al sentirnos más protegidos, a veces aceptamos riesgos que antes habríamos evitado.'},
  {at: 38, text: 'El cinturón te protege si chocas. Lo que podría cambiar es lo que tú decides hacer antes de llegar a la curva.'},
  {at: 47, text: 'Ahora vas de copiloto. Ves que se acerca la curva y el conductor te dice: “Tranqui, vamos con cinturón”. ¿Te relajas… o le dices que frene?'},
];

export const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: x => x * x * (3 - 2 * x),
  });

type View = 'road' | 'buckle' | 'belt' | 'pedal' | 'profile' | 'wheel' | 'passenger';
export type Shot = {view: View; distance: number; pedal: number; buckle: number; steering: number; glance: number; cameraSlide?: number};

function shot(view: View, distance: number, pedal = .65, buckle = 1, steering = 0, glance = 0): Shot {
  return {view, distance, pedal, buckle, steering, glance};
}

export function peltzmanFrame(t: number) {
  if (t < 2.15) return [shot('buckle', 1, .62, ease(t, .28, 1.05))];
  if (t < 3.45) return [shot('pedal', 3, .44 + .24 * ease(t, 2.2, 3.4))];
  if (t < 5) return [shot('road', 23 + 8 * (t - 3.45))];
  if (t < 14) {
    const p = t - 5;
    const lift = ease(p, 4.7, 5.55);
    return [shot(p >= 4.45 && p < 7.05 ? 'pedal' : 'road',
      4 + 6 * p - 8 * ease(p, 4.7, 9), .72 * (1 - lift), 1, .3 * ease(p, 6, 9))];
  }
  if (t < 15.3) return [shot('road', 50 - 46 * ease(t, 14, 15.3))];
  if (t < 25) {
    const p = t - 15.3;
    const view = p >= 3.25 && p < 4.2 ? 'belt' : p >= 4.45 && p < 7.05 ? 'pedal' : 'road';
    return [shot(view, 4 + 6 * p, .72, 1, .4 * ease(p, 6, 9))];
  }
  if (t < 38) {
    const p = Math.min(6.05, t - 25);
    const view = p < 4.45 ? 'road' : 'pedal';
    const distance = 4 + 6 * p;
    return [shot(view, distance, .72 * (1 - ease(p, 4.7, 5.55))), shot(view, distance, .72)];
  }
  if (t < 47) {
    const p = t - 38;
    const state = shot(p < 3.4 ? 'profile' : 'wheel',
      18 + 3.6 * p, .62, 1, .48 * ease(p, 3.5, 7), .35 * ease(p, 6.35, 9));
    return [{...state, cameraSlide: ease(p, 6.35, 9)}];
  }
  const p = t - 47;
  return [shot('passenger', 50.38 + 2.3 * p, .61, 1, .48 * ease(p, 5, 10),
    .76 * (ease(p, 2.1, 4.1) - ease(p, 6.1, 8.1)))];
}
