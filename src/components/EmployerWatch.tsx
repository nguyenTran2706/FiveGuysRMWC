import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, LockKeyhole, Search } from 'lucide-react';
import type { Archetype, Language } from '../types';
import { archetypeLabels } from '../data/stories';
import { selfReportCategories } from '../data/selfReport';
import { watchCopy } from '../data/watchCopy';
import {
  clearReports, loadReports, normalizeEmployer, sampleReports, saveReport, searchSummaries, summarize,
  type EmployerReport,
} from '../data/employerReports';
import '../watch.css';

/**
 * An anonymous community board: workers log fixed pattern tags against a workplace so others can
 * check before taking a job there. Reports carry no free text and no dates, only a month.
 */
export default function EmployerWatch({ language, onBack }: { language: Language; onBack: () => void }) {
  const copy = watchCopy[language];
  const [own, setOwn] = useState<EmployerReport[]>(() => loadReports());
  const [query, setQuery] = useState('');
  const [employer, setEmployer] = useState('');
  const [suburb, setSuburb] = useState('');
  const [patterns, setPatterns] = useState<Archetype[]>([]);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const ownKeys = useMemo(() => new Set(own.map(report => normalizeEmployer(report.employer))), [own]);
  const summaries = useMemo(() => summarize([...sampleReports, ...own]), [own]);
  const results = useMemo(() => searchSummaries(summaries, query), [summaries, query]);

  function togglePattern(archetype: Archetype) {
    setPatterns(current => current.includes(archetype) ? current.filter(item => item !== archetype) : [...current, archetype]);
  }

  function submit() {
    if (!employer.trim()) { setMessage({ tone: 'error', text: copy.needName }); return; }
    if (!patterns.length) { setMessage({ tone: 'error', text: copy.needPattern }); return; }
    const month = new Date().toISOString().slice(0, 7);
    setOwn(saveReport({ employer: employer.trim().slice(0, 90), suburb: suburb.trim().slice(0, 60) || undefined, patterns, month }));
    setEmployer(''); setSuburb(''); setPatterns([]);
    setMessage({ tone: 'ok', text: copy.submitted });
  }

  return <section className="watch-page section-wrap">
    <button className="text-link watch-back" onClick={onBack}><ArrowLeft size={17} />{copy.back}</button>
    <div className="watch-heading">
      <span className="eyebrow">{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
    </div>

    <div className="watch-boundary">
      <LockKeyhole size={20} />
      <div>
        <h3>{copy.privacyTitle}</h3>
        <p>{copy.privacyBody}</p>
        <p className="watch-prototype">{copy.prototypeNote}</p>
      </div>
    </div>

    <div className="watch-columns">
      <div className="watch-board">
        <label className="watch-search">
          <Search size={17} />
          <input value={query} placeholder={copy.searchPlaceholder} aria-label={copy.searchLabel} onChange={event => setQuery(event.target.value)} />
        </label>
        <h2>{copy.resultsTitle}</h2>
        {!summaries.length && <p className="watch-empty">{copy.emptyBoard}</p>}
        {summaries.length > 0 && !results.length && <p className="watch-empty">{copy.noResults}</p>}
        <ul className="watch-list">
          {results.map(summary => <li className="watch-card" key={summary.employer}>
            <div className="watch-card-top">
              <div>
                <h3>{summary.employer}</h3>
                {summary.suburbs.length > 0 && <p className="watch-suburbs">{summary.suburbs.join(' · ')}</p>}
              </div>
              <span className="watch-badge">{ownKeys.has(normalizeEmployer(summary.employer)) ? copy.yoursBadge : copy.sampleBadge}</span>
            </div>
            <p className="watch-count">{copy.reportCount(summary.reportCount)}</p>
            <ul className="watch-patterns">
              {summary.patterns.map(pattern => <li key={pattern.archetype}>
                <span>{archetypeLabels[pattern.archetype][language]}</span>
                <small>{copy.patternCount(pattern.count)}</small>
              </li>)}
            </ul>
            <p className="watch-months">{copy.months}: {summary.months.join(', ')}</p>
            {summary.reportCount === 1 && <p className="watch-single"><AlertTriangle size={15} />{copy.onlyOne}</p>}
          </li>)}
        </ul>
        <div className="watch-rules">
          <h3>{copy.rulesTitle}</h3>
          <ul>{copy.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
        </div>
      </div>

      <div className="watch-form">
        <h2>{copy.addTitle}</h2>
        <p className="watch-form-note">{copy.addNote}</p>
        <label className="watch-field"><span>{copy.employerLabel}</span><input value={employer} placeholder={copy.employerPlaceholder} onChange={event => setEmployer(event.target.value)} /></label>
        <label className="watch-field"><span>{copy.suburbLabel}</span><input value={suburb} placeholder={copy.suburbPlaceholder} onChange={event => setSuburb(event.target.value)} /></label>
        <fieldset className="watch-patterns-picker">
          <legend>{copy.patternsLabel}</legend>
          {selfReportCategories.map(archetype => <button key={archetype} type="button" aria-pressed={patterns.includes(archetype)} className={patterns.includes(archetype) ? 'watch-tag watch-tag-on' : 'watch-tag'} onClick={() => togglePattern(archetype)}>
            {archetypeLabels[archetype][language]}{patterns.includes(archetype) && <Check size={15} />}
          </button>)}
        </fieldset>
        <button className="button button-amber" onClick={submit}>{copy.submit}</button>
        {message && <p className={message.tone === 'ok' ? 'watch-message watch-message-ok' : 'watch-message watch-message-error'} role="status">{message.text}</p>}
        {own.length > 0 && <button className="text-link watch-clear" onClick={() => { clearReports(); setOwn([]); setMessage(null); }}>{copy.clear}</button>}
      </div>
    </div>
  </section>;
}
