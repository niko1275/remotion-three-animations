import {Composition, Folder} from 'remotion';
import {StoryShort} from './compositions/StoryShort';
import {CharacterShowcase} from './scenes/CharacterShowcase';
import {Orbit} from './Orbit';
import {Hospital} from './scenes/Hospital';
import {Workshop} from './scenes/Workshop';
export const Root = () => <>
  <Folder name="Shorts">
    <Composition id="HospitalStory" component={StoryShort} durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{lighting:'night' as const}}/>
    <Composition id="ProtagonistActions" component={CharacterShowcase} durationInFrames={720} fps={30} width={1080} height={1920}/>
  </Folder>
  <Folder name="Dioramas">
    <Composition id="Hospital" component={Hospital} durationInFrames={240} fps={30} width={1280} height={960}/>
    <Composition id="Workshop" component={Workshop} durationInFrames={240} fps={30} width={1280} height={960}/>
  </Folder>
  <Composition id="Orbit" component={Orbit} durationInFrames={180} fps={30} width={1920} height={1080}/>
</>;
