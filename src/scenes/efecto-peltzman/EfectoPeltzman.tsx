import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FocoCaption, FocoGrain} from '../efecto-foco/overlays';
import {Drive} from './Drive';
import {ease, narration, peltzmanFrame} from './timeline';

export const peltzmanDefaults = {narratorAudio: '', subtitles: true, effectsVolume: .65};

const pages = narration.map(({text}) => {
  const result: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line.length && line.length + word.length > 39) {
      result.push(line);
      line = '';
    }
    line += (line ? ' ' : '') + word;
  }
  return line ? [...result, line] : result;
});

export function EfectoPeltzman({narratorAudio, subtitles, effectsVolume}: typeof peltzmanDefaults) {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const views = peltzmanFrame(t);
  const split = views.length === 2;
  const rewind = t >= 14 && t < 15.3;
  const next = narration.findIndex(({at}) => at > t);
  const cue = next < 0 ? narration.length - 1 : next - 1;
  const start = narration[cue].at;
  const end = narration[cue+1]?.at ?? 59;
  const page = pages[cue][Math.min(pages[cue].length-1, Math.floor((t-start)/(end-start)*pages[cue].length))];
  const panelHeight = split ? Math.floor(height/2) : height;
  return <AbsoluteFill style={{backgroundColor:'#202629', overflow:'hidden'}}>
    {views.map((state, i) => <div key={i} style={{position:'absolute', top:i*panelHeight, left:0,
      width, height:panelHeight, overflow:'hidden', borderTop:i?'2px solid #282420':undefined}}>
      <Drive width={width} height={panelHeight} state={state} time={t}/>
    </div>)}
    <FocoGrain/>
    {rewind && <AbsoluteFill style={{opacity:.22*(1-ease(t,14.2,15.3)), background:'#e1a851'}}/>}
    {rewind && <FocoCaption top="15%" size={.044}>◀◀</FocoCaption>}
    {split && t >= 31.05 && <AbsoluteFill style={{opacity:ease(t,31.05,31.45)}}>
      <FocoCaption top="49.5%" centerY size={.071} inset="12%">EFECTO PELTZMAN</FocoCaption>
    </AbsoluteFill>}
    {subtitles && <FocoCaption top="75%" size={.059} inset="15%">{page}</FocoCaption>}
    <Html5Audio src={staticFile('sounds/peltzman.mp3')} volume={effectsVolume}/>
    {narratorAudio && <Html5Audio src={staticFile(narratorAudio)}/>}
  </AbsoluteFill>;
}
