import { ArrowRight, FileCheck2 } from 'lucide-react';
import type { Language, Resident } from '../types';
import type { Copy } from '../data/copy';
import { residentLessons } from '../data/feedback';
import { TrustMeter, getTrustLevel } from './TrustMeter';

interface Props {
  t: Copy;
  language: Language;
  resident: Resident;
  trust: number;
  kept: boolean;
  status: 'playing' | 'heard' | 'closed';
  heardCount: number;
  unlocked: boolean;
  onContinue: () => void;
}

/**
 * End-of-story debrief: how your choices moved the conversation, what
 * evidence was kept, what the story was really about, and how close the
 * three-heard-stories unlock is.
 */
export function Debrief({ t, language, resident, trust, kept, status, heardCount, unlocked, onContinue }: Props) {
  const level = getTrustLevel(trust);
  const lesson = residentLessons[resident.id];
  return <div className="reflection-panel debrief-panel">
    <span className="eyebrow">{t.debriefEyebrow} <span>· {resident.name}</span></span>
    <h2>{t.debriefTitle}</h2>
    <div className="debrief-section">
      <h3>{t.debriefTrustHeading}</h3>
      <div className="debrief-trust-row">
        <TrustMeter t={t} trust={trust} />
        <p>{status === 'closed' ? t.debriefTrustClosed : t.debriefTrustLine.replace('{level}', t.trustStates[level])}</p>
      </div>
    </div>
    <div className="debrief-section">
      <h3>{t.debriefEvidenceHeading}</h3>
      <div className="debrief-evidence">
        <FileCheck2 size={17} />
        <p>{kept ? t.debriefEvidenceKept.replace('{name}', resident.name) : t.debriefEvidenceMissed.replace('{name}', resident.name)}</p>
      </div>
    </div>
    <div className="debrief-section">
      <h3>{t.debriefLessonHeading}</h3>
      <p>{lesson?.[language]}</p>
    </div>
    <div className="debrief-section">
      <h3>{t.debriefProgressHeading}</h3>
      <p>{unlocked ? t.debriefProgressDone.replace('{count}', String(heardCount)) : t.debriefProgress.replace('{count}', String(heardCount))}</p>
      <div className="debrief-progress-dots">{[0, 1, 2].map(dot => <i key={dot} className={heardCount > dot ? 'on' : ''} />)}</div>
    </div>
    <div className="debrief-actions">
      <button className="button button-amber" onClick={onContinue}>{t.debriefContinue}<ArrowRight size={18} /></button>
    </div>
  </div>;
}
