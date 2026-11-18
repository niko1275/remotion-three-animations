// A fictional mark. The pencil and the ink use the same ordered trace.
const points = [
  [.374,.690], [.390,.674], [.401,.648], [.412,.655], [.400,.689],
  [.418,.681], [.433,.668], [.443,.690], [.456,.682], [.471,.663],
  [.479,.676], [.496,.671], [.517,.661],
] as const;

const subdivisions = 4;

// Sample the rounded path once. The paper shader and the animated tip trace
// the same segments, including the final partial segment.
export const signature = [
  ...points.slice(0,-1).flatMap((p,i) => {
    const a = points[Math.max(0,i-1)], b = points[i+1], c = points[Math.min(points.length-1,i+2)];
    return Array.from({length: subdivisions}, (_, j) => {
      const t = j/subdivisions;
      return p.map((v,k) => v + .5*t*((b[k]-a[k])+t*(2*a[k]-5*v+4*b[k]-c[k]
        + t*(-a[k]+3*v-3*b[k]+c[k]))));
    });
  }),
  points[points.length-1],
];

export function signaturePoint(progress: number) {
  const index = Math.min(signature.length-2, Math.floor(progress));
  const t = progress-index;
  const a = signature[index], b = signature[index+1];
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t] as const;
}
