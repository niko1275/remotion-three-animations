import {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FocoCaption} from '../efecto-foco/overlays';
import {LabStage, toLabFragmentShader} from '../el-experimento/ElExperimento';
import {makeTrapDisplay} from '../la-trampa/LaTrampa';
import {trapShader} from '../la-trampa/shader';
import {memoryFrame, rememberedLetters} from './timeline';

const shader = toLabFragmentShader(trapShader);

export function ElFalsoRecuerdo() {
  const state = memoryFrame(useCurrentFrame());
  const remembered = useMemo(() => makeTrapDisplay('text',rememberedLetters), []);
  const present = useMemo(() => makeTrapDisplay('error',''), []);
  useEffect(() => () => remembered.dispose(), [remembered]);
  useEffect(() => () => present.dispose(), [present]);

  return <LabStage shot={state} motion={state.motion} rule={false} shader={shader}
    displayTexture={state.imagining ? remembered : present} leftHover={state.leftHover}
    extraUniforms={{
      POINT: {value: 0},
      RESEARCHER_PRESENT: {value: 0},
      RESEARCHER_MOUTH: {value: 0},
      SURPRISE: {value: state.surprise},
      SCREEN_LEVEL: {value: 1},
    }}>
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 49% 42%, transparent 29%, #171613 100%)',
      opacity: state.isolate, pointerEvents: 'none',
    }} />
    {state.caption && <FocoCaption top="79%">{state.caption}</FocoCaption>}
  </LabStage>;
}
