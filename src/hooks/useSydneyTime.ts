import { useEffect, useState } from 'react';
import type { Language } from '../types';

function format(language: Language) {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-AU', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    hour12: language !== 'vi',
  }).format(new Date()).toUpperCase();
}

/** Live clock in Sydney time (AEST/AEDT), updated every 30 seconds. */
export function useSydneyTime(language: Language) {
  const [time, setTime] = useState(() => format(language));
  useEffect(() => {
    setTime(format(language));
    const id = window.setInterval(() => setTime(format(language)), 30000);
    return () => window.clearInterval(id);
  }, [language]);
  return time;
}
