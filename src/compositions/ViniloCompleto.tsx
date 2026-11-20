import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {buildVinylTimeline} from '../timeline';
import {ViniloEscena1} from '../scenes/vinilo-apertura/ViniloEscena1';
import {ProductionScene} from '../scenes/vinilo-produccion/ProductionScene';
import type {VinylAudioProps} from './ViniloAnimatico';

export function ViniloCompleto({voiceFiles, voiceDurations}: VinylAudioProps) {
  const {scenes} = buildVinylTimeline(voiceDurations);
  return (
    <AbsoluteFill>
      {scenes.map((scene) => {
        const narration = voiceFiles[scene.id];
        return (
          <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} name={scene.title}>
            {scene.id === 'apertura'
              ? <ViniloEscena1 duration={scene.durationInFrames} screenText={scene.screenText} />
              : <ProductionScene sceneId={scene.id} duration={scene.durationInFrames} screenText={scene.screenText} />}
            {narration && (
              <Sequence from={scene.voiceLead} durationInFrames={scene.voiceDurationInFrames}>
                <Html5Audio src={staticFile(narration)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
