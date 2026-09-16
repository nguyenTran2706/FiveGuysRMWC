import { clamp, rainMix } from './weather';

export type VoiceState = 'idle' | 'loading' | 'playing' | 'ended' | 'missing' | 'blocked' | 'error';
export type RainState = 'off' | 'loading' | 'playing' | 'blocked' | 'error';
export type AudioState = { voice: VoiceState; rain: RainState };
type Layer = keyof ReturnType<typeof rainMix>;
type Loop = { source: AudioBufferSourceNode; gain: GainNode; filter?: BiquadFilterNode };
const rainFiles: Record<Layer, string> = {
  calm: '/audio/ambience/rain-calm.mp3',
  heavy: '/audio/ambience/rain-heavy.mp3',
  thunder: '/audio/ambience/rain-thunder.mp3',
};

/** All sound has one owner, including pending requests and the volume duck. */
export class StoryAudio {
  private context: AudioContext | null = null;
  private voiceGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private voiceSource: AudioBufferSourceNode | null = null;
  private loops = new Map<Layer, Loop>();
  private cache = new Map<string, Promise<AudioBuffer>>();
  private requests = new Set<AbortController>();
  private listeners = new Set<(state: AudioState) => void>();
  private voiceRevision = 0;
  private rainRevision = 0;
  private voiceVolume = 0.85;
  private rainVolume = 0.45;
  private tension = 0.4;
  private adaptive = true;
  private state: AudioState = { voice: 'idle', rain: 'off' };

