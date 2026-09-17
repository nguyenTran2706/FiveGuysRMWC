import { useMemo } from 'react';
import type { CaseFile, Language } from '../types';
import { intakeCopy } from '../data/intakeCopy';
import { OTHER_CHOICE, findIndustry, findOccupation, industries, industryChoice, occupationChoice, occupationGroups, otherLabel } from '../data/occupations';
import Combobox, { type ComboboxGroup, type ComboboxOption, type ComboboxText } from './Combobox';
import { Field } from './Intake';

/** Industry and job as searchable lists. Saves stable English keys; "Other" keeps the person's own words. */
export default function WorkFields({ language, caseFile, onChange }: { language: Language; caseFile: CaseFile; onChange: (file: CaseFile) => void }) {
  const copy = intakeCopy[language];
  const profile = caseFile.profile;
  const industry = industryChoice(profile);
  const role = occupationChoice(profile);
  const secondary = language === 'vi' ? 'en' : 'vi';
  const update = (patch: Partial<CaseFile['profile']>) => onChange({ ...caseFile, profile: { ...profile, ...patch } });
  const text: ComboboxText = { placeholder: '', clear: copy.comboClear, toggle: copy.comboToggle, noMatches: copy.comboNoMatches, results: copy.comboResults };
  const other: ComboboxOption = useMemo(() => ({ value: OTHER_CHOICE, label: otherLabel[language], search: '' }), [language]);

  const industryGroups = useMemo<ComboboxGroup[]>(() => [{
    id: 'all',
    options: industries.map(item => ({ value: item.key, label: item.label[language], secondary: item.label[secondary], search: item.search })),
  }], [language, secondary]);

  const roleGroups = useMemo<ComboboxGroup[]>(() => occupationGroups(industry.value).map(group => {
    const industryName = findIndustry(group.industry)!.label[language];
    return {
      id: group.id,
      label: group.preferred ? `${copy.rolesInIndustry} · ${industryName}` : industryName,
      options: group.occupations.map(item => ({ value: item.key, label: item.label[language], secondary: item.label[secondary], search: item.search })),
    };
  }), [industry.value, language, secondary, copy.rolesInIndustry]);

  function chooseIndustry(value: string | undefined, typed: string) {
    update({ industry: value, industryOther: value === OTHER_CHOICE ? industry.other || typed || undefined : undefined });
  }

  function chooseRole(value: string | undefined, typed: string) {
    const occupation = findOccupation(value);
    update({
      role: value,
      roleOther: value === OTHER_CHOICE ? role.other || typed || undefined : undefined,
      // Choosing a job first fills in its usual industry, which the person can still change.
      ...(occupation && !profile.industry ? { industry: occupation.industries[0], industryOther: undefined } : {}),
    });
  }

  return <div className="intake-field-stack">
    <Combobox id="work-industry" label={copy.industry} hint={copy.industryHint} language={language} value={industry.value} groups={industryGroups} other={other} text={{ ...text, placeholder: copy.industryPlaceholder }} onChange={chooseIndustry} />
    {industry.value === OTHER_CHOICE && <Field label={copy.industryOtherLabel}>
      <input lang={language} maxLength={100} autoComplete="off" value={industry.other} placeholder={copy.otherPlaceholder} onChange={event => update({ industry: OTHER_CHOICE, industryOther: event.target.value })} />
    </Field>}
    <Combobox id="work-role" label={copy.role} hint={copy.roleHint} language={language} value={role.value} groups={roleGroups} other={other} text={{ ...text, placeholder: copy.rolePlaceholder }} onChange={chooseRole} />
    {role.value === OTHER_CHOICE && <Field label={copy.roleOtherLabel}>
      <input lang={language} maxLength={200} autoComplete="off" value={role.other} placeholder={copy.otherPlaceholder} onChange={event => update({ role: OTHER_CHOICE, roleOther: event.target.value })} />
    </Field>}
  </div>;
}
