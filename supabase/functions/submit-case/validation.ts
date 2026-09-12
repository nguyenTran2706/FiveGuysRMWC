// Keep in step with src/types.ts. These validators do not infer legal conclusions.
type Rule = { kind: 'text'; max: number } | { kind: 'bool' } | { kind: 'number'; max: number }
  | { kind: 'enum'; values: readonly string[] } | { kind: 'object'; fields: Record<string, Rule>; required?: string[] }
  | { kind: 'array'; item: Rule; max: number };
const text = (max = 2000): Rule => ({ kind: 'text', max });
const bool: Rule = { kind: 'bool' };
const one = (...values: string[]): Rule => ({ kind: 'enum', values });
const obj = (fields: Record<string, Rule>, required: string[] = []): Rule => ({ kind: 'object', fields, required });
const list = (item: Rule, max = 20): Rule => ({ kind: 'array', item, max });
export const archetypes = ['underpayment', 'unfair_dismissal', 'sham_contracting', 'workplace_injury', 'discrimination', 'sexual_harassment', 'bullying'] as const;
const visa = one('500', '482', '485', '417', '462', 'PALM', 'bridging', 'PR', 'citizen', 'other', 'prefer_not_say');
const rule = obj({
  id: text(100), createdAt: text(50), language: one('vi', 'en'), source: one('street', 'agent'),
  status: one('draft', 'submitted', 'assigned', 'contacted', 'closed'),
  profile: obj({ visaSubclass: visa, industry: text(100), role: text(200), tenureMonths: { kind: 'number', max: 1200 }, stillEmployed: bool, employerSizeUnder15: bool, suburb: text(100), ageBand: text(100) }),
  flags: list(obj({ archetype: one(...archetypes), confidence: one('strong', 'possible'), signals: list(text(1000), 16), sourceNpc: text(100) }, ['archetype', 'confidence', 'signals']), 7),
  detail: obj({
    underpayment: obj({ rateOrCashPerShift: text(), paidCash: bool, payslips: one('always', 'sometimes', 'never'), hoursBand: text(100), unpaidTrial: bool, unpaidTimeAroundShift: bool, deductions: list(text(300)), superPaid: one('yes', 'no', 'unknown'), penaltyRates: one('yes', 'no', 'unknown') }),
    shamContracting: obj({ toldToGetABN: bool, whoSetsHours: text(), ownTools: bool, canSendSubstitute: bool, invoices: bool, worksForOthers: bool }),
    workplaceInjury: obj({ what: text(), whenISO: text(100), reportedTo: text(), sawDoctor: bool, workersCompLodged: bool, paidWhileOff: bool, pressuredNotToReport: bool, hoursCutSince: bool }),
    dismissal: obj({ howItEnded: one('told_to_go', 'hours_cut_to_zero', 'forced_resign', 'other'), reasonGiven: text(), inWriting: bool, whatHappenedBefore: text() }),
    discrimination: obj({ attribute: text(), whatChanged: text(), othersTreatedDifferently: bool }),
    harassment: obj({ whatHappened: text(), byWhom: one('employer', 'coworker', 'customer', 'other'), ongoing: bool, witnesses: bool, reportedToAnyone: bool }),
    bullying: obj({ behaviour: text(), repeated: bool, byWhom: text(), witnesses: bool }),
  }),
  narrative: obj({ vi: text(12000), en: text(12000) }, ['vi', 'en']),
  evidenceHeld: obj({ payslips: bool, rosters: bool, bankStatements: bool, messagesFromEmployer: bool, photos: bool, witnessNames: bool, contract: bool, notes: text() }),
  othersAffected: bool, readiness: one('ready_now', 'not_yet', 'information_only'),
  contactSafety: obj({ preferredChannel: one('phone', 'sms', 'email', 'zalo', 'messenger'), safeToCall: bool, safeToLeaveVoicemail: bool, safeToEmail: bool, bestTimeOfDay: text(300), notes: text() }),
  emergencyContact: obj({ name: text(200), relationship: text(200), phone: text(100), mayWeContact: bool, language: one('vi', 'en', 'other') }),
  contact: obj({ name: text(200), phone: text(100), email: text(320) }),
  employer: obj({ name: text(300), address: text(500) }),
  consent: obj({ shareWithRMWC: bool, storeAnonymisedStats: bool, timestampISO: text(50) }, ['shareWithRMWC', 'storeAnonymisedStats', 'timestampISO']),
  assignment: obj({ caseworkerId: text(100), caseworkerName: text(200), assignedAtISO: text(50) }),
}, ['language', 'source', 'profile', 'flags', 'detail', 'narrative', 'evidenceHeld', 'readiness', 'contactSafety', 'consent']);

export class ValidationError extends Error {}
function check(value: unknown, schema: Rule, path: string): unknown {
  const bad = () => { throw new ValidationError(`Invalid field: ${path}`); };
  if (schema.kind === 'text') {
    if (typeof value !== 'string' || value.length > schema.max || value.includes('\u0000')) return bad();
    return value;
  }
  if (schema.kind === 'bool') return typeof value === 'boolean' ? value : bad();
  if (schema.kind === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= schema.max ? value : bad();
  if (schema.kind === 'enum') return typeof value === 'string' && schema.values.includes(value) ? value : bad();
  if (schema.kind === 'array') {
    if (!Array.isArray(value) || value.length > schema.max) return bad();
    return value.map((entry, i) => check(entry, schema.item, `${path}[${i}]`));
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return bad();
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !Object.hasOwn(schema.fields, key))) return bad();
  for (const required of schema.required ?? []) if (!Object.hasOwn(input, required)) return bad();
  const output: Record<string, unknown> = {};
  for (const [key, fieldRule] of Object.entries(schema.fields)) if (Object.hasOwn(input, key)) output[key] = check(input[key], fieldRule, `${path}.${key}`);
  return output;
}

export function validateCaseFile(input: unknown, now = new Date()) {
  const data = check(input, rule, 'caseFile') as Record<string, unknown>;
  const consent = data.consent as { shareWithRMWC: boolean; storeAnonymisedStats: boolean; timestampISO: string };
  if (consent.shareWithRMWC !== true) throw new ValidationError('Sharing consent is required to send.');
  const consentTime = Date.parse(consent.timestampISO);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(consent.timestampISO) || !Number.isFinite(consentTime) || consentTime > now.getTime() + 300000 || consentTime < now.getTime() - 86400000) {
    throw new ValidationError('Please review and confirm consent again.');
  }
  const flags = data.flags as Array<{ archetype: string }>;
  if (new Set(flags.map(flag => flag.archetype)).size !== flags.length) throw new ValidationError('Duplicate archetype flags.');
  // Identity, timestamps, assignment and workflow status are exclusively server-controlled.
  delete data.id; delete data.createdAt; delete data.status; delete data.assignment;
  return data;
}
