/**
 * Fuzzy matching logic for athlete hometown alignment.
 * 
 * Note: These functions utilize string similarity algorithms (Levenshtein)
 * and heuristic-based normalization. They do not 100% "guarantee" matches 
 * but offer high-confidence suggestions for manual validation.
 */

/**
 * Calculates the Levenshtein distance between two strings.
 * Used as a base for fuzzy comparisons.
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, (_, i) => i)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Normalizes strings by removing punctuation, extra spaces, and 
 * handling common athletic/location abbreviations.
 */
export function normalizeHometown(str: string): string {
  if (!str) return "";
  
  let normalized = str.toLowerCase().trim();
  
  // Heuristic mapping for common abbreviations
  const substitutions: Record<string, string> = {
    "colo spgs": "colorado springs",
    "co springs": "colorado springs",
    "ny city": "new york city",
    "nyc": "new york city",
    "la": "los angeles",
    "sf": "san francisco",
    "slc": "salt lake city",
    "atl": "atlanta",
    "mt.": "mount",
    "st.": "saint",
  };

  Object.entries(substitutions).forEach(([abbr, full]) => {
    if (normalized.includes(abbr)) {
      normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    }
  });

  return normalized.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
}

/**
 * Higher-level function to check if two strings are a "fuzzy match".
 * Returns a score between 0 and 1, where 1 is a perfect match.
 */
export function getSimilarityScore(s1: string, s2: string): number {
  const n1 = normalizeHometown(s1);
  const n2 = normalizeHometown(s2);
  
  if (n1 === n2) return 1;
  if (n1.length === 0 || n2.length === 0) return 0;

  const distance = getLevenshteinDistance(n1, n2);
  const longest = Math.max(n1.length, n2.length);
  return (longest - distance) / longest;
}

/**
 * Interface definitions for our specific dataset alignment task.
 */
export interface OlympicAthlete {
  name: string;
  hometown: string;
  sport: string;
  year: number;
}

export interface ParalympicAthlete {
  name: string;
  home_town: string;
  sport_class: string;
  year: number;
}

export interface MatchResult {
  olympic: OlympicAthlete;
  paralympic: ParalympicAthlete;
  score: number;
  isFlagged: boolean;
}

/**
 * Main alignment logic.
 * Flags rows if similarity score is below the threshold or multiple 
 * candidates are identified.
 */
export function alignDatasets(
  olympicData: OlympicAthlete[],
  paralympicData: ParalympicAthlete[],
  threshold: number = 0.8
) {
  const matches: MatchResult[] = [];
  const unmatchedOlympic: OlympicAthlete[] = [];
  const unmatchedParalympic: Set<ParalympicAthlete> = new Set(paralympicData);

  olympicData.forEach((oly) => {
    let bestMatch: ParalympicAthlete | null = null;
    let maxScore = -1;

    paralympicData.forEach((para) => {
      // Primary match on name (fuzzy) + year (exact)
      const nameScore = getSimilarityScore(oly.name, para.name);
      const hometownScore = getSimilarityScore(oly.hometown, para.home_town);
      const yearMatch = oly.year === para.year;

      // Combined heuristic
      const combinedScore = (nameScore * 0.7) + (hometownScore * 0.3);

      if (yearMatch && combinedScore > maxScore) {
        maxScore = combinedScore;
        bestMatch = para;
      }
    });

    if (bestMatch && maxScore >= threshold) {
      matches.push({
        olympic: oly,
        paralympic: bestMatch,
        score: maxScore,
        isFlagged: maxScore < 0.95 // Flag for review if match is "soft"
      });
      unmatchedParalympic.delete(bestMatch);
    } else {
      unmatchedOlympic.push(oly);
    }
  });

  return {
    matches,
    unmatchedOlympic,
    unmatchedParalympic: Array.from(unmatchedParalympic),
  };
}
