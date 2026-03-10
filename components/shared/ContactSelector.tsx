'use client';

import type { Contact, RelationshipProfile } from '@/types';
import { UserCircle } from 'lucide-react';

interface ContactSelectorProps {
  contacts: Contact[];
  relationships: RelationshipProfile[];
  selectedContactId: string;
  onSelect: (id: string) => void;
}

export function ContactSelector({ contacts, relationships, selectedContactId, onSelect }: ContactSelectorProps) {
  if (contacts.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <UserCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <select
        value={selectedContactId}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 focus:border-indigo-400 focus:outline-none"
      >
        <option value="">Replying to anyone</option>
        {contacts.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {selectedContactId && (
        <span className="text-xs text-indigo-600">
          {(() => {
            const c = contacts.find((ct) => ct.id === selectedContactId);
            const r = c?.relationshipId ? relationships.find((rl) => rl.id === c.relationshipId) : null;
            return r ? `${r.emoji} ${r.name}` : 'Personalized';
          })()}
        </span>
      )}
    </div>
  );
}
