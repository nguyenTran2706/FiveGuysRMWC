// Hosted answer endpoint (Vercel serverless function at POST /api/rights-chat).
// Answers come from the curated Fair Work knowledge base in this repo: retrieval and refusals are
// deterministic, so no database, API key or external AI service is involved. If MODEL_URL points at a
// self-hosted llama.cpp server, that model only rephrases the passages retrieval already selected;
// without it, the curated bilingual passage is returned as written.
import { answerQuestion, callLocalModel } from '../src/lib/rightsAnswer.mjs';

const MAX_QUESTION_LENGTH = 600;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body ?? {};
    const { question, language } = body;
    if (typeof question !== 'string' || !question.trim()) return response.status(400).json({ error: 'question_required' });
    const model = process.env.MODEL_URL ? callLocalModel : null;
    return response.status(200).json(await answerQuestion(question.trim().slice(0, MAX_QUESTION_LENGTH), language, model));
  } catch (error) {
    // Questions are never logged: only the failure reason.
    const reason = error?.message === 'model_loading' ? 'model_loading' : 'model_unavailable';
    return response.status(reason === 'model_loading' ? 503 : 502).json({ error: reason });
  }
}
