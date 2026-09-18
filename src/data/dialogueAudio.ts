import type { Language, Resident } from '../types';
import { assignedVoice } from './characterVoices';
import catalog from './dialogueAudio.generated.json';

type Recording = { src: string; text: string; sha256: string; production?: string; listeningApproval?: string };
export const recordings: Record<string, Recording> = catalog.recordings;

if (typeof window !== 'undefined' && !Object.keys(recordings).length) {
  console.warn('[audio] No dialogue MP3s are bundled (src/data/dialogueAudio.generated.json is empty). Lines stay text-only unless the visitor enables the optional device voice. See docs/local-voices.md.');
}
const staleWarnings = new Set<string>();

export function recordingKey(character: string, cue: string, language: Language): string {
  return `${assignedVoice(character, language)}/${character}/${cue}`;
}

export function dialogueRecording(character: string, cue: string, language: Language, text: string): string | null {
  const key = recordingKey(character, cue, language);
  const recording = recordings[key];
  // A script edit cannot accidentally play an older caption's recording.
  if (recording && recording.text !== text && !staleWarnings.has(key)) {
    staleWarnings.add(key);
    console.warn(`[audio] The recording for ${key} no longer matches its caption, so it is skipped. Re-record or re-review it, then run npm run audio:prepare.`);
  }
  return recording?.text === text ? recording.src : null;
}

export function nextDialogueRecordings(resident: Resident, cue: string, language: Language): string[] {
  const node = resident.nodes[cue];
  const next = node?.choices?.map(choice => choice.next) ?? (node?.next ? [node.next] : []);
  return [...new Set(next.flatMap(id => {
    const text = resident.nodes[id]?.text[language];
    const src = text ? dialogueRecording(resident.id, id, language, text) : null;
    return src ? [src] : [];
  }))].slice(0, 3);
}
