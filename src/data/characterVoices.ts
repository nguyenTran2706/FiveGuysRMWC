import type { Language } from '../types';

export type VoicePack = 'vi-north' | 'vi-central' | 'vi-south' | 'en-vietnamese' | 'en-australian' | 'en-american';
export const voicePackLabels: Record<VoicePack, string> = {
  'vi-north': 'Vietnamese — Northern',
  'vi-central': 'Vietnamese — Central',
  'vi-south': 'Vietnamese — Southern',
  'en-vietnamese': 'English — natural Vietnamese accent',
  'en-australian': 'English — Australian accent',
  'en-american': 'English — General American accent',
};

// Casting directions, not claims about a character's birthplace or biography.
// These assignments remain fixed across every branch, replay and visit.
export const characterVoices: Record<string, { vi: VoicePack; en: VoicePack; direction: string }> = {
  linh: { vi: 'vi-south', en: 'en-vietnamese', direction: '26. Warm, observant, tired after work. Give the money and her mother space; allow hesitant breaths without theatrical crying.' },
  bao: { vi: 'vi-south', en: 'en-australian', direction: '23. Light conversational humour at first, quick but intelligible. The tax letters slow him down. Keep hope in the car story.' },
  hanh: { vi: 'vi-central', en: 'en-vietnamese', direction: '54. Welcoming, practical, gently protective of her daughter. Low effort and unhurried. Pain is contained; never perform a frail caricature.' },
  tram: { vi: 'vi-south', en: 'en-american', direction: '20. Quiet, alert, still interested in photography. Boundaries are firm. Do not dramatise the harassment or perform the manager as a separate threatening voice.' },
  duc: { vi: 'vi-north', en: 'en-vietnamese', direction: '41. Measured, slightly distracted by fixing a bicycle. Uncertainty sits in pauses. The final bell brings a little warmth back.' },
  khoa: { vi: 'vi-central', en: 'en-australian', direction: '33. Thoughtful and grounded, with a dry smile about the lemon tree. Keep his confidence and dignity when recalling the accent criticism.' },
  mai: { vi: 'vi-north', en: 'en-american', direction: '29. Private, focused on sewing. Shorter breaths around the phone; steadier when setting her own limits. No sobbing or horror performance.' },
};

export function assignedVoice(character: string, language: Language): VoicePack | undefined {
  return characterVoices[character]?.[language];
}

// Device voices rarely offer regional Vietnamese, so only the English accents steer the choice.
const packLocales: Record<VoicePack, string[]> = {
  'vi-north': ['vi-VN'], 'vi-central': ['vi-VN'], 'vi-south': ['vi-VN'],
  'en-vietnamese': ['en-AU', 'en-GB', 'en-US'], 'en-australian': ['en-AU', 'en-GB', 'en-US'], 'en-american': ['en-US', 'en-AU', 'en-GB'],
};

/** Preferred fallback locales, used only when no matching MP3 exists and the visitor opts in. */
export function deviceVoiceLocales(character: string, language: Language): string[] {
  const pack = assignedVoice(character, language);
  return pack ? packLocales[pack] : [language === 'vi' ? 'vi-VN' : 'en-AU'];
}
