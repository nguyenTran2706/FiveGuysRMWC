// Deterministic retrieval over the curated Fair Work knowledge base.
// Shared by the browser UI and the server endpoint so refusal behaviour is identical.
import { knowledgeBase } from '../data/fairworkRights.mjs';

export { knowledgeBase };

export const RELEVANCE_THRESHOLD = 0.4;
export const MAX_PASSAGES = 3;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'do', 'does', 'did', 'can', 'could',
  'should', 'would', 'will', 'shall', 'my', 'me', 'i', 'you', 'your', 'we', 'they', 'he', 'she', 'it', 'to', 'of',
  'in', 'on', 'at', 'for', 'with', 'from', 'about', 'what', 'how', 'when', 'where', 'why', 'who', 'much', 'many',
  'if', 'not', 'no', 'get', 'got', 'have', 'has', 'that', 'this', 'there', 'any', 'all', 'but', 'so', 'than', 'then',
  'la', 'là', 'co', 'có', 'không', 'khong', 'toi', 'tôi', 'của', 'cua', 'cho', 'va', 'và', 'thi', 'thì', 'nao', 'nào',
  'gi', 'gì', 'bao', 'nhieu', 'nhiêu', 'the', 'nhu', 'như', 'duoc', 'được', 'lam', 'làm', 'se', 'sẽ', 'phai', 'phải',
  'minh', 'mình', 'ban', 'bạn', 'khi', 'ma', 'mà', 'ai', 'sao',
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function haystacks(entry) {
  const strong = [entry.title.en, entry.title.vi, entry.starter.en, entry.starter.vi, ...entry.keywords, entry.topic]
    .join(' ')
    .toLowerCase();
  const body = `${entry.text.en} ${entry.text.vi}`.toLowerCase();
  return { strong, body };
}

function hasToken(haystack, token) {
  if (token.length >= 4) return haystack.includes(token);
  return new RegExp(`(^|[^\\p{L}\\p{N}])${token}([^\\p{L}\\p{N}]|$)`, 'u').test(haystack);
}

/** Score one entry against a question. 1 = every meaningful word matched a keyword or title. */
export function scoreEntry(entry, question) {
  const tokens = [...new Set(tokenize(question))];
  if (!tokens.length) return { score: 0, strongHits: 0 };
  const { strong, body } = haystacks(entry);
  let matched = 0;
  let strongHits = 0;
  for (const token of tokens) {
    if (hasToken(strong, token)) { matched += 1; strongHits += 1; }
    else if (hasToken(body, token)) matched += 0.6;
  }
  return { score: matched / tokens.length, strongHits };
}

/**
 * Retrieve grounding passages for a question.
 * Returns { grounded, passages, suggestions } — grounded === false means the answer
 * must be a refusal, never model prose.
 */
export function retrieve(question, { threshold = RELEVANCE_THRESHOLD, limit = MAX_PASSAGES } = {}) {
  const ranked = knowledgeBase.entries
    .map(entry => ({ entry, ...scoreEntry(entry, question) }))
    .sort((a, b) => b.score - a.score);
  const relevant = ranked.filter(item => item.score >= threshold && item.strongHits > 0).slice(0, limit);
  return {
    grounded: relevant.length > 0,
    passages: relevant.map(item => ({
      id: item.entry.id,
      topic: item.entry.topic,
      score: Number(item.score.toFixed(3)),
      title: item.entry.title,
      text: item.entry.text,
      source: item.entry.source,
    })),
    suggestions: suggestedStarters(ranked.map(item => item.entry)),
  };
}

/** Closest covered topics to offer when a question falls outside the knowledge base. */
export function suggestedStarters(orderedEntries = knowledgeBase.entries, limit = 4) {
  const seen = new Set();
  const picks = [];
  for (const entry of orderedEntries) {
    if (seen.has(entry.topic)) continue;
    seen.add(entry.topic);
    picks.push({ id: entry.id, topic: entry.topic, starter: entry.starter, title: entry.title });
    if (picks.length === limit) break;
  }
  return picks;
}

export function topicList() {
  return knowledgeBase.topics.map(topic => ({
    ...topic,
    entries: knowledgeBase.entries.filter(entry => entry.topic === topic.id).map(entry => entry.id),
  }));
}
