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
    setPhrases(getSavedPhrases());
  }, []);

  const remove = useCallback((id: string) => {
    deletePhrase(id);
    setPhrases(getSavedPhrases());
  }, []);

  return { phrases, save, remove };
}
