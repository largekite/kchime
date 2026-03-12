'use client';

import { getProgress, markScenarioComplete, addRecentPrompt } from '@/lib/storage';
import { getLevel } from '@/lib/gamification';
import { useCallback, useEffect, useState } from 'react';
import type { BadgeId, Progress } from '@/types';

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completeScenario = useCallback((scenarioId: string) => {
    const result = markScenarioComplete(scenarioId);
    setProgress({ ...result.progress });
    if (result.newBadges.length > 0) {
      setNewBadges(result.newBadges);
    }
    return result.progress;
  }, []);

  const dismissBadges = useCallback(() => setNewBadges([]), []);

  const addPrompt = useCallback((prompt: string) => {
    addRecentPrompt(prompt);
    setProgress((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recentPrompts: [prompt, ...prev.recentPrompts.filter((p) => p !== prompt)].slice(0, 5),
      };
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayCount = progress?.daily?.find((d) => d.date === today)?.scenariosCompleted ?? 0;
  const xp = progress?.xp ?? 0;
  const levelInfo = getLevel(xp);

  return {
    progress,
    streak: progress?.streak ?? 0,
    completedScenarios: progress?.completedScenarios ?? [],
    recentPrompts: progress?.recentPrompts ?? [],
    earnedBadges: progress?.earnedBadges ?? [],
    xp,
    levelInfo,
    todayCount,
    newBadges,
    completeScenario,
    dismissBadges,
    addPrompt,
  };
}
