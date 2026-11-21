import {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {TextureLoader} from 'three';
import '@fontsource/space-grotesk/latin-700.css';
import {createPrintOpening} from './print';

const clamped = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const portraitFile = 'cuatro-tintas/calamardo.jpg';
const captions = [
  {text: '¿Cómo llegó la tinta?', frames: [0, 9, 97, 122]},
  {text: 'Hasta la facha se imprime', frames: [149, 160, 218, 231]},
  {text: 'Dentro de la impresora', frames: [231, 255, 334, 356]},
];

export function CuatroTintasApertura() {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Cargando la foto para el corto de cuatro tintas'));
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createPrintOpening> | null>(null);
  const latestFrame = useRef(frame);

  useLayoutEffect(() => {
    latestFrame.current = frame;
    scene.current?.draw(frame, fps);
  }, [fps, frame]);

  useLayoutEffect(() => {
    const surface = canvas.current!;
    let disposed = false;
    const portrait = new TextureLoader().load(staticFile(portraitFile), (loaded) => {
      if (disposed) return;
      try {
        scene.current = createPrintOpening(surface, width, height, loaded);
        scene.current.draw(latestFrame.current, fps);
        continueRender(handle);
      } catch (error) {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      }
    }, undefined, () => {
      if (!disposed) cancelRender(new Error(`No se pudo cargar ${portraitFile}.`));
    });

    return () => {
      disposed = true;
      scene.current?.dispose();
      scene.current = null;
      portrait.dispose();
      continueRender(handle);
    };
  }, [cancelRender, continueRender, fps, handle, height, width]);

  const caption = captions.find(({frames}) => frame >= frames[0] && frame < frames[3]);
  const opacity = caption ? interpolate(frame, caption.frames, [0, 1, 1, 0], clamped) : 0;
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
          {caption?.text}
        </div>
      )}
    </AbsoluteFill>
  );
}
