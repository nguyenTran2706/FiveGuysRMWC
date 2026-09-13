export type Bilingual = { en: string; vi: string };

export type Passage = {
  id: string;
  topic: string;
  score: number;
  title: Bilingual;
  text: Bilingual;
  source: { title: string; url: string };
};

export type Suggestion = { id: string; topic: string; starter: Bilingual; title: Bilingual };

export type Retrieval = { grounded: boolean; passages: Passage[]; suggestions: Suggestion[] };

export type KnowledgeBase = {
  version: string;
  source: string;
  checked: string;
  topics: { id: string; label: Bilingual }[];
  entries: {
    id: string;
    topic: string;
    keywords: string[];
    title: Bilingual;
    starter: Bilingual;
    text: Bilingual;
    source: { title: string; url: string };
  }[];
};

export const knowledgeBase: KnowledgeBase;
export const RELEVANCE_THRESHOLD: number;
export const MAX_PASSAGES: number;
export function scoreEntry(entry: KnowledgeBase['entries'][number], question: string): { score: number; strongHits: number };
export function retrieve(question: string, options?: { threshold?: number; limit?: number }): Retrieval;
export function suggestedStarters(orderedEntries?: KnowledgeBase['entries'], limit?: number): Suggestion[];
export function topicList(): { id: string; label: Bilingual; entries: string[] }[];
