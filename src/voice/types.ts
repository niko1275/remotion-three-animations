export type TimedWord = {text: string; start: number; end: number};
export type LocalVoice = {
  file: string;
  text: string;
  seconds: number;
  inSeconds: number;
  outSeconds: number;
  words: TimedWord[];
  approved: boolean;
};
export type VoiceManifest = Record<string,LocalVoice>;
