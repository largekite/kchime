'use client';

import { deletePhrase, getSavedPhrases, savePhrase } from '@/lib/storage';
import { useCallback, useEffect, useState } from 'react';
import type { SavedPhrase } from '@/types';

export function useSavedPhrases() {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);

  useEffect(() => {
    setPhrases(getSavedPhrases());
  }, []);

  const save = useCallback((phrase: SavedPhrase) => {
    savePhrase(phrase);
    setPhrases((prev) => [phrase, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    deletePhrase(id);
    setPhrases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { phrases, save, remove };
}
