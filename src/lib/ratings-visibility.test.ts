import { describe, expect, it } from 'vitest';

import { applyRatingsVisibility, shouldHideRatings } from './ratings-visibility';

describe('shouldHideRatings', () => {
  it('hides ratings for events in the current year', () => {
    const currentYear = new Date().getFullYear();

    expect(shouldHideRatings(`${currentYear}-06-01`)).toBe(true);
  });

  it('hides ratings for current-year ISO datetimes', () => {
    const currentYear = new Date().getFullYear();

    expect(shouldHideRatings(`${currentYear}-06-01T00:00:00.000Z`)).toBe(true);
  });

  it('shows ratings for events not in the current year', () => {
    const previousYear = new Date().getFullYear() - 1;

    expect(shouldHideRatings(`${previousYear}-06-01`)).toBe(false);
    expect(shouldHideRatings(`${previousYear}-06-01T00:00:00.000Z`)).toBe(false);
  });

  it('shows ratings for invalid dates as fallback', () => {
    expect(shouldHideRatings('not-a-date')).toBe(false);
    expect(shouldHideRatings('2026-02-31')).toBe(false);
  });
});

describe('applyRatingsVisibility', () => {
  const currentUserId = 'user-1';
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const ownRating = {
    userId: currentUserId,
    legacyScore: null,
    foodScore: 5,
    ambienceScore: 4,
    pricePerformanceScore: 3,
  };
  const otherRating = {
    userId: 'user-2',
    legacyScore: null,
    foodScore: 2,
    ambienceScore: 2,
    pricePerformanceScore: 1,
  };

  it('keeps own scores, nulls others, and clears averages for the current year', () => {
    const result = applyRatingsVisibility(
      {
        date: `${currentYear}-06-01`,
        ratings: [ownRating, otherRating],
        averageLegacyRating: 3,
        averageFoodRating: 3.5,
        averageAmbienceRating: 3,
        averagePricePerformanceRating: 2,
      },
      currentUserId,
    );

    expect(result.ratings).toEqual([
      ownRating,
      {
        ...otherRating,
        legacyScore: null,
        foodScore: null,
        ambienceScore: null,
        pricePerformanceScore: null,
      },
    ]);
    expect(result.averageLegacyRating).toBeUndefined();
    expect(result.averageFoodRating).toBeUndefined();
    expect(result.averageAmbienceRating).toBeUndefined();
    expect(result.averagePricePerformanceRating).toBeUndefined();
  });

  it('leaves previous-year events untouched', () => {
    const event = {
      date: `${previousYear}-06-01`,
      ratings: [ownRating, otherRating],
      averageFoodRating: 3.5,
    };

    expect(applyRatingsVisibility(event, currentUserId)).toEqual(event);
  });
});
