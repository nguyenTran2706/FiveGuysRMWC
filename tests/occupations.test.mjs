import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

async function bundle(path) {
  const result = await build({ entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const { industries, occupations, occupationGroups, industryText, occupationText, workFreeText, matchesQuery, OTHER_CHOICE } = await bundle('../src/data/occupations.ts');
const { residents } = await bundle('../src/data/stories.ts');

const search = query => occupations.filter(item => matchesQuery(item.search, query)).map(item => item.key);

test('industries are the 19 ANZSIC divisions with stable keys and both languages', () => {
  assert.deepEqual(industries.map(item => item.label.en), [
    'Agriculture, Forestry and Fishing', 'Mining', 'Manufacturing', 'Electricity, Gas, Water and Waste Services', 'Construction',
    'Wholesale Trade', 'Retail Trade', 'Accommodation and Food Services', 'Transport, Postal and Warehousing',
    'Information Media and Telecommunications', 'Financial and Insurance Services', 'Rental, Hiring and Real Estate Services',
    'Professional, Scientific and Technical Services', 'Administrative and Support Services', 'Public Administration and Safety',
    'Education and Training', 'Health Care and Social Assistance', 'Arts and Recreation Services', 'Other Services',
  ]);
  assert.equal(industries.map(item => item.division).join(''), 'ABCDEFGHIJKLMNOPQRS');
  for (const item of industries) {
    assert.match(item.key, /^[a-z_]+$/);
    assert.ok(item.label.vi.trim() && item.key !== OTHER_CHOICE);
  }
});

test('80–120 jobs, unique keys, valid industries, bilingual labels, every division covered', () => {
  assert.ok(occupations.length >= 80 && occupations.length <= 120, `${occupations.length} jobs`);
  assert.equal(new Set(occupations.map(item => item.key)).size, occupations.length);
  const codes = new Set(industries.map(item => item.key));
  for (const item of occupations) {
    assert.match(item.key, /^[a-z_]+$/);
    assert.notEqual(item.key, OTHER_CHOICE);
    assert.ok(item.label.vi.trim() && item.label.en.trim(), item.key);
    for (const code of item.industries) assert.ok(codes.has(code), `${item.key}: ${code}`);
  }
  for (const code of codes) assert.ok(occupations.some(item => item.industries[0] === code), `no jobs for ${code}`);
});

test('every story character’s job can be found in Vietnamese and English', () => {
  for (const resident of residents) {
    assert.ok(search(resident.role.en).length, `${resident.id}: ${resident.role.en}`);
    assert.ok(search(resident.role.vi).length, `${resident.id}: ${resident.role.vi}`);
  }
  assert.ok(search('Nail technician').includes('nail_technician'));
  assert.ok(search('Delivery rider').includes('delivery_rider'));
  assert.ok(search('Phụ bếp').includes('kitchen_hand'));
  assert.ok(search('Waitress').includes('waiter'));
  assert.ok(search('Warehouse storeman').includes('warehouse_worker'));
  assert.ok(search('Nhân viên chăm sóc người cao tuổi').includes('aged_care_worker'));
  assert.ok(search('Commercial cleaner').includes('commercial_cleaner'));
});

test('search ignores accents and matches colloquial words', () => {
  assert.ok(search('phu bep').includes('kitchen_hand'));
  assert.ok(search('THỢ NAIL').includes('nail_technician'));
  assert.ok(search('chạy bàn').includes('waiter'));
  assert.ok(search('uber').includes('rideshare_driver') && search('uber').includes('delivery_rider'));
  assert.ok(search('electricians').includes('electricians_assistant'));
  assert.deepEqual(search('nail'), ['nail_technician'], 'a job search stays specific to jobs');
  assert.deepEqual(search('zzzz'), []);
});

test('jobs in the selected industry come first; all other jobs stay listed once', () => {
  const groups = occupationGroups('accommodation_food');
  assert.equal(groups[0].preferred, true);
  assert.ok(groups[0].occupations.some(item => item.key === 'kitchen_hand'));
  assert.ok(groups[0].occupations.some(item => item.key === 'delivery_rider'), 'cross-listed jobs appear in the preferred group');
  const listed = groups.flatMap(group => group.occupations.map(item => item.key));
  assert.equal(listed.length, occupations.length);
  assert.equal(new Set(listed).size, occupations.length);
  assert.equal(occupationGroups().some(group => group.preferred), false);
  assert.equal(occupationGroups('Hospitality').some(group => group.preferred), false);
});

test('labels follow the language; "Other" and older free text keep the person’s words', () => {
  const profile = { industry: 'accommodation_food', role: 'kitchen_hand' };
  assert.equal(industryText(profile, 'en'), 'Accommodation and Food Services');
  assert.equal(occupationText(profile, 'en'), 'Kitchen hand');
  assert.equal(occupationText(profile, 'vi'), 'Phụ bếp');
  assert.deepEqual(workFreeText(profile), []);
  const other = { industry: 'other', industryOther: 'Nhà in', role: 'other' };
  assert.equal(industryText(other, 'vi'), 'Khác: Nhà in');
  assert.equal(occupationText(other, 'en'), 'Other (please specify)');
  const legacy = { industry: 'Hospitality', role: 'Phụ bếp' };
  assert.equal(industryText(legacy, 'en'), 'Other: Hospitality');
  assert.deepEqual(workFreeText(legacy), ['Hospitality', 'Phụ bếp']);
  assert.equal(industryText({}, 'en'), undefined);
});
