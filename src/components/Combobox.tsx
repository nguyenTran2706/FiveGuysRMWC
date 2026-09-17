import { useEffect, useMemo, useRef, useState } from 'react';
import { useCombobox } from 'downshift';
import { Check, ChevronDown, X } from 'lucide-react';
import type { Language } from '../types';
import { matchesQuery } from '../data/occupations';
import './Combobox.css';

export interface ComboboxOption { value: string; label: string; secondary?: string; search: string }
export interface ComboboxGroup { id: string; label?: string; options: ComboboxOption[] }
export interface ComboboxText { placeholder: string; clear: string; toggle: string; noMatches: string; results: string }

interface Props {
  id: string;
  label: string;
  hint?: string;
  language: Language;
  value: string | undefined;
  groups: ComboboxGroup[];
  /** Always listed last, even when nothing matches, so nobody is blocked by a missing option. */
  other: ComboboxOption;
  text: ComboboxText;
  /** `typed` is what the person had typed when they chose, used to prefill an "Other" answer. */
  onChange: (value: string | undefined, typed: string) => void;
}

/**
 * Searchable single-choice list (WAI-ARIA combobox via downshift). Type to filter, accents optional;
 * arrows, Home/End, Enter and Esc work from the keyboard. Esc closes an open list and stops there;
 * with the list closed, Esc reaches the app-wide quick exit as usual.
 */
export default function Combobox({ id, label, hint, language, value, groups, other, text, onChange }: Props) {
  const selectedItem = useMemo(() => [...groups.flatMap(group => group.options), other].find(option => option.value === value) ?? null, [groups, other, value]);
  // downshift owns the text in the field (so fast typing is never dropped); `query` only drives filtering.
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleGroups = useMemo(() => (query.trim()
    ? groups.map(group => ({ ...group, options: group.options.filter(option => matchesQuery(option.search, query)) })).filter(group => group.options.length)
    : groups), [groups, query]);
  const items = useMemo(() => [...visibleGroups.flatMap(group => group.options), other], [visibleGroups, other]);
  const matches = items.length - 1;

  const { isOpen, highlightedIndex, getLabelProps, getInputProps, getMenuProps, getItemProps, getToggleButtonProps, selectItem } = useCombobox<ComboboxOption>({
    id,
    items,
    selectedItem,
    itemToString: item => item?.label ?? '',
    onInputValueChange: ({ inputValue: next, type }) => setQuery(type === useCombobox.stateChangeTypes.InputChange ? next ?? '' : ''),
    onSelectedItemChange: ({ selectedItem: item }) => { onChange(item?.value, query.trim()); setQuery(''); },
    onIsOpenChange: ({ isOpen: open }) => { if (!open) setQuery(''); },
    stateReducer: (state, { type, changes }) => {
      const { InputBlur, InputKeyDownEscape } = useCombobox.stateChangeTypes;
      if (type === InputBlur || type === InputKeyDownEscape) {
        // Leaving the field never picks the highlighted option by accident. Emptying it and leaving clears the choice.
        const cleared = type === InputBlur && !state.inputValue.trim();
        const kept = cleared ? null : state.selectedItem;
        return { ...changes, selectedItem: kept, inputValue: kept?.label ?? '' };
      }
      return changes;
    },
  });

  useEffect(() => {
    // On a phone, bring the field up so the list has room above the on-screen keyboard.
    if (!isOpen || !window.matchMedia('(max-width: 700px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    containerRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [isOpen]);

  const secondaryLanguage = language === 'vi' ? 'en' : 'vi';
  const renderOption = (option: ComboboxOption, index: number, isOther = false) => {
    const selected = selectedItem?.value === option.value;
    const secondary = isOther ? (query.trim() ? `“${query.trim()}”` : undefined) : option.secondary;
    return <li key={option.value} {...getItemProps({ item: option, index, className: `combobox-option${highlightedIndex === index ? ' is-highlighted' : ''}${isOther ? ' combobox-other' : ''}` })}>
      <span className="combobox-option-text"><span>{option.label}</span>{secondary && <small lang={isOther ? undefined : secondaryLanguage}>{secondary}</small>}</span>
      {selected && <Check size={16} aria-hidden="true" />}
    </li>;
  };
  let index = 0;

  return <div className="intake-field combobox" ref={containerRef}>
    <label {...getLabelProps({ className: 'combobox-label' })}>{label}</label>
    <div className="combobox-control">
      <input {...getInputProps({
        placeholder: text.placeholder,
        autoComplete: 'off',
        spellCheck: false,
        'aria-describedby': hint ? `${id}-hint` : undefined,
        onKeyDown: event => {
          if (event.key !== 'Escape') return;
          if (isOpen) event.stopPropagation();
          else (event.nativeEvent as KeyboardEvent & { preventDownshiftDefault?: boolean }).preventDownshiftDefault = true;
        },
      })} />
      <div className="combobox-buttons">
        {selectedItem && <button type="button" className="combobox-button" aria-label={`${text.clear}: ${label}`} onClick={() => selectItem(null)}><X size={15} /></button>}
        <button type="button" className="combobox-button" {...getToggleButtonProps({ 'aria-label': `${text.toggle}: ${label}` })}><ChevronDown size={17} className={isOpen ? 'is-flipped' : ''} /></button>
      </div>
      <ul {...getMenuProps({ className: `combobox-menu${isOpen ? ' is-open' : ''}` })}>
        {isOpen && <>
          {visibleGroups.map(group => <li key={group.id} role="group" aria-labelledby={group.label ? `${id}-${group.id}` : undefined} className="combobox-group">
            {group.label && <div id={`${id}-${group.id}`} role="presentation" className="combobox-group-label">{group.label}</div>}
            <ul role="presentation">{group.options.map(option => renderOption(option, index++))}</ul>
          </li>)}
          {!matches && <li role="presentation" className="combobox-empty">{text.noMatches}</li>}
          {renderOption(other, index, true)}
        </>}
      </ul>
    </div>
    {hint && <small id={`${id}-hint`}>{hint}</small>}
    <span className="sr-only" role="status">{isOpen && query.trim() ? text.results.replace('{count}', String(matches)) : ''}</span>
  </div>;
}
