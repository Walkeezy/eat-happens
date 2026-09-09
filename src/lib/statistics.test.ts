import { describe, expect, it } from 'vitest';

import { buildRevealHighlights, buildYearStatistics, type StatisticsEvent, type StatisticsPerson } from './statistics';

const person = (id: string, createdOn = '2024-01-01'): StatisticsPerson => ({
  id,
  name: id === 'anna' ? 'Anna' : id === 'ben' ? 'Ben' : 'Chris',
  createdOn,
});

const categoryRating = (userId: string, food: number, ambience: number, price: number) => ({
  userId,
  legacyScore: null,
  foodScore: food,
  ambienceScore: ambience,
  pricePerformanceScore: price,
});

const dinner = (overrides: Partial<StatisticsEvent> & Pick<StatisticsEvent, 'id' | 'restaurant'>): StatisticsEvent => ({
  date: '2025-06-01',
  totalCost: '100',
  pickedByUserId: null,
  pickerName: null,
  ratings: [],
  assignedUserIds: ['anna', 'ben'],
  ...overrides,
});

describe('buildYearStatistics', () => {
  const events: StatisticsEvent[] = [
    dinner({
      id: 'expensive-good',
      restaurant: 'Kronenhalle',
      date: '2025-03-01',
      totalCost: '200',
      pickedByUserId: 'anna',
      pickerName: 'Anna',
      ratings: [categoryRating('anna', 5, 5, 5), categoryRating('ben', 5, 4, 5)],
    }),
    dinner({
      id: 'cheap-bad',
      restaurant: 'Kantine',
      date: '2025-08-01',
      totalCost: '40',
      pickedByUserId: 'ben',
      pickerName: 'Ben',
      ratings: [categoryRating('anna', 2, 2, 1), categoryRating('ben', 4, 4, 2)],
    }),
  ];
  const people = [person('anna'), person('ben'), person('chris', '2026-01-01')];

  it('omits group score aggregates for an open year', () => {
    const stats = buildYearStatistics({
      isClosed: false,
      events,
      people,
      currentUserId: 'anna',
    });

    expect(stats.overallRanking).toBeUndefined();
    expect(stats.categoryRankings).toBeUndefined();
    expect(stats.costVsPricePerformance).toBeUndefined();
    expect(stats.raters).toBeUndefined();
    expect(stats.pickerBias).toBeUndefined();
    expect(stats.disagreement).toBeUndefined();
    expect(stats.groupTop5).toBeUndefined();
    expect(stats.personalTop5.map((row) => row.restaurant)).toEqual(['Kronenhalle', 'Kantine']);
    expect(stats.pickCounts).toEqual([
      { userId: 'anna', name: 'Anna', pickCount: 1 },
      { userId: 'ben', name: 'Ben', pickCount: 1 },
    ]);
    expect(stats.yearTotals.mostExpensive?.restaurant).toBe('Kronenhalle');
    expect(stats.attendance.find((row) => row.userId === 'chris')).toBeUndefined();
  });

  it('builds closed-year rankings, cost vs price, people, and picker bias', () => {
    const stats = buildYearStatistics({
      isClosed: true,
      events,
      people,
      currentUserId: 'anna',
    });

    expect(stats.overallRanking?.map((row) => row.restaurant)).toEqual(['Kronenhalle', 'Kantine']);
    expect(stats.categoryRankings?.food[0]?.restaurant).toBe('Kronenhalle');
    expect(stats.costVsPricePerformance?.expensiveAndGood?.restaurant).toBe('Kronenhalle');
    expect(stats.costVsPricePerformance?.cheapAndDisappointing?.restaurant).toBe('Kantine');
    expect(stats.raters?.[0]?.userId).toBe('ben');
    expect(stats.disagreement?.[0]?.restaurant).toBe('Kantine');
    expect(stats.groupTop5?.[0]?.restaurant).toBe('Kronenhalle');
    expect(stats.pickerBias?.[0]).toMatchObject({ userId: 'anna', pickCount: 1 });
    expect(stats.pickerBias?.find((row) => row.userId === 'ben')?.delta).toBeGreaterThan(0);
  });
});

describe('buildRevealHighlights', () => {
  it('returns nothing for an open year', () => {
    expect(
      buildRevealHighlights(
        buildYearStatistics({
          isClosed: false,
          events: [],
          people: [],
          currentUserId: 'anna',
        }),
      ),
    ).toEqual([]);
  });
});
