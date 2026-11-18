import type {ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FocoCaption} from '../efecto-foco/overlays';
import {AccusationStage, toAccusationFragmentShader} from '../la-acusacion/LaAcusacion';
import {makeAccusationShader} from '../la-acusacion/shader';
import {closingFrame} from './timeline';

const shader = toAccusationFragmentShader(makeAccusationShader({
  declarations: 'uniform float CLOSING_ARMS;\n',
  arms: `    vec3 endingElbow = protagonist
      ? vec3(side*.267,1.015,-.27) : vec3(side*.270,1.017,-.31);
    vec3 endingHand = protagonist
      ? vec3(side*(.0635+.0008*sin(T*2.)),1.023,-.558+side*.009)
      : vec3(side*.155,1.023,-.57);
    elbow = mix(elbow,endingElbow,CLOSING_ARMS);
    hand = mix(hand,endingHand,CLOSING_ARMS);
`,
}));

export function ClosingStage({shot, closingArms, children}: {
  shot: Parameters<typeof AccusationStage>[0]['shot'];
  closingArms: number;
  children?: ReactNode;
}) {
  return <AccusationStage shot={shot} shader={shader} extraUniforms={{CLOSING_ARMS: {value: closingArms}}}>
    {children}
  </AccusationStage>;
}

export function ClosingCaption({state}: {state: ReturnType<typeof closingFrame>}) {
  return state.caption && state.captionOpacity>0 ? <AbsoluteFill style={{opacity: state.captionOpacity}}>
    <FocoCaption top="74%" size={.051} inset="15%">{state.caption}</FocoCaption>
  </AbsoluteFill> : null;
}

export function ElCierre() {
  const state = closingFrame(useCurrentFrame());
  return <ClosingStage shot={state} closingArms={state.closingArms}>
    <ClosingCaption state={state}/>
  </ClosingStage>;
}
