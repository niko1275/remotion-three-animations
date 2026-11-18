import {FocoCaption} from '../scenes/efecto-foco/overlays';
import {wordKey, type VoiceTrack} from './timing';
import type {TimedWord} from './types';

const emphasis = new Set(['alt','nunca','seguro','tecla']);

function pages(words: TimedWord[]) {
  const result: TimedWord[][] = [];
  let row: TimedWord[] = [], chars = 0;
  for(const word of words) {
    if(row.length && (chars+word.text.length>36 || row.length>=7)) {
      result.push(row);
      row=[];
      chars=0;
    }
    row.push(word);
    chars+=word.text.length+1;
  }
  if(row.length) result.push(row);
  return result;
}

export function Subtitles({track, frame, fps, top='74%'}: {
  track: VoiceTrack; frame: number; fps: number; top?: string;
}) {
  const timed=!!track.audio?.words.length;
  const start=track.trimBefore/fps;
  const duration=track.frames/fps;
  const tokens=track.cue.text.split(/\s+/);
  const words=timed ? track.audio!.words : tokens.map((text,i)=>({
    text,start:start+i/tokens.length*duration,end:start+(i+1)/tokens.length*duration,
  }));
  const time=(frame-track.start)/fps+start;
  const group=pages(words).find(page=>time>=page[0].start&&time<page[page.length-1].end);
  if (!group) return null;
  return <FocoCaption top={top} size={.055} inset="14%">
    {group.map((word,i)=><span key={i} style={{
      color:timed&&time>=word.start&&time<word.end&&emphasis.has(wordKey(word.text))?'#f1d8a2':undefined,
    }}>{i>0?' ':''}{word.text}</span>)}
  </FocoCaption>;
}
