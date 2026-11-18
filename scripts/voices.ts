import {createHash,randomUUID} from 'node:crypto';
import {mkdir,open,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {accusationCameraCuts,accusationScript,roles,voiceFps,voiceScript} from '../src/voice/script';
import {accusationFrames} from '../src/scenes/la-acusacion/timeline';
import {buildVoiceTimeline,usableAudio} from '../src/voice/timing';
import type {TimedWord, VoiceManifest} from '../src/voice/types';

const publicDir = 'public/voices';
const workDir = '.voice-work';
const manifestFile = `${publicDir}/manifest.json`;

function number(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value<0) throw new Error(`${label} inválido`);
  return value;
}

async function json<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file,'utf8')) as T;
}

async function readManifest() {
  try {
    return await json<VoiceManifest>(manifestFile);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code==='ENOENT') return {};
    throw error;
  }
}

async function writeJson(file: string,value: unknown) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  try {
    await rename(temporary,file);
  } finally {
    await rm(temporary,{force:true});
  }
}

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

function alignmentWords(value: Alignment | null | undefined) {
  if (!value) return [];
  const {characters,character_start_times_seconds: starts,character_end_times_seconds: ends}=value;
  if (!Array.isArray(characters)||!Array.isArray(starts)||!Array.isArray(ends)
    ||starts.length!==characters.length||ends.length!==characters.length) {
    throw new Error('ElevenLabs devolvió timestamps incompletos.');
  }
  const words: TimedWord[]=[];
  let word: TimedWord | undefined;
  characters.forEach((character,i)=>{
    if (/^\s+$/.test(character)) {
      word=undefined;
    } else if(word) {
      word.text+=character;
      word.end=ends[i];
    } else {
      word={text:character,start:starts[i],end:ends[i]};
      words.push(word);
    }
  });
  return words;
}

function validateWords(words: TimedWord[], text: string, duration: number, from: number, to: number) {
  if(!Array.isArray(words)) throw new Error('El archivo de timestamps debe ser un arreglo JSON.');
  let previousEnd=0;
  for(const word of words) {
    number(word.start,'Inicio de palabra');
    number(word.end,'Fin de palabra');
    if(typeof word.text!=='string'||!word.text.trim()||word.start<previousEnd-1e-6||word.end<word.start||word.end>duration+.03) {
      throw new Error('Los timestamps deben estar en orden y dentro del MP3.');
    }
    if(word.start<from-1e-6||word.end>to+(to===duration ? .03 : 1e-6)) throw new Error('El recorte excluiría parte de una palabra.');
    previousEnd=word.end;
  }
  const sequence=(value:string)=>value.replace(/\s+/g,'');
  if (words.length && sequence(words.map(word=>word.text).join(''))!==sequence(text)) {
    throw new Error('Los timestamps deben transcribir el texto exacto del guion.');
  }
}

function scriptForReview() {
  return voiceScript.map(cue=>({...cue,fps:voiceFps,startSeconds:cue.start/voiceFps,
    audioFile:null,durationSeconds:null,timestamps:[]}));
}

