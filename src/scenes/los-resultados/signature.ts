// A fictional mark. The pencil and the ink use the same ordered trace.
export const signature = [
  [.374,.690], [.390,.674], [.401,.648], [.412,.655], [.400,.689],
  [.418,.681], [.433,.668], [.443,.690], [.456,.682], [.471,.663],
  [.479,.676], [.496,.671], [.517,.661],
] as const;

export function signaturePoint(progress: number) {
  const index = Math.min(signature.length-2, Math.floor(progress));
  const t = progress-index;
  const a = signature[index], b = signature[index+1];
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t] as const;
}
