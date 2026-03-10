'use client';

import { getContacts, saveContact, deleteContact, getAllRelationships } from '@/lib/storage';
import type { Contact, RelationshipProfile } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';
import { Plus, Trash2, X, Search, UserPlus, Download } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';

export default function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>(() => getContacts());
  const [relationships] = useState<RelationshipProfile[]>(() => getAllRelationships());
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // New contact form
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newRelId, setNewRelId] = useState('');

  function handleAdd() {
    if (!newName.trim()) return;
    const contact: Contact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      notes: newNotes.trim(),
      relationshipId: newRelId || undefined,
      createdAt: new Date().toISOString(),
    };
    saveContact(contact);
    setContacts(getContacts());
    setNewName('');
    setNewNotes('');
    setNewRelId('');
    setShowNew(false);
    toast('Contact added');
  }

  function handleUpdate(contact: Contact) {
    saveContact(contact);
    setContacts(getContacts());
    setEditingId(null);
    toast('Contact updated');
  }

  function handleDelete(id: string) {
    deleteContact(id);
    setContacts(getContacts());
    toast('Contact deleted');
  }

  const supportsContactPicker = typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

  async function handleImportFromPhone() {
    if (!supportsContactPicker) {
      toast('Your browser does not support importing phone contacts. Try Chrome on Android.');
      return;
    }
    try {
      const picked = await (navigator as any).contacts.select(['name', 'tel'], { multiple: true });
      if (!picked || picked.length === 0) return;
      let imported = 0;
      for (const entry of picked) {
        const name = entry.name?.[0]?.trim();
        if (!name) continue;
        const phone = entry.tel?.[0] ?? '';
        const contact: Contact = {
          id: `contact-${Date.now()}-${imported}`,
          name,
          notes: phone ? `Phone: ${phone}` : '',
          createdAt: new Date().toISOString(),
        };
        saveContact(contact);
        imported++;
      }
      setContacts(getContacts());
      if (imported > 0) {
        toast(`Imported ${imported} contact${imported > 1 ? 's' : ''}`);
      }
    } catch (err) {
      // User cancelled the picker or permission denied
      if ((err as Error).name !== 'InvalidStateError') {
        console.warn('Contact import failed:', err);
      }
    }
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  function getRelationship(id?: string) {
    if (!id) return null;
    return relationships.find((r) => r.id === id) ?? null;
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">Save people with notes so replies are personalized.</p>
        </div>
        <div className="flex items-center gap-2">
          {supportsContactPicker && (
            <button
              onClick={handleImportFromPhone}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4" />
              Import
            </button>
          )}
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      {contacts.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}

      {/* New contact form */}
      {showNew && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">New Contact</p>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            autoFocus
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes about this person (e.g., likes hiking, works in marketing, speaks slowly)..."
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
            <select
              value={newRelId}
              onChange={(e) => setNewRelId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="">None</option>
              {relationships.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.emoji} {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            Save Contact
          </button>
        </div>
      )}

      {/* Contact list */}
      {filteredContacts.length > 0 ? (
        <div className="space-y-2">
          {filteredContacts.map((contact) => {
            const rel = getRelationship(contact.relationshipId);
            const isEditing = editingId === contact.id;

            if (isEditing) {
              return (
                <EditContactCard
                  key={contact.id}
                  contact={contact}
                  relationships={relationships}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            return (
              <div
                key={contact.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">{contact.name}</p>
                      {rel && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {rel.emoji} {rel.name}
                        </span>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{contact.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(contact.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(contact.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      aria-label={`Delete ${contact.name}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
          <UserPlus className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No contacts yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add people you chat with so KChime can personalize replies for each person.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">No contacts match &ldquo;{search}&rdquo;</p>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete contact?"
          message="This contact and their notes will be permanently removed."
          onConfirm={() => {
            handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

function EditContactCard({
  contact,
  relationships,
  onSave,
  onCancel,
}: {
  contact: Contact;
  relationships: RelationshipProfile[];
  onSave: (c: Contact) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(contact.name);
  const [notes, setNotes] = useState(contact.notes);
  const [relId, setRelId] = useState(contact.relationshipId ?? '');

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium"
        autoFocus
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
      <select
        value={relId}
        onChange={(e) => setRelId(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      >
        <option value="">No relationship</option>
        {relationships.map((r) => (
          <option key={r.id} value={r.id}>
            {r.emoji} {r.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave({ ...contact, name: name.trim(), notes: notes.trim(), relationshipId: relId || undefined })
          }
          disabled={!name.trim()}
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-white transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