async function main() {
  const {values,positionals} = parseArgs({
    allowPositionals:true,
    options:{replace:{type:'boolean'},'confirm-paid':{type:'boolean'},words:{type:'string'},in:{type:'string'},out:{type:'string'}},
  });
  const [job,id,input] = positionals;
  if (job==='script') {
    console.log(JSON.stringify(scriptForReview(),null,2));
    return;
  }
  if (job==='report') {
    const manifest=await readManifest();
    const plan=buildVoiceTimeline(accusationScript,manifest,accusationFrames,voiceFps,accusationCameraCuts);
    console.log(JSON.stringify(voiceScript.map(cue=>{
      const audio=usableAudio(cue,manifest);
      const track=plan.tracks.find(track=>track.cue.id===cue.id);
      return {...cue,fps:voiceFps,startFrame:track?.start??cue.start,
        endFrame:track ? track.start+track.frames : cue.start+cue.frames,
        audioFile:audio?.file??null,durationSeconds:audio?.seconds??null,
        audioRange:audio?[audio.inSeconds,audio.outSeconds]:null,
        timestamps:audio?.words??[],approved:audio?.approved??false};
    }),null,2));
    return;
  }
  if (!['import','generate','approve'].includes(job??'')) {
    throw new Error('Uso: npm run voices -- script | report | import ID ARCHIVO.mp3 [--words PALABRAS.json] | generate ID --confirm-paid | approve ID');
  }
  const cue=voiceScript.find(entry=>entry.id===id);
  if(!cue) throw new Error(`Intervención desconocida: ${id??''}`);
  if(job==='generate'&&!values['confirm-paid']) throw new Error('La generación requiere confirmación explícita con --confirm-paid.');
  if(job==='import'&&!input) throw new Error('Indica la ruta de un MP3 local.');

  await mkdir(publicDir,{recursive:true});
  await mkdir(workDir,{recursive:true});
  const lock=`${workDir}/edit.lock`;
  const handle=await open(lock,'wx').catch((error:NodeJS.ErrnoException)=>{
    if(error.code==='EEXIST') throw new Error('Ya hay una operación de voces en curso. Revisa .voice-work/edit.lock.');
    throw error;
  });
  try {
    const manifest=await readManifest();
    const previous=manifest[cue.id];
    if(job==='approve') {
      if(!previous||previous.text!==cue.text) throw new Error('Primero importa un archivo que corresponda al texto actual.');
      await readFile(`public/${previous.file}`);
      previous.approved=true;
      await writeJson(manifestFile,manifest);
      console.log(`${cue.id} aprobada.`);
      return;
    }
    if(previous?.approved) throw new Error(`${cue.id} está aprobada y protegida.`);
    if(previous&&!values.replace) throw new Error(`${cue.id} ya tiene un archivo. Usa --replace para sustituirlo.`);

    let mp3: Buffer;
    let words: TimedWord[];
    let recovery: string | undefined;
    if(job==='import') {
      mp3=await readFile(input);
      words=values.words?await json<TimedWord[]>(values.words):[];
    } else {
      if(values.words) throw new Error('--words se usa al importar MP3 locales.');
      const apiKey=process.env.ELEVENLABS_API_KEY;
      if(!apiKey) throw new Error('Falta ELEVENLABS_API_KEY en el entorno de Node.');
      const config=await json<{modelId:string;voiceIds:Record<string,string>}>('configs/voices.local.json');
      if(!config.modelId?.trim()||!roles.every(role=>typeof config.voiceIds?.[role]==='string')) throw new Error('Configuración de voces inválida.');
      const voiceId=config.voiceIds[cue.role].trim();
      if(!voiceId) throw new Error(`Falta el voice_id para ${cue.role}.`);
      let response: Response;
      try {
        response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,{
          method:'POST',signal:AbortSignal.timeout(60_000),
          headers:{'content-type':'application/json','xi-api-key':apiKey},
          body:JSON.stringify({text:cue.text,model_id:config.modelId,
            ...(config.modelId==='eleven_multilingual_v2'?{}:{language_code:'es'})}),
        });
      } catch {
        throw new Error('Error de red o tiempo de espera de ElevenLabs. Revisa el historial antes de reintentar.');
      }
      if(!response.ok) throw new Error(`ElevenLabs respondió HTTP ${response.status} ${response.statusText}. Referencia: ${response.headers.get('request-id')??'sin referencia'}.`);
      const body=await response.json() as {audio_base64?:string;alignment?:Alignment|null;normalized_alignment?:Alignment|null};
      if(typeof body.audio_base64!=='string'||!body.audio_base64) throw new Error('ElevenLabs no devolvió audio MP3.');
      mp3=Buffer.from(body.audio_base64,'base64');
      // Keep a recoverable local copy of a successful paid response before validating it.
      recovery=`${workDir}/${cue.id}-${randomUUID()}`;
      await writeFile(`${recovery}.mp3`,mp3,{flag:'wx'});
      await writeJson(`${recovery}.json`,{alignment:body.alignment,normalizedAlignment:body.normalized_alignment,
        modelId:config.modelId,voiceId});
      console.log(`Respuesta guardada en ${recovery}.mp3`);
      try {
        words=alignmentWords(body.alignment);
      } catch {
        console.warn('Los timestamps de la API están incompletos. Se conserva el audio local.');
        words=[];
      }
    }
    const {parseBuffer}=await import('music-metadata');
    const {format}=await parseBuffer(mp3,{mimeType:'audio/mpeg'},{duration:true});
    const duration=number(format.duration,'Duración MP3');
    if(duration===0||!/layer 3|mp3/i.test(format.codec??'')) throw new Error('El archivo debe contener audio MP3.');
    const from=number(values.in===undefined?0:Number(values.in),'Punto de entrada');
    const to=number(values.out===undefined?duration:Number(values.out),'Punto de salida');
    if(from>=to||to>duration) throw new Error('El intervalo de audio está fuera del MP3.');
    try {
      validateWords(words,cue.text,duration,from,to);
    } catch (error) {
      if(!recovery || values.in!==undefined || values.out!==undefined) throw error;
      console.warn('La alineación no coincide con el guion o la duración. Se conserva en .voice-work para revisión.');
      words=[];
    }
    const hash=createHash('sha256').update(mp3).digest('hex').slice(0,16);
    const file=`voices/${cue.id}-${hash}.mp3`;
    await writeFile(`public/${file}`,mp3,{flag:'wx'}).catch((error:NodeJS.ErrnoException)=>{
      if(error.code!=='EEXIST') throw error;
    });
    manifest[cue.id]={file,text:cue.text,seconds:duration,inSeconds:from,outSeconds:to,words,approved:false};
    await writeJson(manifestFile,manifest);
    console.log(`${cue.id}: ${(to-from).toFixed(3)} s, ${words.length} palabras con timestamps. ${file}`);
  } finally {
    await handle.close();
    await rm(lock,{force:true});
  }
}

main().catch(error=>{
  console.error(error instanceof Error?error.message:String(error));
  process.exitCode=1;
});
