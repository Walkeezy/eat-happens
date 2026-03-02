import { describe, expect, it } from 'vitest';

import { shouldHideRatings } from './ratings-visibility';

describe('shouldHideRatings', () => {
  it('hides ratings for events in the current year', () => {
    const currentYear = new Date().getFullYear();

    expect(shouldHideRatings(`${currentYear}-06-01`)).toBe(true);
  });

  it('shows ratings for events not in the current year', () => {
    const previousYear = new Date().getFullYear() - 1;

    expect(shouldHideRatings(`${previousYear}-06-01`)).toBe(false);
  });

  it('shows ratings for invalid dates as fallback', () => {
    expect(shouldHideRatings('not-a-date')).toBe(false);
  });
});
