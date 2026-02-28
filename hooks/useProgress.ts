'use client';

import { getProgress, markScenarioComplete, addRecentPrompt, getTodayScenarioCount } from '@/lib/storage';
import { useCallback, useEffect, useState } from 'react';
import type { Progress } from '@/types';

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completeScenario = useCallback((scenarioId: string) => {
    const updated = markScenarioComplete(scenarioId);
    setProgress({ ...updated });
    return updated;
  }, []);

  const addPrompt = useCallback((prompt: string) => {
    addRecentPrompt(prompt);
    setProgress(getProgress());
  }, []);

  const todayCount = getTodayScenarioCount();

  return {
    progress,
    streak: progress?.streak ?? 0,
    completedScenarios: progress?.completedScenarios ?? [],
    recentPrompts: progress?.recentPrompts ?? [],
    todayCount,
    completeScenario,
    addPrompt,
  };
}
