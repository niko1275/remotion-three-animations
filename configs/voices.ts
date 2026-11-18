import type {VoiceRole} from '../src/voice/script';

export const voiceConfig: {modelId: string; voiceIds: Record<VoiceRole, string>} = {
  modelId: 'eleven_multilingual_v2',
  voiceIds: {
    narrador: 'xOIP6U1wFJZGZqtVhMKY',
    investigador: 'XRJWcG2EfnXUf27dRJZn',
    estudiante: 'YExhVa4bZONzeingloMX',
    testigo: 'm7yTemJqdIqrcNleANfX',
  },
};
