import {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vector3} from 'three';
import {FocoCaption} from '../efecto-foco/overlays';
import {rememberedLetters} from '../el-falso-recuerdo/timeline';
import {LabStage, canvasTexture, toLabFragmentShader} from '../el-experimento/ElExperimento';
import {makeTrapDisplay} from '../la-trampa/LaTrampa';
import {results} from './script';
import {resultsShader} from './shader';
import {resultsFrame} from './timeline';

const shader = toLabFragmentShader(resultsShader);

function makeDeclaration() {
  return canvasTexture(512,660,context => {
    context.fillStyle = '#fff';
    context.font = '700 44px system-ui, sans-serif';
    context.fillText('DECLARACIÓN',44,86);
    context.fillStyle = 'rgba(255,255,255,.62)';
    for(let line=0;line<5;line++) context.fillRect(44,130+line*36,line===4?315:424,4);
    context.fillRect(44,453,424,4);
    context.font = '600 29px system-ui, sans-serif';
    context.fillText('Firma',44,503);
  });
}

export function LosResultados() {
  const state = resultsFrame(useCurrentFrame());
  const document = useMemo(makeDeclaration, []);
  const present = useMemo(() => makeTrapDisplay('error',''), []);
  const remembered = useMemo(() => makeTrapDisplay('text',rememberedLetters), []);
  useEffect(() => () => document.dispose(),[document]);
  useEffect(() => () => present.dispose(),[present]);
  useEffect(() => () => remembered.dispose(),[remembered]);

  const statistic = state.shot === 'confesion' ? results[0] :
    state.shot === 'culpa' ? results[1] : state.shot === 'fragmentos' ? results[2] : undefined;
  const lower = state.shot === 'culpa';
  return <LabStage shot={state} motion={state.motion} rule={false} shader={shader}
    leftHover={state.leftHover} rightWrist={state.rightWrist}
    displayTexture={state.imagining ? remembered : present}
    extraUniforms={{
      POINT: {value: 0}, RESEARCHER_PRESENT: {value: 0}, RESEARCHER_MOUTH: {value: 0},
      SURPRISE: {value: 0}, SCREEN_LEVEL: {value: 1},
      SHOW_PAPER: {value: state.paper ? 1 : 0},
      INK_PROGRESS: {value: state.signature},
      PEN: {value: new Vector3(...state.pen)},
      PEN_AXIS: {value: state.penAxis},
      DECLARATION: {value: document},
    }}>
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 52% 39%, transparent 18%, #141310 100%)',
      opacity: state.isolate, pointerEvents: 'none',
    }} />
    <AbsoluteFill style={{opacity: state.graphicOpacity, pointerEvents: 'none'}}>
      {statistic ? <>
        <FocoCaption top={lower?'63%':'15%'} size={.143} inset="14%">{statistic.percent}</FocoCaption>
        <FocoCaption top={lower?'73%':'25%'} size={.053} inset="14%">{statistic.label}</FocoCaption>
        {state.shot === 'confesion' && <FocoCaption top="35%" size={.030} inset="14%">Kassin y Kiechel (1996) · 75 participantes</FocoCaption>}
      </> : <FocoCaption top="17%" inset="14%">NUNCA PRESIONARON ALT</FocoCaption>}
    </AbsoluteFill>
    <AbsoluteFill style={{background: '#000', opacity: state.black, pointerEvents: 'none'}} />
  </LabStage>;
}
