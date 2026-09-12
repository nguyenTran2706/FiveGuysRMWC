import type { Language } from '../types';

const AEST_OFFSET_MS = 10 * 60 * 60 * 1000;
const formatters = {
  en: new Intl.DateTimeFormat('en-AU', {
    timeZone: 'UTC', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }),
  vi: new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }),
};

/** AEST is always UTC+10, including when Sydney observes daylight saving. */
export function formatAestTime(language: Language, date = new Date()): string {
  const easternStandardDate = new Date(date.getTime() + AEST_OFFSET_MS);
  return `${formatters[language].format(easternStandardDate).toUpperCase()} AEST`;
}
