import { useEffect, useState } from 'react';
import { StoryAudio, type AudioState } from '../lib/storyAudio';

type Options = {
  cue: string; src: string | null; active: boolean; autoplay: boolean; preloads: string[];
  rain: boolean; tension: number; adaptive: boolean; voiceVolume: number; rainVolume: number;
};

export function useStoryAudio(options: Options) {
  const [engine] = useState(() => new StoryAudio());
  const [state, setState] = useState<AudioState>({ voice: 'idle', rain: 'off' });
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    const visibility = () => { if (document.hidden) engine.stopAll(); setVisible(!document.hidden); };
    const pagehide = () => engine.stopAll();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    return () => { unsubscribe(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pagehide); engine.dispose(); };
  }, [engine]);
  useEffect(() => { engine.setVolumes(options.voiceVolume, options.rainVolume); }, [engine, options.voiceVolume, options.rainVolume]);
  useEffect(() => { engine.setWeather(options.tension, options.adaptive); }, [engine, options.tension, options.adaptive]);
  useEffect(() => {
    if (options.active && options.autoplay && visible) void engine.playVoice(options.src);
    else engine.stopVoice();
    return () => engine.stopVoice();
  }, [engine, options.cue, options.src, options.active, options.autoplay, visible]);
  useEffect(() => {
    if (options.rain && visible) void engine.startRain();
    else engine.stopRain();
    return () => engine.stopRain();
  }, [engine, options.rain, visible]);
  const preloadKey = options.preloads.join('|');
  useEffect(() => {
    if (options.active && options.autoplay && visible) engine.preload(preloadKey.split('|').filter(Boolean));
  }, [engine, options.active, options.autoplay, visible, preloadKey]);
  return { engine, ...state };
}
