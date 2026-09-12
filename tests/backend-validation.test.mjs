import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCaseFile, ValidationError } from '../supabase/functions/submit-case/validation.ts';

const now = new Date('2026-09-12T04:00:00.000Z');
function fixture() {
  return {
    id: 'RMWC-LOCAL', createdAt: now.toISOString(), language: 'vi', source: 'street', status: 'draft',
    profile: {}, flags: [], detail: {}, narrative: { vi: '', en: '' }, evidenceHeld: {},
    readiness: 'information_only', contactSafety: {},
    consent: { shareWithRMWC: true, storeAnonymisedStats: false, timestampISO: now.toISOString() },
  };
}

test('all personal questions can be skipped while consent is mandatory', () => {
  const result = validateCaseFile(fixture(), now);
  assert.deepEqual(result.profile, {});
  assert.deepEqual(result.narrative, { vi: '', en: '' });
  const withoutConsent = fixture();
  withoutConsent.consent.shareWithRMWC = false;
  assert.throws(() => validateCaseFile(withoutConsent, now), /Sharing consent/);
});

test('visitor cannot forge workflow metadata or a named caseworker', () => {
  const input = fixture();
  input.status = 'closed';
  input.assignment = { caseworkerId: 'forged', caseworkerName: 'Forged staff' };
  const result = validateCaseFile(input, now);
  for (const field of ['id', 'createdAt', 'status', 'assignment']) assert.equal(Object.hasOwn(result, field), false);
  assert.equal(input.assignment.caseworkerName, 'Forged staff', 'does not mutate the visitor draft');
});

test('retains negative safe-contact answers and optional contact fields', () => {
  const input = fixture();
  input.contactSafety = { preferredChannel: 'sms', safeToCall: false, safeToLeaveVoicemail: false, safeToEmail: false, notes: 'Shared phone' };
  input.contact = { phone: '0400000000' };
  input.emergencyContact = { name: 'Friend', mayWeContact: false };
  input.employer = { name: 'Optional company' };
  input.detail = { workplaceInjury: { reportedTo: 'Supervisor', pressuredNotToReport: true }, underpayment: { payslips: 'never', paidCash: true } };
  const result = validateCaseFile(input, now);
  assert.deepEqual(result.contactSafety, input.contactSafety);
  assert.equal(result.emergencyContact.mayWeContact, false);
  assert.deepEqual(result.detail, input.detail);
});

test('rejects malformed fields, unknown fields, oversized text and duplicate flags', () => {
  for (const mutate of [
    value => { value.contactSafety.safeToCall = 'false'; },
    value => { value.profile.visaSubclass = 'unverified'; },
    value => { value.profile.tenureMonths = -1; },
    value => { value.contact = { name: 'x'.repeat(201) }; },
    value => { value.secret = 'unexpected'; },
    value => { value.flags = [1]; },
    value => { value.flags = Array.from({ length: 2 }, () => ({ archetype: 'bullying', confidence: 'possible', signals: [] })); },
  ]) {
    const input = fixture(); mutate(input);
    assert.throws(() => validateCaseFile(input, now), ValidationError);
  }
});

test('requires fresh timestamped consent without disclosing personal input in errors', () => {
  for (const timestamp of ['', 'not-a-date', '2026-09-01T00:00:00Z', '2027-01-01T00:00:00Z']) {
    const input = fixture(); input.consent.timestampISO = timestamp;
    assert.throws(() => validateCaseFile(input, now), /confirm consent again/);
  }
  const input = fixture(); input.profile.tenureMonths = 'sensitive information';
  assert.throws(() => validateCaseFile(input, now), error => !error.message.includes('sensitive information'));
});
