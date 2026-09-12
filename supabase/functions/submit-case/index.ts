import { validateCaseFile, ValidationError } from './validation.ts';

// Public intake endpoint. There is deliberately no browser database client.
// Deploy only behind the approved gateway's durable rate limit / abuse protection.
const MAX_BYTES = 65536;
const origins = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim()).filter(Boolean);

async function readBody(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) throw new ValidationError('Submission is too large.');
  if (!request.body) throw new ValidationError('Missing submission.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_BYTES) { await reader.cancel(); throw new ValidationError('Submission is too large.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new ValidationError('Invalid submission format.'); }
}

Deno.serve(async request => {
  const origin = request.headers.get('origin') ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff',
  };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (!origins.length || !origins.includes(origin)) return reply(403, { error: 'Origin is not allowed.' });
  headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'content-type';
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (Deno.env.get('SUBMISSIONS_ENABLED') !== 'true' || !supabaseUrl || !serviceKey) return reply(503, { error: 'Online sending is not configured. Please use the RMWC clinic enquiry form.' });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, { error: 'Use JSON.' });
  try {
    const data = validateCaseFile(await readBody(request));
    const result = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_case_internal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      body: JSON.stringify({ p_document: data }), signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) return reply(503, { error: 'Sending could not be confirmed. Please contact RMWC before sending again.' });
    return reply(201, await result.json());
  } catch (error) {
    if (error instanceof ValidationError) return reply(400, { error: error.message });
    // No case text, contacts, identifiers or exception payloads are logged.
    return reply(503, { error: 'Sending could not be confirmed. Please contact RMWC before sending again.' });
  }
});
