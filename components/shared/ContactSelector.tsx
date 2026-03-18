'use client';

import type { Contact, RelationshipProfile } from '@/types';
import { ChevronDown, UserCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface ContactSelectorProps {
  contacts: Contact[];
  relationships: RelationshipProfile[];
  selectedContactId: string;
  onSelect: (id: string) => void;
  /** Render as an inline chip that matches context-chip styling. */
  inline?: boolean;
}

export function ContactSelector({ contacts, relationships, selectedContactId, onSelect, inline }: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  if (contacts.length === 0) return null;

  const selected = contacts.find((c) => c.id === selectedContactId);
  const rel = selected?.relationshipId
    ? relationships.find((r) => r.id === selected.relationshipId)
    : null;

  const label = selected ? selected.name : 'Anyone';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'flex items-center gap-1.5 transition',
          inline
            ? clsx(
                'rounded-full px-3 py-1 text-sm font-medium',
                selected
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )
            : clsx(
                'rounded-lg border px-3 py-2 text-sm',
                selected
                  ? 'border-teal-300 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )
        )}
      >
        <UserCircle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate max-w-[120px]">
          {label}
          {rel ? ` ${rel.emoji}` : ''}
        </span>
        <ChevronDown className={clsx('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Clear button — only when selected and inline */}
      {inline && selected && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(''); }}
          className="ml-1 inline-flex items-center rounded-full p-0.5 text-teal-300 hover:text-white transition"
          title="Clear contact"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { onSelect(''); setOpen(false); }}
            className={clsx(
              'flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-gray-50',
              !selectedContactId ? 'text-teal-600 font-medium' : 'text-gray-600'
            )}
          >
            <UserCircle className="h-4 w-4 text-gray-400" />
            Anyone
          </button>
          {contacts.map((c) => {
            const cRel = c.relationshipId
              ? relationships.find((r) => r.id === c.relationshipId)
              : null;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { onSelect(c.id); setOpen(false); }}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-gray-50',
                  selectedContactId === c.id ? 'text-teal-600 font-medium' : 'text-gray-600'
                )}
              >
                <UserCircle className="h-4 w-4 text-gray-400" />
                <span className="truncate">{c.name}</span>
                {cRel && <span className="ml-auto text-xs text-gray-400">{cRel.emoji} {cRel.name}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
