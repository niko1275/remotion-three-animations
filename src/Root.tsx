import {PruebaLoop, loopPreviewFrames} from './scenes/el-cierre/PruebaLoop';
import {ElCierre} from './scenes/el-cierre/ElCierre';
import {closingFps, closingFrames} from './scenes/el-cierre/timeline';
import {LosResultados} from './scenes/los-resultados/LosResultados';
import {resultsFps, resultsFrames} from './scenes/los-resultados/timeline';
import {ElFalsoRecuerdo} from './scenes/el-falso-recuerdo/ElFalsoRecuerdo';
import {memoryFps, memoryFrames} from './scenes/el-falso-recuerdo/timeline';
import {ElFalsoTestigo} from './scenes/el-falso-testigo/ElFalsoTestigo';
import {witnessFps, witnessFrames} from './scenes/el-falso-testigo/timeline';
import {LaTrampa} from './scenes/la-trampa/LaTrampa';
import {trapFps, trapFrames} from './scenes/la-trampa/timeline';
import {ElExperimento} from './scenes/el-experimento/ElExperimento';
import {experimentFps, experimentFrames} from './scenes/el-experimento/timeline';
import {LaAcusacion} from './scenes/la-acusacion/LaAcusacion';
import {accusationFps, accusationFrames} from './scenes/la-acusacion/timeline';
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
    <Composition id="LaAcusacion" component={LaAcusacion} durationInFrames={accusationFrames} fps={accusationFps} width={540} height={960}/>
    <Composition id="ElExperimento" component={ElExperimento} durationInFrames={experimentFrames} fps={experimentFps} width={1080} height={1920}/>
    <Composition id="LaTrampa" component={LaTrampa} durationInFrames={trapFrames} fps={trapFps} width={1080} height={1920}/>
    <Composition id="ElFalsoTestigo" component={ElFalsoTestigo} durationInFrames={witnessFrames} fps={witnessFps} width={1080} height={1920}/>
    <Composition id="ElFalsoRecuerdo" component={ElFalsoRecuerdo} durationInFrames={memoryFrames} fps={memoryFps} width={1080} height={1920}/>
    <Composition id="LosResultados" component={LosResultados} durationInFrames={resultsFrames} fps={resultsFps} width={1080} height={1920}/>
    <Composition id="ElCierre" component={ElCierre} durationInFrames={closingFrames} fps={closingFps} width={1080} height={1920}/>
    <Composition id="PruebaLoop" component={PruebaLoop} durationInFrames={loopPreviewFrames} fps={closingFps} width={1080} height={1920}/>
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
