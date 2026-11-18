import {useCurrentFrame} from 'remotion';
import {FocoCaption} from '../efecto-foco/overlays';
import {accusationFrame} from '../la-acusacion/timeline';
import {ClosingCaption, ClosingStage} from './ElCierre';
import {closingFps, closingFrame, closingFrames} from './timeline';

const excerptFrames = closingFps*3;
export const loopPreviewFrames = excerptFrames*4;

export function PruebaLoop() {
  const local = useCurrentFrame() % (excerptFrames*2);
  if (local < excerptFrames) {
    const state = closingFrame(closingFrames-excerptFrames+local);
    return <ClosingStage shot={state} closingArms={state.closingArms}>
      <ClosingCaption state={state}/>
    </ClosingStage>;
  }
  const state = accusationFrame(local-excerptFrames);
  return <ClosingStage shot={state} closingArms={0}>
    <FocoCaption top="79%">{state.caption}</FocoCaption>
  </ClosingStage>;
}
