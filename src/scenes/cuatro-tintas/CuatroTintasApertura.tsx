import {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {TextureLoader} from 'three';
import '@fontsource/space-grotesk/latin-700.css';
import {createPrintOpening} from './print';

export const printOpeningFrames = 345;
const clamped = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export function CuatroTintasApertura() {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Cargando la foto para el corto de cuatro tintas'));
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createPrintOpening> | null>(null);
  const latestFrame = useRef(frame);

  useLayoutEffect(() => {
    latestFrame.current = frame;
    scene.current?.draw(frame, durationInFrames, fps);
  }, [durationInFrames, fps, frame]);

  useLayoutEffect(() => {
    const surface = canvas.current!;
    let disposed = false;
    const portrait = new TextureLoader().load(staticFile('cuatro-tintas/retrato.png'), (loaded) => {
      if (disposed) return;
      try {
        scene.current = createPrintOpening(surface, width, height, loaded);
        scene.current.draw(latestFrame.current, durationInFrames, fps);
        continueRender(handle);
      } catch (error) {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      }
    }, undefined, () => {
      if (!disposed) cancelRender(new Error('No se pudo cargar cuatro-tintas/retrato.png.'));
    });

    return () => {
      disposed = true;
      scene.current?.dispose();
      scene.current = null;
      portrait.dispose();
      continueRender(handle);
    };
  }, [cancelRender, continueRender, durationInFrames, fps, handle, height, width]);

  const p = frame / (durationInFrames - 1);
  const title = p < 0.31 ? 'Esta foto tiene cuatro tintas' : 'Los puntos forman la foto';
  const opacity = p < 0.31 ? interpolate(p, [0.25, 0.31], [1, 0], clamped)
    : interpolate(p, [0.71, 0.76], [0, 1], clamped);
  return (
    <AbsoluteFill style={{backgroundColor: '#929D8B'}}>
      <canvas ref={canvas} style={{display: 'block', width: '100%', height: '100%'}} />
      {opacity > 0 && (
        <div style={{
          position: 'absolute', top: '69%', left: '8%', right: '8%', textAlign: 'center',
          fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: width * 58 / 1080,
          color: '#fff', WebkitTextStroke: `${width * 4 / 1080}px #1B1714`, paintOrder: 'stroke fill',
          lineHeight: 1.05, opacity,
        }}>
          {title}
        </div>
      )}
    </AbsoluteFill>
  );
}
