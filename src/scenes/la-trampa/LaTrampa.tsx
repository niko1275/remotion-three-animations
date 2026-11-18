import {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FocoCaption} from '../efecto-foco/overlays';
import {canvasTexture, LabStage, toLabFragmentShader} from '../el-experimento/ElExperimento';
import {trapShader} from './shader';
import {trapFrame} from './timeline';

const fragmentShader = toLabFragmentShader(trapShader);

export function makeTrapDisplay(mode: string, text: string) {
  return canvasTexture(512, 352, context => {
    context.fillStyle = '#fff';
    context.font = '700 25px monospace';
    if (mode === 'error') {
      context.strokeStyle = '#fff';
      context.lineWidth = 3;
      context.strokeRect(25,76,462,186);
      context.fillRect(25,76,462,48);
      context.fillStyle = '#000';
      // The transparent lettering reads against the dark glass within the highlighted header.
      context.globalCompositeOperation = 'destination-out';
      context.font = '700 35px monospace';
      context.fillText('ERROR DEL SISTEMA',44,110);
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = '#fff';
      context.font = '700 34px monospace';
      context.fillText('TAREA DETENIDA',44,183);
      context.fillRect(44,207,22,4);
      return;
    }
    context.fillText('DICTADO',43,58);
    context.fillRect(43,72,426,2);
    context.font = '700 30px monospace';
    const letters = text.split(' ');
    for (let i=0;i<Math.ceil(letters.length/9);i++) {
      const line = letters.slice(i*9,(i+1)*9).join(' ');
      const y = 132+i*50;
      context.fillText(line,43,y);
      if ((i+1)*9 >= letters.length) context.fillRect(46+context.measureText(line).width,y+5,15,3);
    }
  });
}

export function LaTrampa() {
  const state = trapFrame(useCurrentFrame());
  const display = useMemo(() => makeTrapDisplay(state.displayMode,state.letters), [state.displayMode,state.letters]);
  useEffect(() => () => display.dispose(),[display]);

  return <LabStage shot={state} motion={state.motion} rule={state.rule}
    shader={fragmentShader} displayTexture={display}
    extraUniforms={{
      POINT: {value: state.point},
      RESEARCHER_PRESENT: {value: state.researcherPresent ? 1 : 0},
      RESEARCHER_MOUTH: {value: state.researcherMouth},
      SURPRISE: {value: state.surprise},
      SCREEN_LEVEL: {value: state.dimScreen},
    }}>
    <AbsoluteFill style={{background: '#171613', opacity: 1-state.exposure, pointerEvents: 'none'}} />
    {state.caption && <FocoCaption top="79%">{state.caption}</FocoCaption>}
    <AbsoluteFill style={{background: '#000', opacity: state.black, pointerEvents: 'none'}} />
  </LabStage>;
}
