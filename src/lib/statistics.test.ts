import { describe, expect, it } from 'vitest';

import { calendarYear, todayCalendarDate } from './calendar-date';
import { applyRatingsVisibility } from './ratings-visibility';
import {
  buildRevealHighlights,
  buildYearStatistics,
  hasYearStatisticsData,
  type StatisticsEvent,
  type StatisticsPerson,
} from './statistics';

const names: Record<string, string> = {
  anna: 'Anna',
  ben: 'Ben',
  chris: 'Chris',
  solo: 'Solo',
};

const person = (id: string, createdOn = '2024-01-01'): StatisticsPerson => ({
  id,
  name: names[id] ?? id,
  createdOn,
});

const legacyRating = (userId: string, score: number) => ({
  userId,
  legacyScore: score,
  foodScore: null,
  ambienceScore: null,
  pricePerformanceScore: null,
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
    expect(stats.personalTop5?.map((row) => row.restaurant)).toEqual(['Kronenhalle', 'Kantine']);
    expect(stats.pickCounts).toEqual([
      { userId: 'anna', name: 'Anna', pickCount: 1 },
      { userId: 'ben', name: 'Ben', pickCount: 1 },
    ]);
    expect(stats.yearTotals?.mostExpensive?.restaurant).toBe('Kronenhalle');
    expect(stats.attendance?.find((row) => row.userId === 'chris')).toBeUndefined();
  });

  it('builds closed-year rankings, cost vs price, people, and picker bias', () => {
    const stats = buildYearStatistics({
      isClosed: true,
      events,
      people,
      currentUserId: 'anna',
    });

    expect(stats.overallRanking?.map((row) => row.restaurant)).toEqual(['Kronenhalle', 'Kantine']);
    expect(stats.categoryRankings?.food?.[0]?.restaurant).toBe('Kronenhalle');
    expect(stats.costVsPricePerformance?.expensiveAndGood?.restaurant).toBe('Kronenhalle');
    expect(stats.costVsPricePerformance?.cheapAndDisappointing?.restaurant).toBe('Kantine');
    expect(stats.raters?.[0]?.userId).toBe('ben');
    expect(stats.disagreement?.[0]?.restaurant).toBe('Kantine');
    expect(stats.groupTop5?.[0]?.restaurant).toBe('Kronenhalle');
    expect(stats.pickerBias?.[0]).toMatchObject({ userId: 'anna', pickCount: 1 });
    expect(stats.pickerBias?.find((row) => row.userId === 'ben')?.delta).toBeGreaterThan(0);
  });

  it('reports how many ratings back each ranked average', () => {
    const stats = buildYearStatistics({ isClosed: true, events, people, currentUserId: 'anna' });

    expect(stats.overallRanking?.map((row) => row.ratingCount)).toEqual([2, 2]);
  });

  it('omits every section when there are no events at all', () => {
    const stats = buildYearStatistics({ isClosed: true, events: [], people: [], currentUserId: 'anna' });

    expect(stats).toEqual({ isClosed: true });
    expect(hasYearStatisticsData(stats)).toBe(false);
    expect(buildRevealHighlights(stats)).toEqual([]);
  });

  it('keeps the sections that have data while the empty ones stay hidden', () => {
    const stats = buildYearStatistics({
      isClosed: true,
      events: [dinner({ id: 'legacy', restaurant: 'Beiz', totalCost: null, ratings: [legacyRating('anna', 4)] })],
      people,
      currentUserId: 'anna',
    });

    // A legacy rating carries an overall score but no categories, and nobody entered a cost.
    expect(hasYearStatisticsData(stats)).toBe(true);
    expect(stats.overallRanking).toHaveLength(1);
    expect(stats.categoryRankings).toBeUndefined();
    expect(stats.costs).toBeUndefined();
    expect(stats.yearTotals).toBeUndefined();
    expect(stats.costVsPricePerformance).toBeUndefined();
    expect(stats.disagreement).toBeUndefined();
    expect(stats.pickCounts).toBeUndefined();
    expect(stats.pickerBias).toBeUndefined();
  });

  it('hides a single category that nobody rated', () => {
    const stats = buildYearStatistics({
      isClosed: true,
      events: [
        dinner({
          id: 'no-ambience',
          restaurant: 'Ohne Ambiente',
          ratings: [{ userId: 'anna', legacyScore: null, foodScore: 4, ambienceScore: null, pricePerformanceScore: 3 }],
        }),
      ],
      people,
      currentUserId: 'anna',
    });

    expect(stats.categoryRankings?.food).toHaveLength(1);
    expect(stats.categoryRankings?.pricePerformance).toHaveLength(1);
    expect(stats.categoryRankings?.ambience).toBeUndefined();
  });

  it('breaks personal top 5 ties by restaurant name', () => {
    const tied = [
      dinner({ id: 'z', restaurant: 'Zorro', ratings: [categoryRating('anna', 4, 4, 4)] }),
      dinner({ id: 'a', restaurant: 'Alpha', ratings: [categoryRating('anna', 4, 4, 4)] }),
    ];
    const stats = buildYearStatistics({ isClosed: false, events: tied, people, currentUserId: 'anna' });

    expect(stats.personalTop5?.map((row) => row.restaurant)).toEqual(['Alpha', 'Zorro']);
  });

  it('counts a rater who is no longer a confirmed member', () => {
    const withGhost = [
      dinner({
        id: 'ghost-dinner',
        restaurant: 'Beisl',
        ratings: [categoryRating('anna', 3, 3, 3), { ...categoryRating('ghost', 5, 5, 5), raterName: 'Ghost' }],
      }),
    ];
    const stats = buildYearStatistics({ isClosed: true, events: withGhost, people, currentUserId: 'anna' });

    expect(stats.raters?.map((row) => row.name)).toEqual(['Ghost', 'Anna']);
  });

  it('limits the controversial list to the five widest spreads', () => {
    const spread = Array.from({ length: 8 }, (_, index) =>
      dinner({
        id: `d${index}`,
        restaurant: `Lokal ${index}`,
        ratings: [categoryRating('anna', 1, 1, 1), categoryRating('ben', 1 + index * 0.5, 1, 1)],
      }),
    );
    const stats = buildYearStatistics({ isClosed: true, events: spread, people, currentUserId: 'anna' });

    expect(stats.disagreement).toHaveLength(5);
    expect(stats.disagreement?.[0]?.restaurant).toBe('Lokal 7');
  });
});

