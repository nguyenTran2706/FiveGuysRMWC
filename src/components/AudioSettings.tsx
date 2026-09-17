import type { Language } from '../types';
import { audioCopy } from '../data/audioCopy';
import './AudioSettings.css';

type Props = {
  language: Language;
  autoplay: boolean; onAutoplay: (value: boolean) => void;
  adaptive: boolean; onAdaptive: (value: boolean) => void;
  deviceVoice: boolean; onDeviceVoice: (value: boolean) => void;
  voiceVolume: number; onVoiceVolume: (value: number) => void;
  rainVolume: number; onRainVolume: (value: number) => void;
};

export function AudioSettings(props: Props) {
  const t = audioCopy[props.language];
  return <div className="audio-settings">
    {([
      [t.autoplay, props.autoplay, props.onAutoplay],
      [t.deviceVoice, props.deviceVoice, props.onDeviceVoice],
      [t.adaptive, props.adaptive, props.onAdaptive],
    ] as const).map(([label, value, change]) => <div className="setting-row" key={label}>
      <span>{label}</span><button className={`switch ${value ? 'on' : ''}`} role="switch" aria-checked={value} aria-label={label} onClick={() => change(!value)}><i /></button>
    </div>)}
    {([
      ['voice-volume', t.voiceVolume, props.voiceVolume, props.onVoiceVolume],
      ['rain-volume', t.rainVolume, props.rainVolume, props.onRainVolume],
    ] as const).map(([id, label, value, change]) => <div className="audio-volume" key={id}>
      <label htmlFor={id}>{label} <output htmlFor={id}>{Math.round(value * 100)}%</output></label>
      <input id={id} type="range" min="0" max="100" step="1" value={Math.round(value * 100)} onChange={event => change(Number(event.target.value) / 100)} />
    </div>)}
    <p className="modal-note">{t.note}</p>
  </div>;
}
