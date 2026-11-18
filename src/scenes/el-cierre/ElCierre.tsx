import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FocoCaption} from '../efecto-foco/overlays';
import {AccusationStage, toAccusationFragmentShader} from '../la-acusacion/LaAcusacion';
import {makeAccusationShader} from '../la-acusacion/shader';
import {finalQuestion} from './script';
import {closingFrame} from './timeline';

const shader = toAccusationFragmentShader(makeAccusationShader({
  arms: `    if (protagonist) {
      elbow = vec3(side*.267,1.015,-.27);
      hand = vec3(side*(.0635+.0008*sin(T*2.)),1.023,-.558+side*.009);
    } else {
      elbow = vec3(side*.270,1.017,-.31);
      hand = vec3(side*.155,1.023,-.57);
    }
`,
}));

export function ElCierre() {
  const state = closingFrame(useCurrentFrame());
  return <AccusationStage shot={state} shader={shader}>
    <AbsoluteFill style={{background: '#171613', opacity: state.ambientDim, pointerEvents: 'none'}} />
    {state.caption && <AbsoluteFill style={{opacity: 1-state.black, pointerEvents: 'none'}}>
      <FocoCaption top="74%" size={.051} inset="15%">{state.caption}</FocoCaption>
    </AbsoluteFill>}
    <AbsoluteFill style={{background: '#000', opacity: state.black, pointerEvents: 'none'}} />
    {state.question>0 && <AbsoluteFill style={{opacity: state.question, pointerEvents: 'none'}}>
      <FocoCaption top="50%" centerY size={.087} inset="16%">{finalQuestion}</FocoCaption>
    </AbsoluteFill>}
  </AccusationStage>;
}
