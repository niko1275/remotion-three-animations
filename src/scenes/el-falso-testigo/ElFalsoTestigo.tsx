import {useEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vector2} from 'three';
import {FocoCaption} from '../efecto-foco/overlays';
import {LabStage, toLabFragmentShader} from '../el-experimento/ElExperimento';
import {makeTrapDisplay} from '../la-trampa/LaTrampa';
import {makeTrapShader} from '../la-trampa/shader';
import {witnessFigures, witnessMap, witnessPalette} from './Testigo';
import {witnessFrame} from './timeline';

const shader = toLabFragmentShader(makeTrapShader({
  declarations: 'uniform float RESEARCHER_YAW, WITNESS_MOUTH;\nuniform vec2 WITNESS_HEAD;\n',
  figures: witnessFigures,
  map: witnessMap,
  palette: witnessPalette,
  researcherYaw: 'RESEARCHER_YAW',
}));

export function ElFalsoTestigo({sourceFrame, narrated = false}: {sourceFrame?: number; narrated?: boolean} = {}) {
  const frame = useCurrentFrame();
  const state = witnessFrame(sourceFrame ?? frame);
  const display = useMemo(() => makeTrapDisplay('error',''), []);
  useEffect(() => () => display.dispose(), [display]);

  return <LabStage shot={state} motion={state.motion} rule={false} shader={shader} displayTexture={display}
    extraUniforms={{
      POINT: {value: 0},
      RESEARCHER_PRESENT: {value: 1},
      RESEARCHER_YAW: {value: state.researcherYaw},
      RESEARCHER_MOUTH: {value: narrated ? 0 : state.researcherMouth},
      SURPRISE: {value: state.surprise},
      SCREEN_LEVEL: {value: 1},
      WITNESS_HEAD: {value: new Vector2(...state.witnessHead)},
      WITNESS_MOUTH: {value: narrated ? 0 : state.witnessMouth},
    }}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 49% 38%, transparent 24%, #171613 100%)',
      opacity: state.isolate, pointerEvents: 'none'}} />
    {!narrated && state.caption && <FocoCaption top="77%">{state.caption}</FocoCaption>}
    <AbsoluteFill style={{background: '#000', opacity: state.black, pointerEvents: 'none'}} />
  </LabStage>;
}
