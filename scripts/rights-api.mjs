// Local dev API. In production the same answers come from api/rights-chat.mjs on the host.
import { createServer } from 'node:http';
import { answerQuestion, callLocalModel } from '../src/lib/rightsAnswer.mjs';

const PORT = Number(process.env.PORT || 8787);
// Same rule as the hosted function: the model only rephrases passages, and only when one is configured.
const model = process.env.MODEL_URL ? callLocalModel : null;

function send(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
  response.end(payload);
}

createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') return send(response, 200, { ok: true });
  if (request.method !== 'POST' || request.url !== '/api/rights-chat') return send(response, 404, { error: 'not_found' });

  let body = '';
  request.on('data', chunk => {
    body += chunk;
    if (body.length > 8000) request.destroy();
  });
  request.on('end', async () => {
    try {
      const { question, language } = JSON.parse(body || '{}');
      if (typeof question !== 'string' || !question.trim()) return send(response, 400, { error: 'question_required' });
      send(response, 200, await answerQuestion(question.trim().slice(0, 600), language, model));
    } catch (error) {
      const reason = error?.message === 'model_loading' ? 'model_loading' : 'model_unavailable';
      send(response, reason === 'model_loading' ? 503 : 502, { error: reason });
    }
  });
}).listen(PORT, '0.0.0.0', () => console.log(`rights-chat api on ${PORT} — ${model ? `model at ${process.env.MODEL_URL}` : 'curated Fair Work passages only (set MODEL_URL to add a local model)'}`));
