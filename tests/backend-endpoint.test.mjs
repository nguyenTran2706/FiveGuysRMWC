import test from 'node:test';
import assert from 'node:assert/strict';

let handler;
const environment = new Map([['ALLOWED_ORIGINS', 'https://approved.example'], ['SUBMISSIONS_ENABLED', 'false']]);
globalThis.Deno = { env: { get: name => environment.get(name) }, serve: fn => { handler = fn; } };
await import('../supabase/functions/submit-case/index.ts');
const originalFetch = globalThis.fetch;
const request = (body, origin = 'https://approved.example') => new Request('https://backend.example/submit-case', {
  method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
});
const fixture = () => ({
  language: 'en', source: 'agent', profile: {}, flags: [], detail: {}, narrative: { vi: '', en: '' },
  evidenceHeld: {}, readiness: 'information_only', contactSafety: {},
  consent: { shareWithRMWC: true, storeAnonymisedStats: false, timestampISO: new Date().toISOString() },
});

test('endpoint fails closed for wrong origin, missing configuration, and absent consent', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Unexpected network'); };
  try {
    assert.equal((await handler(request(fixture(), 'https://unapproved.example'))).status, 403);
    assert.equal((await handler(request(fixture()))).status, 503);
    environment.set('SUBMISSIONS_ENABLED', 'true');
    environment.set('SUPABASE_URL', 'https://database.example');
    environment.set('SUPABASE_SERVICE_ROLE_KEY', 'unit-test-only-placeholder');
    const input = fixture(); input.consent.shareWithRMWC = false;
    assert.equal((await handler(request(input))).status, 400);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('endpoint passes consented, normalized document only to private RPC and returns its receipt', async () => {
  const receipt = { reference: 'RMWC-SERVER', status: 'submitted' };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://database.example/rest/v1/rpc/submit_case_internal');
    const body = JSON.parse(options.body);
    assert.equal(body.p_document.consent.shareWithRMWC, true);
    assert.equal(body.p_document.id, undefined);
    assert.equal(options.headers.apikey, 'unit-test-only-placeholder');
    return Response.json(receipt);
  };
  try {
    const input = fixture(); input.id = 'local';
    const response = await handler(request(input));
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://approved.example');
    assert.deepEqual(await response.json(), receipt);
  } finally { globalThis.fetch = originalFetch; }
});

test('rejects oversized request before a database call', async () => {
  globalThis.fetch = async () => { throw new Error('Unexpected network'); };
  try {
    const input = fixture(); input.narrative.en = 'x'.repeat(70000);
    assert.equal((await handler(request(input))).status, 400);
  } finally { globalThis.fetch = originalFetch; }
});
