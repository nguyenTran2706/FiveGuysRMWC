import { useEffect, useState } from 'react';
import type { Language } from '../types';
import { formatAestTime } from './aestTime';

export function useSydneyTime(language: Language): string {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return formatAestTime(language, date);
}
