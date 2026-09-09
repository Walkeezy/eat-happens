import { describe, expect, it } from 'vitest';

import { computePickerBias, eventOverall, mean, median, ratingOverall, scoreAverage, scoreRange } from './scores';

const categoryRating = (food: number, ambience: number, price: number) => ({
  legacyScore: null,
  foodScore: food,
  ambienceScore: ambience,
  pricePerformanceScore: price,
});

const legacyRating = (score: number) => ({
  legacyScore: score,
  foodScore: null,
  ambienceScore: null,
  pricePerformanceScore: null,
});

describe('mean and median', () => {
  it('returns undefined for empty lists', () => {
    expect(mean([])).toBeUndefined();
    expect(median([])).toBeUndefined();
  });

  it('averages numbers', () => {
    expect(mean([1, 3, 5])).toBe(3);
  });

  it('computes the median for odd and even lists', () => {
    expect(median([1, 5, 2])).toBe(2);
    expect(median([1, 3, 5, 7])).toBe(4);
  });
});

describe('ratingOverall', () => {
  it('averages category scores when they exist', () => {
    expect(ratingOverall(categoryRating(5, 4, 3))).toBe(4);
  });

  it('falls back to the legacy score', () => {
    expect(ratingOverall(legacyRating(2))).toBe(2);
  });

  it('returns null when nothing was scored', () => {
    expect(
      ratingOverall({ legacyScore: null, foodScore: null, ambienceScore: null, pricePerformanceScore: null }),
    ).toBeNull();
  });
});

describe('eventOverall and scoreAverage', () => {
  it('averages per-rating overalls, mixing legacy and category scores', () => {
    expect(eventOverall([categoryRating(5, 5, 5), legacyRating(1)])).toBe(3);
  });

  it('ignores missing category scores', () => {
    expect(scoreAverage([categoryRating(5, 1, 1), legacyRating(4)], 'foodScore')).toBe(5);
  });
});

describe('scoreRange', () => {
  it('needs at least two scores', () => {
    expect(scoreRange([categoryRating(4, 4, 4)])).toBeUndefined();
  });

  it('returns min, max, and spread', () => {
    expect(scoreRange([categoryRating(5, 5, 5), categoryRating(1, 1, 1)])).toEqual({ min: 1, max: 5, spread: 4 });
  });
});

describe('computePickerBias', () => {
  it('computes group average, own average, and delta per picker', () => {
    const result = computePickerBias([
      { pickerId: 'a', groupOverall: 4, pickerOverall: 5 },
      { pickerId: 'a', groupOverall: 2, pickerOverall: 3 },
      { pickerId: 'b', groupOverall: 5, pickerOverall: 4 },
    ]);

    expect(result).toEqual([
      { pickerId: 'b', pickCount: 1, groupAverage: 5, ownAverage: 4, delta: -1 },
      { pickerId: 'a', pickCount: 2, groupAverage: 3, ownAverage: 4, delta: 1 },
    ]);
  });

  it('leaves delta undefined when the picker did not rate', () => {
    expect(computePickerBias([{ pickerId: 'a', groupOverall: 4, pickerOverall: null }])).toEqual([
      { pickerId: 'a', pickCount: 1, groupAverage: 4, ownAverage: undefined, delta: undefined },
    ]);
  });
});
