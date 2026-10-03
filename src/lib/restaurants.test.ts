import { describe, expect, it } from 'vitest';

import { calendarYear, todayCalendarDate } from './calendar-date';
import { buildRestaurantRows, filterAndSortRestaurants } from './restaurants';

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

const dinner = (id: string, overrides: Partial<Parameters<typeof buildRestaurantRows>[0][number]> = {}) => ({
  id,
  date: '2024-05-01',
  restaurant: id,
  totalCost: '120',
  pickerName: null,
  attendeeCount: 4,
  ratings: [],
  ...overrides,
});

describe('buildRestaurantRows', () => {
  it('averages the scores and splits the cost per attendee', () => {
    const [row] = buildRestaurantRows([
      dinner('Kronenhalle', { ratings: [categoryRating(5, 4, 3), categoryRating(3, 4, 5)], pickerName: 'Anna' }),
    ]);

    expect(row).toMatchObject({
      restaurant: 'Kronenhalle',
      pickerName: 'Anna',
      costPerPerson: 30,
      ratingsHidden: false,
      overall: 4,
      food: 4,
      ambience: 4,
      pricePerformance: 4,
    });
  });

  it('falls back to the legacy score and leaves the categories empty', () => {
    const [row] = buildRestaurantRows([dinner('Beiz', { ratings: [legacyRating(3), legacyRating(5)] })]);

    expect(row).toMatchObject({ overall: 4, food: undefined, ambience: undefined, pricePerformance: undefined });
  });

  it('hides the scores of the current year', () => {
    const date = `${calendarYear(todayCalendarDate())}-01-01`;
    const [row] = buildRestaurantRows([dinner('Neu', { date, ratings: [categoryRating(5, 5, 5)] })]);

    expect(row).toMatchObject({ ratingsHidden: true, overall: undefined, food: undefined });
  });

  it('has no cost per person without a cost or without attendees', () => {
    const rows = buildRestaurantRows([dinner('Gratis', { totalCost: null }), dinner('Leer', { attendeeCount: 0 })]);

    expect(rows.map((row) => row.costPerPerson)).toEqual([null, null]);
  });
});

describe('filterAndSortRestaurants', () => {
  const rows = buildRestaurantRows([
    dinner('Café Central', { date: '2024-01-01', totalCost: '80', ratings: [legacyRating(3)] }),
    dinner('Kronenhalle', { date: '2024-03-01', totalCost: '400', ratings: [legacyRating(5)] }),
    dinner('Kantine', { date: '2024-02-01', totalCost: null }),
  ]);
  const names = (result: typeof rows) => result.map((row) => row.restaurant);

  it('sorts by date, newest first', () => {
    expect(names(filterAndSortRestaurants(rows, '', 'date'))).toEqual(['Kronenhalle', 'Kantine', 'Café Central']);
  });

  it('sorts by rating and cost with the missing values last', () => {
    expect(names(filterAndSortRestaurants(rows, '', 'rating'))).toEqual(['Kronenhalle', 'Café Central', 'Kantine']);
    expect(names(filterAndSortRestaurants(rows, '', 'cost'))).toEqual(['Kronenhalle', 'Café Central', 'Kantine']);
  });

  it('searches case- and accent-insensitively', () => {
    expect(names(filterAndSortRestaurants(rows, '  CAFE ', 'date'))).toEqual(['Café Central']);
    expect(names(filterAndSortRestaurants(rows, 'k', 'date'))).toEqual(['Kronenhalle', 'Kantine']);
  });

  it('does not touch the input order', () => {
    filterAndSortRestaurants(rows, '', 'rating');

    expect(names(rows)).toEqual(['Café Central', 'Kronenhalle', 'Kantine']);
  });
});
