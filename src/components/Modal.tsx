import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, closeLabel, onClose, children, wide = false }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const initial = ref.current?.querySelector<HTMLElement>('button, a, input');
    initial?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, textarea, select, [tabindex="0"]') ?? [])];
      if (!elements.length) return;
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0].focus(); }
    };
    window.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', trap); before?.focus(); };
  }, []);
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-heading" ref={ref}>
      <button className="icon-button modal-close" onClick={onClose} aria-label={closeLabel}><X size={21} /></button>
      <h2 id="modal-heading">{title}</h2>{children}
    </div>
  </div>;
}
