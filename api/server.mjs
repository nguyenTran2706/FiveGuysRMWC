// Minimal dev API that keeps the model API key out of the browser.
import { createServer } from 'node:http';
import { answerQuestion } from './rightsChat.mjs';

const PORT = Number(process.env.PORT || 8787);

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
      send(response, 200, await answerQuestion(question.trim().slice(0, 600), language));
    } catch (error) {
      const reason = error?.message === 'missing_api_key' ? 'missing_api_key' : 'model_unavailable';
      send(response, reason === 'missing_api_key' ? 503 : 502, { error: reason });
    }
  });
}).listen(PORT, '0.0.0.0', () => console.log(`rights-chat api on ${PORT}`));
