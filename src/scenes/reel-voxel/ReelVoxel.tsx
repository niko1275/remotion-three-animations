import { useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import { clamp, createScene, spring, TOTAL } from "./scene";
import "./reel.css";

const captions = [
  [
    0,
    100,
    <>
      Las mejores fotos salieron de <em>practicar</em>, no de teorizar
    </>,
  ],
  [
    100,
    205,
    <>
      ¿Hay <em>ciencia</em> detrás de esto?
    </>,
  ],
  [
    205,
    TOTAL,
    <>
      Los <em>taxistas de Londres</em> tienen la respuesta
      <span>memorizan miles de calles</span>
    </>,
  ],
] as const;

export function ReelVoxel() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createScene> | null>(null);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    const instance = createScene(canvas.current, width, height);
    scene.current = instance;
    return () => {
      instance.dispose();
      scene.current = null;
    };
  }, [width, height]);

  useLayoutEffect(() => {
    scene.current?.renderFrame(frame);
  }, [frame, width, height]);

  return (
    <AbsoluteFill className="reel-voxel-stage">
      <canvas ref={canvas} />
      <div className="reel-voxel-tag">Transición · fotos → taxi</div>
      {captions.map(([start, end, content]) => {
        const opacity = Math.min(
          clamp((frame - start) / 8, 0, 1),
          clamp((end - frame) / 8, 0, 1),
        );
        const entry = spring(frame - start, { damping: 14, stiffness: 160 });
        return (
          <div
            key={start}
            className="reel-voxel-caption"
            style={{
              opacity,
              transform: `translateY(${(1 - entry) * 4.8}cqw) scale(${0.92 + 0.08 * Math.min(1, entry)})`,
            }}
          >
            {content}
          </div>
        );
      })}
      <div
        className="reel-voxel-progress"
        style={{ width: `${(100 * frame) / TOTAL}%` }}
      />
    </AbsoluteFill>
  );
}
