import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAestTime } from '../src/hooks/aestTime.ts';

test('live AEST stays UTC+10 in both summer and winter', () => {
  for (const date of ['2026-01-15T12:42:07Z', '2026-07-15T12:42:07Z']) {
    assert.equal(formatAestTime('en', new Date(date)), '10:42:07 PM AEST');
    assert.equal(formatAestTime('vi', new Date(date)), '22:42:07 AEST');
  }
});

test('AEST midnight uses 12 AM in English and 00 hours in Vietnamese', () => {
  const date = new Date('2026-12-31T14:00:00Z');
  assert.equal(formatAestTime('en', date), '12:00:00 AM AEST');
  assert.equal(formatAestTime('vi', date), '00:00:00 AEST');
  assert.equal(date.toISOString(), '2026-12-31T14:00:00.000Z');
});

test('AEST noon uses PM and preserves seconds', () => {
  const date = new Date('2026-09-13T02:00:59Z');
  assert.equal(formatAestTime('en', date), '12:00:59 PM AEST');
  assert.equal(formatAestTime('vi', date), '12:00:59 AEST');
});

test('AEST depends on the instant, not the source timestamp timezone', () => {
  const utc = new Date('2026-01-15T12:42:07Z');
  const sydneyDaylightTime = new Date('2026-01-15T23:42:07+11:00');
  assert.equal(formatAestTime('en', utc), formatAestTime('en', sydneyDaylightTime));
  assert.match(formatAestTime('en', utc), / AEST$/);
});
