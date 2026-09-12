import { useEffect, useState } from 'react';
import type { Language } from '../types';

// The street clock follows real Sydney time (AEST/AEDT), not a fixed caption.
function format(language: Language, date = new Date()): string {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-AU', {
    timeZone: 'Australia/Sydney',
    hour: language === 'vi' ? '2-digit' : 'numeric',
    minute: '2-digit',
    hour12: language !== 'vi',
  }).format(date).toUpperCase();
}

export function useSydneyTime(language: Language): string {
  const [time, setTime] = useState(() => format(language));
  useEffect(() => {
    setTime(format(language));
    const id = setInterval(() => setTime(format(language)), 15000);
    return () => clearInterval(id);
  }, [language]);
  return time;
}
