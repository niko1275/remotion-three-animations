import {ViniloCompleto} from './compositions/ViniloCompleto';
import {CuatroTintasApertura, CuatroTintasCompleto} from './scenes/cuatro-tintas/CuatroTintasApertura';
import {printFullFrames, printLoopFrames, printOpeningFrames} from './scenes/cuatro-tintas/timeline';
import {openingDurationInFrames, ViniloEscena1} from './scenes/vinilo-apertura/ViniloEscena1';
import {animaticDefaultProps, calculateVinylMetadata, ViniloAnimatico} from './compositions/ViniloAnimatico';
import {VINYL_FPS, VINYL_HEIGHT, VINYL_WIDTH, vinylTimeline} from './timeline';
import {ReelVoxel} from './scenes/reel-voxel/ReelVoxel';
import {FPS as reelFps, TOTAL as reelDuration} from './scenes/reel-voxel/scene';
import {GraphicCharacterStudy} from './scenes/GraphicCharacterStudy';
import {EfectoFoco} from './scenes/efecto-foco/EfectoFoco';
import {Composition, Folder} from 'remotion';
import {StoryShort} from './compositions/StoryShort';
import {CharacterShowcase} from './scenes/CharacterShowcase';
import {Orbit} from './Orbit';
import {Hospital} from './scenes/Hospital';
import {Workshop} from './scenes/Workshop';
export const Root = () => <>
  <Folder name="GraphicNovel">
    <Composition id="GraphicProtagonist" component={GraphicCharacterStudy} durationInFrames={120} fps={30} width={1080} height={1440} defaultProps={{view:'body' as const,expression:'neutral' as const}}/>
    <Composition id="GraphicPortrait" component={GraphicCharacterStudy} durationInFrames={120} fps={30} width={1080} height={1440} defaultProps={{view:'face' as const,expression:'worried' as const}}/>
  </Folder>
  <Folder name="Shorts">
    <Composition id="CuatroTintasApertura" component={CuatroTintasApertura} durationInFrames={printOpeningFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT}/>
    <Composition id="CuatroTintasBucle" component={CuatroTintasApertura} durationInFrames={printLoopFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT}/>
    <Composition id="CuatroTintasCompleto" component={CuatroTintasCompleto} durationInFrames={printFullFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT} defaultProps={{voiceFiles:{}}}/>
    <Composition id="ViniloCompleto" component={ViniloCompleto} durationInFrames={vinylTimeline.durationInFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT} defaultProps={animaticDefaultProps} calculateMetadata={calculateVinylMetadata}/>
    <Composition id="ViniloEscena1" component={ViniloEscena1} durationInFrames={openingDurationInFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT}/>
    <Composition id="ViniloAnimatico" component={ViniloAnimatico} durationInFrames={vinylTimeline.durationInFrames} fps={VINYL_FPS} width={VINYL_WIDTH} height={VINYL_HEIGHT} defaultProps={animaticDefaultProps} calculateMetadata={calculateVinylMetadata}/>
    <Composition id="ReelVoxel" component={ReelVoxel} durationInFrames={reelDuration} fps={reelFps} width={1080} height={1920}/>
    <Composition id="EfectoFoco" component={EfectoFoco} durationInFrames={210} fps={30} width={540} height={960}/>
    <Composition id="HospitalStory" component={StoryShort} durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{lighting:'night' as const}}/>
    <Composition id="ProtagonistActions" component={CharacterShowcase} durationInFrames={720} fps={30} width={1080} height={1920}/>
  </Folder>
  <Folder name="Dioramas">
    <Composition id="Hospital" component={Hospital} durationInFrames={240} fps={30} width={1280} height={960}/>
    <Composition id="Workshop" component={Workshop} durationInFrames={240} fps={30} width={1280} height={960}/>
  </Folder>
  <Composition id="Orbit" component={Orbit} durationInFrames={180} fps={30} width={1920} height={1080}/>
</>;
