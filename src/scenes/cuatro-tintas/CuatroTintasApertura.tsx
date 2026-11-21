import {useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {TextureLoader} from 'three';
import '@fontsource/space-grotesk/latin-700.css';
import {createPrintOpening, greenDetail, landscapeFile} from './print';
import {printOpeningFrames, printScenes, type Cue, type PrintVoiceFiles} from './timeline';

const clamped = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

function PrintVideo({full, voiceFiles = {}}: {full: boolean; voiceFiles?: PrintVoiceFiles}) {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Cargando la foto para el corto de cuatro tintas'));
  const canvas = useRef<HTMLCanvasElement>(null);
  const proof = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createPrintOpening> | null>(null);
  const latestFrame = useRef(frame);

  useLayoutEffect(() => {
    latestFrame.current = frame;
    scene.current?.draw(frame, fps, full);
  }, [fps, frame, full]);

  useLayoutEffect(() => {
    const surface = canvas.current!;
    const proofSurface = proof.current!;
    let disposed = false;
    const texture = new TextureLoader().load(staticFile(landscapeFile), (loaded) => {
      if (disposed) return;
      try {
        scene.current = createPrintOpening(surface, width, height, loaded, proofSurface);
        scene.current.draw(latestFrame.current, fps, full);
        continueRender(handle);
      } catch (error) {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      }
    }, undefined, () => {
      if (!disposed) cancelRender(new Error(`No se pudo cargar ${landscapeFile}.`));
    });

    return () => {
      disposed = true;
      scene.current?.dispose();
      scene.current = null;
      texture.dispose();
      continueRender(handle);
    };
  }, [cancelRender, continueRender, fps, full, handle, height, width]);

  const active = frame < printOpeningFrames || full ? printScenes.find(({end}) => frame < end) : undefined;
  const localFrame = active ? frame - active.from : 0;
  const seconds = localFrame / fps;
  const cues: readonly Cue[] = active?.captions ?? [];
  const cue = cues.reduce<Cue | undefined>((visible, candidate) => seconds >= candidate[0] ? candidate : visible, undefined);
  const subtitleBelow = active?.id === 'rodillos' || active?.id === 'cabezal' || active?.id === 'gota';
  const subtitleOpacity = cue ? interpolate(seconds - cue[0], [0, 0.16], [0, 1], clamped) : 0;
  const titleOpacity = interpolate(frame, [143, 158, 212, 228], [0, 1, 1, 0], clamped);
  const proofProgress = active?.id === 'verde' ? localFrame / (active.duration - 1) : 0;
  const detail = greenDetail(proofProgress);
  const zoom = interpolate(proofProgress, [0.08, 0.31], [0, 1], clamped);
  const typography: CSSProperties = {
    fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, textAlign: 'center',
    color: '#fff', WebkitTextStroke: `${width * 4 / 1080}px #1B1714`, paintOrder: 'stroke fill', lineHeight: 1.06,
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#929D8B'}}>
      <canvas ref={canvas} style={{display: 'block', width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', top: `${13 + 64 * (1 - zoom)}%`, left: `${13 + 40 * (1 - zoom)}%`, width: '74%', opacity: detail,
        transformOrigin: 'left top', transform: `scale(${0.15 + 0.85 * zoom})`,
        visibility: detail > 0 ? 'visible' : 'hidden', pointerEvents: 'none'}}>
        <canvas ref={proof} width={Math.round(width * 0.74)} height={Math.round(width * 0.41)}
          style={{display: 'block', width: '100%', border: `${width * 5 / 1080}px solid #F1F3E9`, boxSizing: 'border-box',
            borderRadius: width * 22 / 1080, boxShadow: '0 5px 22px #17282D70'}} />
        <div style={{...typography, marginTop: width * 12 / 1080, fontSize: width * 46 / 1080}}>
          Cian y amarillo
        </div>
      </div>

      {titleOpacity > 0 && (
        <div style={{...typography, position: 'absolute', top: '17%', left: '8%', right: '8%',
          fontSize: width * 70 / 1080, opacity: titleOpacity}}>
          Todo esto es tinta
        </div>
      )}
      {cue?.[1] && subtitleOpacity > 0 && (
        <div style={{...typography, position: 'absolute', top: subtitleBelow ? '72%' : '6%',
          left: '7%', right: '7%', fontSize: width * 56 / 1080, opacity: subtitleOpacity}}>
          {cue[1]}
        </div>
      )}

      {full && printScenes.map(({id, from, duration}) => {
        const voice = voiceFiles[id];
        if (!voice) return null;
        return (
          <Sequence key={id} from={from + 9} durationInFrames={duration - 18}>
            <Html5Audio src={staticFile(voice)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export function CuatroTintasApertura() {
  return <PrintVideo full={false} />;
}

export function CuatroTintasCompleto({voiceFiles}: {voiceFiles: PrintVoiceFiles}) {
  return <PrintVideo full voiceFiles={voiceFiles} />;
}
