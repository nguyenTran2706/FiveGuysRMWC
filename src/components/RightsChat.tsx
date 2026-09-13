import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import type { Language } from '../types';
import { chatCopy } from '../data/chatCopy';
import { knowledgeBase, suggestedStarters } from '../lib/retrieval.mjs';
import type { Suggestion } from '../lib/retrieval.mjs';
import './RightsChat.css';

type Turn = {
  question: string;
  answer?: string;
  grounded?: boolean;
  sources?: { title: string; url: string }[];
  suggestions?: Suggestion[];
  pending?: boolean;
  error?: 'key' | 'general';
};

export default function RightsChat({ language }: { language: Language }) {
  const t = chatCopy[language];
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const starters = useMemo(() => suggestedStarters(knowledgeBase.entries, 4), []);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setQuestion('');
    setBusy(true);
    setTurns(current => [...current, { question: trimmed, pending: true }]);
    let result: Turn;
    try {
      const response = await fetch('/api/rights-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: trimmed, language }),
      });
      const data = await response.json();
      result = response.ok
        ? { question: trimmed, answer: data.answer, grounded: data.grounded, sources: data.sources, suggestions: data.suggestions }
        : { question: trimmed, error: data.error === 'missing_api_key' ? 'key' : 'general' };
    } catch {
      result = { question: trimmed, error: 'general' };
    }
    setTurns(current => [...current.slice(0, -1), result]);
    setBusy(false);
    inputRef.current?.focus();
  }

  return <section className="chat-page">
    <div className="chat-head">
      <span className="eyebrow">{t.eyebrow}</span>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </div>

    <div className="chat-coverage">
      <span className="eyebrow">{t.coverage}</span>
      <div className="chat-chips">{knowledgeBase.topics.map(topic => <span className="chat-chip" key={topic.id}>{topic.label[language]}</span>)}</div>
      <span className="eyebrow">{t.starters}</span>
      <div className="chat-starters">{starters.map(item => <button className="chat-starter" key={item.id} onClick={() => ask(item.starter[language])}><Sparkles size={15} />{item.starter[language]}</button>)}</div>
    </div>

    <div className="chat-log" aria-live="polite">
      {!turns.length && <p className="chat-empty">{t.empty}</p>}
      {turns.map((turn, index) => <div key={index}>
        <div className="chat-turn chat-user"><span className="chat-role"><MessageCircle size={13} />{t.you}</span><p className="chat-answer">{turn.question}</p></div>
        <div className={`chat-turn ${turn.grounded === false ? 'chat-refusal' : ''}`} style={{ marginTop: 10 }}>
          <span className="chat-role"><ShieldCheck size={13} />{t.assistant}</span>
          <p className="chat-answer">{turn.pending ? t.thinking : turn.error ? (turn.error === 'key' ? t.errorKey : t.errorGeneral) : turn.answer}</p>
          {!!turn.sources?.length && <div className="chat-sources"><span>{t.sources}</span>{turn.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ExternalLink size={11} /></a>)}</div>}
          {!!turn.suggestions?.length && <div className="chat-starters" style={{ marginTop: 14 }}>
            <span className="eyebrow" style={{ gridColumn: '1 / -1' }}>{t.suggestions}</span>
            {turn.suggestions.map(item => <button className="chat-starter" key={item.id} onClick={() => ask(item.starter[language])}><Sparkles size={15} />{item.starter[language]}</button>)}
          </div>}
        </div>
      </div>)}
    </div>

    <form className="chat-form" onSubmit={event => { event.preventDefault(); ask(question); }}>
      <label className="sr-only" htmlFor="chat-question">{t.placeholder}</label>
      <textarea id="chat-question" ref={inputRef} value={question} maxLength={600} rows={2} placeholder={t.placeholder}
        onChange={event => setQuestion(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(question); } }} />
      <button className="button button-amber" type="submit" disabled={busy || !question.trim()}>{t.send}<ArrowRight size={17} /></button>
    </form>

    <div className="chat-footnote">
      <span className="chat-checked">{t.checked.replace('{date}', knowledgeBase.checked)}</span>
      <a href="https://www.fairwork.gov.au/find-help-for/visa-holders-migrants" target="_blank" rel="noopener noreferrer">{t.fairwork}</a>
      <a href="tel:1300513107">{t.rmwc}</a>
    </div>
    <p className="legal-disclaimer">{t.disclaimer} {t.privacyNote}</p>
  </section>;
}
