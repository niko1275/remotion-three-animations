import {accusationCues, accusationFps, shots as accusationShots} from '../scenes/la-acusacion/timeline';
import {experimentNarration} from '../scenes/el-experimento/narration';
import {shots as experimentShots} from '../scenes/el-experimento/timeline';
import {dialogue as trapDialogue, narration as trapNarration, shots as trapShots} from '../scenes/la-trampa/timeline';
import {dialogue as witnessDialogue, narration as witnessNarration, shots as witnessShots} from '../scenes/el-falso-testigo/timeline';
import {thoughts, narration as memoryNarration, shots as memoryShots} from '../scenes/el-falso-recuerdo/timeline';
import {narration as resultsNarration, shots as resultsShots} from '../scenes/los-resultados/timeline';
import {narration as closingNarration, shots as closingShots} from '../scenes/el-cierre/timeline';

export const roles = ['narrador', 'investigador', 'estudiante', 'testigo'] as const;
export type VoiceRole = typeof roles[number];
export type Gesture = {label: string; sourceFrame: number; word?: string; atSeconds?: number};
type Cue = {start: number; frames: number; text: string};
type Shot = {id: string; frames: number};
type Line = Cue & {role: VoiceRole};
export type Intervention = Line & {
  id: string;
  scene: string;
  shots: string[];
  pauseBeforeSeconds?: number;
  gestures: Gesture[];
};

export const voiceFps = accusationFps;
export const accusationCameraCuts = accusationShots.slice(0,-1).map((_, i) =>
  accusationShots.slice(0,i+1).reduce((sum,shot)=>sum+shot.frames,0));

const cast = (role: VoiceRole, cues: readonly Cue[]): Line[] => cues.map(cue => ({
  role, start: cue.start, frames: cue.frames, text: cue.text,
}));

function scene(id: string, prefix: string, shots: Shot[], lines: Line[], gestures: Gesture[][] = []): Intervention[] {
  let next = 0;
  const edits = shots.map(shot => {
    const start = next;
    next += shot.frames;
    return {...shot,start,end:next};
  });
  return lines.sort((a,b)=>a.start-b.start).map((line,i)=>({
    ...line, id: `${prefix}-${String(i+1).padStart(2,'0')}`, scene:id,
    shots: edits.filter(shot=>shot.start<line.start+line.frames&&shot.end>line.start).map(shot=>shot.id),
    gestures: gestures[i]??[],
  }));
}

export const accusationScript = scene('LaAcusacion','s1',accusationShots,accusationCues.map(cue=>({
  start:cue.start,frames:cue.frames,text:cue.text,
  role:cue.speaker==='interrogador'?'investigador':'estudiante',
})), [
  [{label:'Inclinar la cabeza',sourceFrame:29,word:'presionaste'}],
  [{label:'Negar con la cabeza',sourceFrame:167,word:'seguro'}],
  [{label:'Inclinarse sobre la mesa',sourceFrame:268,word:'ella'}],
]);

export const voiceScript: Intervention[] = [
  ...accusationScript,
  ...scene('ElExperimento','s2',experimentShots,cast('narrador',experimentNarration),[
    [{label:'Mostrar 1996',sourceFrame:25,word:'1996'}],
    [{label:'Comenzar el dictado',sourceFrame:170}],
    [{label:'Enfocar ALT',sourceFrame:310,word:'alt'}],
  ]),
  ...scene('LaTrampa','s3',trapShots,[
    ...cast('investigador',trapDialogue.investigador),...cast('estudiante',trapDialogue.estudiante),...cast('narrador',trapNarration),
  ]),
  ...scene('ElFalsoTestigo','s4',witnessShots,[
    ...cast('investigador',[witnessDialogue.investigator]),...cast('testigo',[witnessDialogue.witness]),
    ...cast('narrador',witnessNarration),
  ], [[],[{label:'Asentir',sourceFrame:105,word:'sí'}]]),
  ...scene('ElFalsoRecuerdo','s5',memoryShots,[...cast('estudiante',thoughts),...cast('narrador',memoryNarration)]),
  ...scene('LosResultados','s6',resultsShots,cast('narrador',resultsNarration)),
  ...scene('ElCierre','s7',closingShots,cast('narrador',closingNarration)),
];
