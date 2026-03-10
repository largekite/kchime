import { useState, useCallback, useMemo } from 'react';
import { getContacts, getAllRelationships } from '@/lib/storage';
import type { Contact, RelationshipProfile } from '@/types';
import type { ReplyPersonalization } from '@/lib/claude';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => getContacts());
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const relationships = useMemo(() => getAllRelationships(), []);

  const refresh = useCallback(() => {
    setContacts(getContacts());
  }, []);

  /** Build personalization fields for the selected contact. */
  const getContactPersonalization = useCallback((): Pick<ReplyPersonalization, 'relationshipProfile' | 'contactNotes'> => {
    if (!selectedContactId) return {};
    const contact = contacts.find((c) => c.id === selectedContactId);
    if (!contact) return {};

    const result: Pick<ReplyPersonalization, 'relationshipProfile' | 'contactNotes'> = {};
    if (contact.notes) result.contactNotes = contact.notes;
    if (contact.relationshipId) {
      const rel = relationships.find((r: RelationshipProfile) => r.id === contact.relationshipId);
      if (rel) {
        result.relationshipProfile = {
          name: rel.name,
          formality: rel.formality,
          warmth: rel.warmth,
          brevity: rel.brevity,
          directness: rel.directness,
          emojiAllowed: rel.emojiAllowed,
        };
      }
    }
    return result;
  }, [selectedContactId, contacts, relationships]);

  return {
    contacts,
    relationships,
    selectedContactId,
    setSelectedContactId,
    refresh,
    getContactPersonalization,
  };
}
