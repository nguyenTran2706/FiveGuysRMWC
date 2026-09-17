import { clamp, rainMix } from './weather';
import { SPEAK_AFTER_CANCEL_MS, SPEECH_RATE, pickVoice, speechChunks, waitForVoices } from './deviceVoice';

/** 'no-voice': no recording, and the device has no speech voice for the line's language. */
export type VoiceState = 'idle' | 'loading' | 'playing' | 'ended' | 'missing' | 'no-voice' | 'blocked' | 'error';
export type RainState = 'off' | 'loading' | 'playing' | 'blocked' | 'error';
/** Where the current line's sound comes from, so the UI can say when a device voice is reading. */
export type VoiceSource = 'recording' | 'device' | null;
export type AudioState = { voice: VoiceState; rain: RainState; source: VoiceSource };
/** A story caption the device voice may read when no approved recording exists. */
export type SpeechLine = { cue: string; text: string; lang: 'vi' | 'en'; locales?: readonly string[] };
type WithSpeech = typeof globalThis & { speechSynthesis?: SpeechSynthesis; SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance };
type IOSNavigator = Navigator & { audioSession?: { type: string } };
/** Chrome can leave a line queued but silent after a recent cancel(); pause() + resume() restarts it. */
const SPEECH_STALL_MS = 1200;
/** Safari may neither start nor reject speech that lacks permission; treat silence this long as blocked. */
const SPEECH_START_TIMEOUT_MS = 6000;
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
  private deviceVoice = false;
  private speechPrimed = false;
  // Chrome can garbage-collect an utterance mid-line and never fire its end event, so keep a reference.
  private utterance: SpeechSynthesisUtterance | null = null;
  private speechTimer: ReturnType<typeof setTimeout> | undefined;
  private warned = new Set<string>();
  private state: AudioState = { voice: 'idle', rain: 'off', source: null };

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

  private warnOnce(key: string, message: string) {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn(message);
  }

  private synth(): SpeechSynthesis | null {
    const scope = globalThis as WithSpeech;
    return scope.speechSynthesis && typeof scope.SpeechSynthesisUtterance === 'function' ? scope.speechSynthesis : null;
  }

  private wake() {
    const context = this.ensureContext();
    // iOS reports 'interrupted' after a call or Siri; it resumes like 'suspended'.
    if (context.state === 'suspended' || (context.state as string) === 'interrupted') void context.resume().catch(() => {});
    return context;
  }

  /** Called directly during a click/key gesture, before async loading. */
  unlock() {
    try {
      // Without this, iPhones in silent mode mute Web Audio (Safari 16.4+).
      const session = typeof navigator === 'undefined' ? undefined : (navigator as IOSNavigator).audioSession;
      if (session && session.type !== 'playback') session.type = 'playback';
      this.wake();
    } catch { /* Playback reports unsupported audio when requested. */ }
    // iOS only allows speech after a speak() call made inside a user gesture.
    const synth = this.synth();
    if (synth && this.deviceVoice && !this.speechPrimed) {
      this.speechPrimed = true;
      try {
        const primer = new SpeechSynthesisUtterance(' ');
        primer.volume = 0;
        synth.speak(primer);
      } catch { /* Speaking reports its own state when requested. */ }
    }
  }

  private async load(src: string, context: AudioContext): Promise<AudioBuffer> {
    const cached = this.cache.get(src);
    if (cached) return cached;
    const controller = new AbortController();
    this.requests.add(controller);
    const timer = setTimeout(() => controller.abort(), 20000);
    const promise = (async () => {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) {
        console.warn(`[audio] ${src} returned HTTP ${response.status}. Check the file exists in public/ with the exact same letter case.`);
        throw new Error('Audio unavailable');
      }
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

  setDeviceVoice(enabled: boolean) {
    this.deviceVoice = enabled;
    if (!enabled && this.state.source === 'device') this.stopVoice();
  }

  stopVoice(nextState: VoiceState = 'idle') {
    ++this.voiceRevision;
    if (this.voiceSource) {
      this.voiceSource.onended = null;
      this.voiceSource.stop();
      this.voiceSource.disconnect();
      this.voiceSource = null;
    }
    clearTimeout(this.speechTimer);
    // Only cancel our own line: cancelling the iOS primer straight after speak() stalls Chrome's queue.
    if (this.utterance) this.synth()?.cancel();
    this.utterance = null;
    this.duck(false);
    this.publish({ voice: nextState, source: null });
  }

  /** Plays the approved recording; without one, the device voice reads `speech` if that is switched on. */
  async playVoice(src: string | null, speech?: SpeechLine | null) {
    if (!src && speech && this.deviceVoice) return this.speak(speech);
    this.stopVoice(src ? 'loading' : 'missing');
    if (!src) return;
    const revision = this.voiceRevision;
    try {
      const context = this.wake();
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
        this.publish({ voice: 'ended', source: null });
      };
      this.voiceSource = source;
      source.start();
      this.duck(true);
      this.publish({ voice: 'playing', source: 'recording' });
    } catch (error) {
      if (revision !== this.voiceRevision) return;
      console.warn(`[audio] Could not play ${src}:`, error);
      this.duck(false);
      this.publish({ voice: 'error' });
    }
  }

  private async speak(line: SpeechLine) {
    this.stopVoice('loading');
    const revision = this.voiceRevision;
    const synth = this.synth();
    if (!synth) {
      this.warnOnce('no-speech', '[audio] This browser has no speech synthesis, so lines without a recording stay text-only.');
      this.publish({ voice: 'no-voice' });
      return;
    }
    const voices = await waitForVoices(synth);
    if (revision !== this.voiceRevision) return;
    const voice = pickVoice(voices, line.lang, line.locales);
    if (!voice) {
      this.warnOnce(`no-voice-${line.lang}`, `[audio] No ${line.lang === 'vi' ? 'Vietnamese' : 'English'} voice on this device (${voices.length} voices found); ${line.cue} stays text-only.`);
      this.publish({ voice: 'no-voice' });
      return;
    }
    if (this.voiceVolume <= 0) { this.publish({ voice: 'idle' }); return; }
    this.warnOnce(`device-${line.cue}`, `[audio] No approved recording for ${line.cue}; reading it with the device voice "${voice.name}" (${voice.lang}).`);
    await new Promise(resolve => setTimeout(resolve, SPEAK_AFTER_CANCEL_MS));
    if (revision !== this.voiceRevision) return;
    if (synth.paused) synth.resume();
    const chunks = speechChunks(line.text);
    const nudge = typeof navigator === 'undefined' || !/android/i.test(navigator.userAgent); // Android treats pause() as stop.
    const watch = (utterance: SpeechSynthesisUtterance, chunkStarted: () => boolean) => {
      clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        if (revision !== this.voiceRevision || this.utterance !== utterance || chunkStarted()) return;
        if (nudge) { synth.pause(); synth.resume(); }
        this.speechTimer = setTimeout(() => {
          if (revision !== this.voiceRevision || this.utterance !== utterance || chunkStarted()) return;
          console.warn(`[audio] The device voice did not start for ${line.cue}; waiting for a tap on Listen.`);
          this.stopVoice('blocked');
        }, SPEECH_START_TIMEOUT_MS - SPEECH_STALL_MS);
      }, SPEECH_STALL_MS);
    };
    const next = (index: number) => {
      if (revision !== this.voiceRevision) return;
      if (index >= chunks.length) {
        clearTimeout(this.speechTimer);
        this.utterance = null;
        this.duck(false);
        this.publish({ voice: 'ended', source: null });
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = SPEECH_RATE;
      utterance.volume = this.voiceVolume;
      let chunkStarted = false;
      const begin = () => { chunkStarted = true; clearTimeout(this.speechTimer); };
      utterance.onstart = begin;
      utterance.onend = () => { begin(); next(index + 1); };
      utterance.onerror = event => {
        if (revision !== this.voiceRevision || event.error === 'interrupted' || event.error === 'canceled') return;
        console.warn(`[audio] The device voice stopped (${event.error}) while reading ${line.cue}.`);
        this.stopVoice(event.error === 'not-allowed' ? 'blocked' : 'error');
      };
      this.utterance = utterance;
      synth.speak(utterance);
      watch(utterance, () => chunkStarted);
    };
    this.duck(true);
    this.publish({ voice: 'playing', source: 'device' });
    next(0);
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
      const context = this.wake();
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
      for (const result of results) if (result.status === 'rejected') console.warn('[audio] A rain layer could not load:', result.reason);
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