  subscribe(listener: (state: AudioState) => void) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => { this.listeners.delete(listener); };
  }

  private publish(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener({ ...this.state });
  }

  private ensureContext() {
    if (this.context && this.context.state !== 'closed') return this.context;
    const context = new AudioContext();
    this.context = context;
    this.voiceGain = context.createGain();
    this.voiceGain.gain.value = this.voiceVolume;
    this.voiceGain.connect(context.destination);
    this.rainGain = context.createGain();
    this.rainGain.gain.value = this.rainVolume;
    this.rainGain.connect(context.destination);
    return context;
  }

  /** Called directly during a click/key gesture, before async loading. */
  unlock() {
    try {
      const context = this.ensureContext();
      if (context.state === 'suspended') void context.resume().catch(() => {});
    } catch { /* Playback reports unsupported audio when requested. */ }
  }

  private async load(src: string, context: AudioContext): Promise<AudioBuffer> {
    const cached = this.cache.get(src);
    if (cached) return cached;
    const controller = new AbortController();
    this.requests.add(controller);
    const timer = setTimeout(() => controller.abort(), 20000);
    const promise = (async () => {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) throw new Error('Audio unavailable');
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 12_000_000) throw new Error('Audio too large');
      const buffer = await context.decodeAudioData(bytes);
      if (!Number.isFinite(buffer.duration) || buffer.duration <= 0 || buffer.duration > 180) throw new Error('Invalid audio duration');
      return buffer;
    })();
    this.cache.set(src, promise);
    // At most the current voice, immediate branches, and three rain recordings.
    while (this.cache.size > 8) this.cache.delete(this.cache.keys().next().value!);
    try { return await promise; }
    catch (error) { if (this.cache.get(src) === promise) this.cache.delete(src); throw error; }
    finally { clearTimeout(timer); this.requests.delete(controller); }
  }

  preload(sources: string[]) {
    if (!this.context) return;
    for (const src of sources.slice(0, 3)) void this.load(src, this.context).catch(() => {});
  }

  private ramp(param: AudioParam, value: number, seconds: number) {
    const time = this.context?.currentTime ?? 0;
    // Keep a continuous envelope when another choice arrives during a crossfade.
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(time);
    else { param.cancelScheduledValues(time); param.setValueAtTime(param.value, time); }
    param.linearRampToValueAtTime(value, time + seconds);
  }

  private duck(speaking: boolean) {
    if (this.rainGain) this.ramp(this.rainGain.gain, this.rainVolume * (speaking && this.voiceVolume > 0 ? 0.32 : 1), speaking ? 0.18 : 0.9);
  }

  setVolumes(voice: number, rain: number) {
    this.voiceVolume = clamp(voice);
    this.rainVolume = clamp(rain);
    if (this.voiceGain) this.ramp(this.voiceGain.gain, this.voiceVolume, 0.05);
    this.duck(this.state.voice === 'playing');
  }

  stopVoice(nextState: VoiceState = 'idle') {
    ++this.voiceRevision;
    if (this.voiceSource) {
      this.voiceSource.onended = null;
      this.voiceSource.stop();
      this.voiceSource.disconnect();
      this.voiceSource = null;
    }
    this.duck(false);
    this.publish({ voice: nextState });
  }

  async playVoice(src: string | null) {
    this.stopVoice(src ? 'loading' : 'missing');
    if (!src) return;
    const revision = this.voiceRevision;
    try {
      const context = this.ensureContext();
      this.unlock();
      const buffer = await this.load(src, context);
      if (revision !== this.voiceRevision || context !== this.context) return;
      if (context.state !== 'running') { this.publish({ voice: 'blocked' }); return; }
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.voiceGain!);
      source.onended = () => {
        if (revision !== this.voiceRevision) return;
        source.disconnect();
        this.voiceSource = null;
        this.duck(false);
        this.publish({ voice: 'ended' });
      };
      this.voiceSource = source;
      source.start();
      this.duck(true);
      this.publish({ voice: 'playing' });
    } catch {
      if (revision === this.voiceRevision) { this.duck(false); this.publish({ voice: 'error' }); }
    }
  }

  setWeather(tension: number, adaptive: boolean) {
    this.tension = clamp(tension);
    this.adaptive = adaptive;
    const mix = rainMix(this.tension, this.adaptive);
    for (const [key, loop] of this.loops) this.ramp(loop.gain.gain, mix[key], 5);
  }

  private seamless(buffer: AudioBuffer, context: AudioContext) {
    // Blend real tail/head samples across a 1.5 second seam. No synthetic noise.
    const fade = Math.min(Math.floor(context.sampleRate * 1.5), Math.floor(buffer.length / 4));
    const length = buffer.length - fade;
    const loop = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const input = buffer.getChannelData(channel);
      const output = loop.getChannelData(channel);
      output.set(input.subarray(fade));
      for (let i = 0; i < fade; i++) {
        const mix = i / fade;
        output[length - fade + i] = input[length + i] * (1 - mix) + input[i] * mix;
      }
    }
    return loop;
  }

  async startRain() {
    this.stopRain();
    const revision = this.rainRevision;
    this.publish({ rain: 'loading' });
    try {
      const context = this.ensureContext();
      this.unlock();
      const results = await Promise.allSettled((Object.entries(rainFiles) as [Layer, string][]).map(async ([key, src]) => {
        const buffer = await this.load(src, context);
        if (revision !== this.rainRevision || context !== this.context || context.state !== 'running') return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = this.seamless(buffer, context);
        source.loop = true;
        gain.gain.value = 0;
        source.connect(gain);
        let filter: BiquadFilterNode | undefined;
        if (key === 'thunder') {
          filter = context.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 900;
          gain.connect(filter).connect(this.rainGain!);
        } else gain.connect(this.rainGain!);
        this.loops.set(key, { source, gain, filter });
        source.start(0, key === 'heavy' ? source.buffer.duration * 0.37 : 0);
        this.ramp(gain.gain, rainMix(this.tension, this.adaptive)[key], 2);
      }));
      if (revision !== this.rainRevision) return;
      this.publish({ rain: context.state !== 'running' ? 'blocked' : results.some(result => result.status === 'rejected') ? 'error' : 'playing' });
    } catch { if (revision === this.rainRevision) this.publish({ rain: 'error' }); }
  }

  stopRain() {
    ++this.rainRevision;
    for (const { source, gain, filter } of this.loops.values()) { source.stop(); source.disconnect(); gain.disconnect(); filter?.disconnect(); }
    this.loops.clear();
    this.publish({ rain: 'off' });
  }

  stopAll() { this.stopVoice(); this.stopRain(); }

  dispose() {
    this.stopAll();
    for (const controller of this.requests) controller.abort();
    this.requests.clear();
    this.cache.clear();
    this.voiceGain?.disconnect();
    this.rainGain?.disconnect();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.voiceGain = null;
    this.rainGain = null;
  }
}