describe('cost handling', () => {
  const people = [person('anna'), person('ben')];

  it('yields no cost per person when nobody was assigned or the amount is not a number', () => {
    const events = [
      dinner({ id: 'nobody', restaurant: 'Leer', totalCost: '80', assignedUserIds: [] }),
      dinner({ id: 'junk', restaurant: 'Kaputt', totalCost: 'abc' }),
      dinner({ id: 'fine', restaurant: 'Gut', totalCost: '60' }),
    ];
    const stats = buildYearStatistics({ isClosed: false, events, people, currentUserId: 'anna' });
    const byId = new Map((stats.costs ?? []).map((row) => [row.id, row]));

    expect(byId.get('nobody')?.costPerPerson).toBeNull();
    expect(byId.get('junk')?.costPerPerson).toBeNull();
    expect(byId.get('fine')?.costPerPerson).toBe(30);
    // 'junk' is not a finite amount, so it must not poison the yearly total
    expect(stats.yearTotals?.totalSpend).toBe(140);
    expect(stats.yearTotals?.averageCostPerPerson).toBe(30);
  });

  it('splits an odd number of dinners around the median and skips the median itself', () => {
    const events = [
      dinner({ id: 'cheap', restaurant: 'Guenstig', totalCost: '20', ratings: [categoryRating('anna', 3, 3, 1)] }),
      dinner({ id: 'mid', restaurant: 'Mittel', totalCost: '40', ratings: [categoryRating('anna', 3, 3, 3)] }),
      dinner({ id: 'pricey', restaurant: 'Teuer', totalCost: '60', ratings: [categoryRating('anna', 3, 3, 5)] }),
    ];
    const stats = buildYearStatistics({ isClosed: true, events, people, currentUserId: 'anna' });

    expect(stats.costVsPricePerformance?.rows).toHaveLength(3);
    expect(stats.costVsPricePerformance?.expensiveAndGood?.restaurant).toBe('Teuer');
    expect(stats.costVsPricePerformance?.cheapAndDisappointing?.restaurant).toBe('Guenstig');
  });

  it('has no expensive/cheap outlier when every dinner cost the same', () => {
    const events = [
      dinner({ id: 'a', restaurant: 'Eins', totalCost: '40', ratings: [categoryRating('anna', 5, 5, 5)] }),
      dinner({ id: 'b', restaurant: 'Zwei', totalCost: '40', ratings: [categoryRating('anna', 1, 1, 1)] }),
    ];
    const stats = buildYearStatistics({ isClosed: true, events, people, currentUserId: 'anna' });

    expect(stats.costVsPricePerformance?.rows).toHaveLength(2);
    expect(stats.costVsPricePerformance?.expensiveAndGood).toBeNull();
    expect(stats.costVsPricePerformance?.cheapAndDisappointing).toBeNull();
  });
});

