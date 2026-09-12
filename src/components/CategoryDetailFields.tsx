import type { Archetype, CaseFile, Language } from '../types';
import { intakeCopy } from '../data/intakeCopy';
import { archetypeLabels } from '../data/stories';
import { BooleanSelect, Field } from './Intake';

type Detail = CaseFile['detail'];
interface GroupProps { language: Language; caseFile: CaseFile; onChange: (file: CaseFile) => void }

function useDetail<K extends keyof Detail>(key: K, { caseFile, onChange }: GroupProps) {
  const value = (caseFile.detail[key] ?? {}) as NonNullable<Detail[K]>;
  const update = (patch: Partial<NonNullable<Detail[K]>>) => onChange({ ...caseFile, detail: { ...caseFile.detail, [key]: { ...value, ...patch } } });
  return [value, update] as const;
}

function ShamContracting(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('shamContracting', props);
  return <div className="intake-field-stack">
    <BooleanSelect language={props.language} label={copy.dToldABN} value={value.toldToGetABN} onChange={toldToGetABN => update({ toldToGetABN })} />
    <Field label={copy.dWhoSetsHours}><input lang={props.language} value={value.whoSetsHours ?? ''} onChange={event => update({ whoSetsHours: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dOwnTools} value={value.ownTools} onChange={ownTools => update({ ownTools })} />
    <BooleanSelect language={props.language} label={copy.dSubstitute} value={value.canSendSubstitute} onChange={canSendSubstitute => update({ canSendSubstitute })} />
  </div>;
}

function Dismissal(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('dismissal', props);
  return <div className="intake-field-stack">
    <Field label={copy.dHowItEnded}>
      <select value={value.howItEnded ?? ''} onChange={event => update({ howItEnded: (event.target.value || undefined) as NonNullable<Detail['dismissal']>['howItEnded'] })}>
        <option value="">{copy.choose}</option>
        {Object.entries(copy.dHowItEndedOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </Field>
    <Field label={copy.dReasonGiven}><input lang={props.language} value={value.reasonGiven ?? ''} onChange={event => update({ reasonGiven: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dInWriting} value={value.inWriting} onChange={inWriting => update({ inWriting })} />
  </div>;
}

function WorkplaceInjury(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('workplaceInjury', props);
  return <div className="intake-field-stack">
    <Field label={copy.dInjuryWhat}><textarea rows={3} lang={props.language} value={value.what ?? ''} onChange={event => update({ what: event.target.value })} /></Field>
    <Field label={copy.dInjuryWhen}><input type="date" value={value.whenISO ?? ''} onChange={event => update({ whenISO: event.target.value })} /></Field>
    <Field label={copy.dReportedTo}><input lang={props.language} value={value.reportedTo ?? ''} onChange={event => update({ reportedTo: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dSawDoctor} value={value.sawDoctor} onChange={sawDoctor => update({ sawDoctor })} />
    <BooleanSelect language={props.language} label={copy.dCompLodged} value={value.workersCompLodged} onChange={workersCompLodged => update({ workersCompLodged })} />
  </div>;
}

function Discrimination(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('discrimination', props);
  return <div className="intake-field-stack">
    <Field label={copy.dAttribute}><input lang={props.language} value={value.attribute ?? ''} onChange={event => update({ attribute: event.target.value })} /></Field>
    <Field label={copy.dWhatChanged}><textarea rows={3} lang={props.language} value={value.whatChanged ?? ''} onChange={event => update({ whatChanged: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dOthersDifferent} value={value.othersTreatedDifferently} onChange={othersTreatedDifferently => update({ othersTreatedDifferently })} />
  </div>;
}

function Harassment(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('harassment', props);
  return <div className="intake-field-stack">
    <Field label={copy.dWhatHappened}><textarea rows={3} lang={props.language} value={value.whatHappened ?? ''} onChange={event => update({ whatHappened: event.target.value })} /></Field>
    <Field label={copy.dByWhom}>
      <select value={value.byWhom ?? ''} onChange={event => update({ byWhom: (event.target.value || undefined) as NonNullable<Detail['harassment']>['byWhom'] })}>
        <option value="">{copy.choose}</option>
        {Object.entries(copy.dByWhomOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </Field>
    <BooleanSelect language={props.language} label={copy.dOngoing} value={value.ongoing} onChange={ongoing => update({ ongoing })} />
    <BooleanSelect language={props.language} label={copy.dWitnesses} value={value.witnesses} onChange={witnesses => update({ witnesses })} />
    <BooleanSelect language={props.language} label={copy.dReportedToAnyone} value={value.reportedToAnyone} onChange={reportedToAnyone => update({ reportedToAnyone })} />
  </div>;
}

function Bullying(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const [value, update] = useDetail('bullying', props);
  return <div className="intake-field-stack">
    <Field label={copy.dBehaviour}><textarea rows={3} lang={props.language} value={value.behaviour ?? ''} onChange={event => update({ behaviour: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dRepeated} value={value.repeated} onChange={repeated => update({ repeated })} />
    <Field label={copy.dBullyByWhom}><input lang={props.language} value={value.byWhom ?? ''} onChange={event => update({ byWhom: event.target.value })} /></Field>
    <BooleanSelect language={props.language} label={copy.dWitnesses} value={value.witnesses} onChange={witnesses => update({ witnesses })} />
  </div>;
}

/** Underpayment is already covered by the pay and hours questions, so it has no extra group here. */
const groups: Partial<Record<Archetype, (props: GroupProps) => React.ReactElement>> = {
  sham_contracting: ShamContracting,
  unfair_dismissal: Dismissal,
  workplace_injury: WorkplaceInjury,
  discrimination: Discrimination,
  sexual_harassment: Harassment,
  bullying: Bullying,
};

/** Closed follow-up questions, shown only for the categories the worker declared. */
export default function CategoryDetailFields(props: GroupProps) {
  const copy = intakeCopy[props.language];
  const selected = (props.caseFile.selfReported?.categories ?? []).filter(archetype => groups[archetype]);
  if (!selected.length) return <p className="intake-detail-empty">{copy.detailEmpty}</p>;
  return <div className="intake-detail-groups">{selected.map(archetype => {
    const Group = groups[archetype]!;
    return <section className="intake-detail-group" key={archetype}>
      <h4>{archetypeLabels[archetype][props.language]}</h4>
      <Group {...props} />
    </section>;
  })}</div>;
}
