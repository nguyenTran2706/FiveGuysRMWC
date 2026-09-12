import { useEffect, useRef } from 'react';

export function useAmbient(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let context: AudioContext;
    try {
      context = new AudioContext();
      contextRef.current = context;
      const length = context.sampleRate * 4;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        samples[i] = last * 3.5;
      }
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 1800;
      const gain = context.createGain(); gain.gain.value = 0.25;
      source.connect(filter).connect(gain).connect(context.destination);
      source.start();
      void context.resume().catch(() => {});
      return () => { source.stop(); void context.close().catch(() => {}); contextRef.current = null; };
    } catch { return; }
  }, [enabled]);
}
