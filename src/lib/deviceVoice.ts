/**
 * Helpers for reading story lines with the device's built-in voice (Web Speech API) when no human
 * recording exists. Only fixed story text is ever spoken, never anything a visitor typed.
 */

/** Chrome's online voices stop after roughly 15 seconds, so each utterance stays well short of that. */
export const MAX_CHUNK_LENGTH = 140;
/** Chrome may drop a speak() issued in the same task as cancel(). */
export const SPEAK_AFTER_CANCEL_MS = 60;
/** getVoices() is often empty until "voiceschanged"; Safari may never fire that event, so poll as well. */
export const VOICE_WAIT_MS = 1500;
export const SPEECH_RATE = 0.95;

// macOS novelty and legacy voices that would turn a serious scene into a joke.
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|ralph|superstar|trinoids|whisper|wobble|zarvox|fred|kathy|grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b/i;
const PREFERRED_NAMES = /\b(linh|karen|lee|catherine|samantha|google|microsoft|natural|premium|enhanced)\b/i;

const localeOf = (voice: Pick<SpeechSynthesisVoice, 'lang'>) => voice.lang.replace('_', '-').toLowerCase();

/** Best voice for a language, preferring the character's locales, pleasant voices and on-device voices. */
export function pickVoice<V extends Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService' | 'default'>>(voices: readonly V[], language: 'vi' | 'en', locales: readonly string[] = []): V | null {
  const matching = voices.filter(voice => localeOf(voice).startsWith(language));
  const usable = matching.filter(voice => !NOVELTY.test(voice.name));
  const pool = usable.length ? usable : matching;
  if (!pool.length) return null;
  const score = (voice: V) => {
    const index = locales.findIndex(locale => locale.toLowerCase() === localeOf(voice));
    return (index >= 0 ? 40 - index * 10 : 0) + (PREFERRED_NAMES.test(voice.name) ? 6 : 0) + (voice.localService ? 3 : 0) + (voice.default ? 1 : 0);
  };
  return [...pool].sort((a, b) => score(b) - score(a))[0];
}

/** Splits a caption into short utterances at sentence, then clause, then word boundaries. */
export function speechChunks(text: string, max = MAX_CHUNK_LENGTH): string[] {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?…]+(?:[.!?…]+["”’)]*|$)\s*/g) ?? [];
  const pieces = sentences.flatMap(sentence => {
    if (sentence.length <= max) return [sentence];
    const clauses = sentence.match(/[^,;:—]+(?:[,;:—]+|$)\s*/g) ?? [sentence];
    return clauses.flatMap(clause => clause.length <= max ? [clause] : clause.match(new RegExp(`.{1,${max}}(?:\\s|$)`, 'g')) ?? [clause]);
  });
  const chunks: string[] = [];
  for (const piece of pieces) {
    const last = chunks.length - 1;
    if (last >= 0 && chunks[last].length + piece.length <= max) chunks[last] += piece;
    else chunks.push(piece);
  }
  return chunks.map(chunk => chunk.trim()).filter(Boolean);
}

/** Resolves with the device's voices once they are available, or with whatever exists after the wait. */
export function waitForVoices(synth: SpeechSynthesis, wait = VOICE_WAIT_MS): Promise<SpeechSynthesisVoice[]> {
  const ready = synth.getVoices();
  if (ready.length) return Promise.resolve(ready);
  return new Promise(resolve => {
    const started = Date.now();
    const check = () => {
      const voices = synth.getVoices();
      if (!voices.length && Date.now() - started < wait) return;
      clearInterval(timer);
      synth.removeEventListener?.('voiceschanged', check);
      resolve(voices);
    };
    const timer = setInterval(check, 100);
    synth.addEventListener?.('voiceschanged', check);
  });
}