describe('attendance eligibility', () => {
  it('only counts dinners that happened after someone joined', () => {
    const events = [
      dinner({ id: 'before', restaurant: 'Frueh', date: '2025-03-01', assignedUserIds: ['anna'] }),
      dinner({ id: 'after', restaurant: 'Spaet', date: '2025-08-01', assignedUserIds: ['anna', 'ben'] }),
    ];
    const stats = buildYearStatistics({
      isClosed: true,
      events,
      people: [person('anna'), person('ben', '2025-07-01'), person('chris', '2026-01-01')],
      currentUserId: 'anna',
    });

    expect(stats.attendance?.find((row) => row.userId === 'anna')).toMatchObject({ attended: 2, eligible: 2, rate: 1 });
    expect(stats.attendance?.find((row) => row.userId === 'ben')).toMatchObject({ attended: 1, eligible: 1, rate: 1 });
    expect(stats.attendance?.find((row) => row.userId === 'chris')).toBeUndefined();
  });
});

describe('ratings visibility feeds the open year', () => {
  it('keeps your own scores while other members stay hidden', () => {
    const currentYear = calendarYear(todayCalendarDate());
    const openEvents = [
      dinner({
        id: 'open',
        restaurant: 'Laufend',
        date: `${currentYear}-06-01`,
        pickedByUserId: 'ben',
        pickerName: 'Ben',
        ratings: [categoryRating('anna', 4, 4, 4), categoryRating('ben', 1, 1, 1)],
      }),
    ].map((event) => applyRatingsVisibility(event, 'anna'));

    expect(openEvents[0].ratings.find((rating) => rating.userId === 'ben')?.foodScore).toBeNull();

    const stats = buildYearStatistics({
      isClosed: false,
      events: openEvents,
      people: [person('anna'), person('ben')],
      currentUserId: 'anna',
    });

    expect(stats.personalTop5).toEqual([{ id: 'open', restaurant: 'Laufend', score: 4 }]);
    expect(stats.overallRanking).toBeUndefined();
    expect(stats.raters).toBeUndefined();
    expect(stats.disagreement).toBeUndefined();
    expect(stats.groupTop5).toBeUndefined();
    // Ben's participation is still visible - only his scores are withheld
    expect(stats.completion?.find((row) => row.userId === 'ben')).toMatchObject({ assigned: 1, rated: 1, open: 0 });
    expect(buildRevealHighlights(stats)).toEqual([]);
  });
});

describe('buildRevealHighlights', () => {
  const people = [person('anna'), person('ben'), person('solo')];

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

  it('does not award a flop when there is only one ranked dinner', () => {
    const stats = buildYearStatistics({
      isClosed: true,
      events: [dinner({ id: 'only', restaurant: 'Einzig', ratings: [categoryRating('anna', 4, 4, 4)] })],
      people,
      currentUserId: 'anna',
    });
    const keys = buildRevealHighlights(stats).map((card) => card.key);

    expect(keys).toContain('winner');
    expect(keys).not.toContain('flop');
  });

  it('prefers a picker with a real track record over a single lucky pick', () => {
    const events = [
      dinner({
        id: 'lucky',
        restaurant: 'Glueck',
        pickedByUserId: 'solo',
        pickerName: 'Solo',
        ratings: [categoryRating('anna', 5, 5, 5)],
      }),
      dinner({
        id: 'steady-1',
        restaurant: 'Stetig 1',
        pickedByUserId: 'ben',
        pickerName: 'Ben',
        ratings: [categoryRating('anna', 4, 4, 4)],
      }),
      dinner({
        id: 'steady-2',
        restaurant: 'Stetig 2',
        pickedByUserId: 'ben',
        pickerName: 'Ben',
        ratings: [categoryRating('anna', 5, 5, 5)],
      }),
    ];
    const stats = buildYearStatistics({ isClosed: true, events, people, currentUserId: 'anna' });

    // Solo still tops the table on raw group average...
    expect(stats.pickerBias?.[0]?.userId).toBe('solo');
    // ...but the award goes to the picker with more than one pick behind them.
    expect(buildRevealHighlights(stats).find((card) => card.key === 'picker')).toMatchObject({ name: 'Ben' });
  });
});
