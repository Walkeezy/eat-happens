import { describe, expect, it } from 'vitest';

import { calendarYear, todayCalendarDate } from './calendar-date';
import { buildRestaurantDetail } from './restaurant-detail';

const person = (id: string) => ({ id, name: id, email: `${id}@example.com` });

const categoryRating = (userId: string, food: number, ambience: number, price: number) => ({
  userId,
  user: person(userId),
  legacyScore: null,
  foodScore: food,
  ambienceScore: ambience,
  pricePerformanceScore: price,
});

const legacyRating = (userId: string, score: number) => ({
  userId,
  user: person(userId),
  legacyScore: score,
  foodScore: null,
  ambienceScore: null,
  pricePerformanceScore: null,
});

const names = (detail: ReturnType<typeof buildRestaurantDetail>) => detail.people.map((entry) => entry.person.id);

describe('buildRestaurantDetail', () => {
  it('averages the scores, splits the cost and reports the spread', () => {
    const detail = buildRestaurantDetail({
      date: '2024-05-01',
      totalCost: '300',
      assignedUsers: [person('anna'), person('ben'), person('chris')],
      ratings: [categoryRating('anna', 5, 4, 3), categoryRating('ben', 3, 2, 1)],
    });

    expect(detail).toMatchObject({
      ratingsHidden: false,
      overall: 3,
      food: 4,
      ambience: 3,
      pricePerformance: 2,
      spread: { min: 2, max: 4, spread: 2 },
      costPerPerson: 100,
      ratedCount: 2,
    });
  });

  it('lists the best rating first and the people who did not rate last', () => {
    const detail = buildRestaurantDetail({
      date: '2024-05-01',
      totalCost: null,
      assignedUsers: [person('anna'), person('ben'), person('chris')],
      ratings: [legacyRating('anna', 3), legacyRating('chris', 5)],
    });

    expect(names(detail)).toEqual(['chris', 'anna', 'ben']);
  });

  it('keeps ratings from people who are not on the guest list', () => {
    const detail = buildRestaurantDetail({
      date: '2024-05-01',
      totalCost: '100',
      assignedUsers: [person('anna')],
      ratings: [legacyRating('anna', 4), legacyRating('dora', 5)],
    });

    expect(names(detail)).toEqual(['dora', 'anna']);
    expect(detail.ratedCount).toBe(2);
    // Only the guest list shares the bill.
    expect(detail.costPerPerson).toBe(100);
  });

  it('hides the group scores of the current year and sorts by name instead', () => {
    const date = `${calendarYear(todayCalendarDate())}-01-01`;
    const detail = buildRestaurantDetail({
      date,
      totalCost: '100',
      assignedUsers: [person('ben'), person('anna')],
      ratings: [legacyRating('ben', 5), legacyRating('anna', 2)],
    });

    expect(detail).toMatchObject({ ratingsHidden: true, overall: undefined, food: undefined, spread: undefined });
    expect(names(detail)).toEqual(['anna', 'ben']);
  });

  it('has no cost per person without a cost or without attendees', () => {
    expect(
      buildRestaurantDetail({ date: '2024-05-01', totalCost: null, assignedUsers: [person('anna')] }).costPerPerson,
    ).toBe(null);
    expect(buildRestaurantDetail({ date: '2024-05-01', totalCost: '100' }).costPerPerson).toBe(null);
  });
});
