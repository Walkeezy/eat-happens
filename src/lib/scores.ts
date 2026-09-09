export type RatingScores = {
  legacyScore: number | null;
  foodScore: number | null;
  ambienceScore: number | null;
  pricePerformanceScore: number | null;
};

export type CategoryScoreKey = 'foodScore' | 'ambienceScore' | 'pricePerformanceScore';
type ScoreKey = 'legacyScore' | CategoryScoreKey;

export function mean(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export function ratingOverall(rating: RatingScores): number | null {
  const categories = [rating.foodScore, rating.ambienceScore, rating.pricePerformanceScore].filter(
    (score): score is number => score !== null,
  );

  if (categories.length > 0) {
    return mean(categories) ?? null;
  }

  return rating.legacyScore;
}

export function eventOverall(ratings: RatingScores[]): number | undefined {
  return mean(ratings.map(ratingOverall).filter((score): score is number => score !== null));
}

export function scoreAverage(ratings: RatingScores[], field: ScoreKey): number | undefined {
  return mean(ratings.map((rating) => rating[field]).filter((score): score is number => score !== null));
}

export function scoreRange(ratings: RatingScores[]): { min: number; max: number; spread: number } | undefined {
  const scores = ratings.map(ratingOverall).filter((score): score is number => score !== null);
  if (scores.length < 2) {
    return undefined;
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);

  return { min, max, spread: max - min };
}

type PickerBiasPick = {
  pickerId: string;
  groupOverall: number;
  pickerOverall: number | null;
};

type PickerBiasResult = {
  pickerId: string;
  pickCount: number;
  groupAverage: number;
  ownAverage: number | undefined;
  delta: number | undefined;
};

export function computePickerBias(picks: PickerBiasPick[]): PickerBiasResult[] {
  const byPicker = new Map<string, PickerBiasPick[]>();

  for (const pick of picks) {
    const list = byPicker.get(pick.pickerId) ?? [];
    list.push(pick);
    byPicker.set(pick.pickerId, list);
  }

  return [...byPicker.entries()]
    .flatMap(([pickerId, pickerPicks]) => {
      const groupAverage = mean(pickerPicks.map((pick) => pick.groupOverall));
      if (groupAverage === undefined) {
        return [];
      }

      const ownAverage = mean(
        pickerPicks.map((pick) => pick.pickerOverall).filter((score): score is number => score !== null),
      );

      return [
        {
          pickerId,
          pickCount: pickerPicks.length,
          groupAverage,
          ownAverage,
          delta: ownAverage === undefined ? undefined : ownAverage - groupAverage,
        },
      ];
    })
    .sort((a, b) => b.groupAverage - a.groupAverage || b.pickCount - a.pickCount);
}
