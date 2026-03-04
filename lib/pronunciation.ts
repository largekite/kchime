export interface PronunciationScore {
  score: number; // 0–100
  targetWords: { word: string; matched: boolean }[];
  spokenText: string;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, '').trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

/** Returns the set of target word indices matched via LCS against spoken words. */
function matchedTargetIndices(target: string[], spoken: string[]): Set<number> {
  const rows = target.length + 1;
  const cols = spoken.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        target[i - 1] === spoken[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const matched = new Set<number>();
  let i = target.length;
  let j = spoken.length;
  while (i > 0 && j > 0) {
    if (target[i - 1] === spoken[j - 1]) {
      matched.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return matched;
}

export function scorePronunciation(targetText: string, spokenText: string): PronunciationScore {
  const targetWords = tokenize(targetText);
  const spokenWords = tokenize(spokenText);
  const matched = matchedTargetIndices(targetWords, spokenWords);
  const score =
    targetWords.length === 0 ? 0 : Math.round((matched.size / targetWords.length) * 100);

  return {
    score,
    targetWords: targetWords.map((word, i) => ({ word, matched: matched.has(i) })),
    spokenText,
  };
}
