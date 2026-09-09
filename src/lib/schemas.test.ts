import { describe, expect, it } from 'vitest';

import { eventWithAssignmentsSchema, parseOptionalTotalCost, ratingSchema } from './schemas';

describe('parseOptionalTotalCost', () => {
  it('returns null for empty or missing values', () => {
    expect(parseOptionalTotalCost(undefined)).toBeNull();
    expect(parseOptionalTotalCost('')).toBeNull();
    expect(parseOptionalTotalCost('  ')).toBeNull();
  });

  it('returns null for zero, negative, or non-numeric values', () => {
    expect(parseOptionalTotalCost('0')).toBeNull();
    expect(parseOptionalTotalCost('-10')).toBeNull();
    expect(parseOptionalTotalCost('abc')).toBeNull();
    expect(parseOptionalTotalCost('125.50abc')).toBeNull();
  });

  it('parses positive amounts', () => {
    expect(parseOptionalTotalCost('125.50')).toBe(125.5);
  });
});

describe('eventWithAssignmentsSchema', () => {
  const validEvent = {
    restaurant: 'Kronenhalle',
    date: '2026-09-09',
    assignedUserIds: ['user-1'],
    totalCost: 120,
  };

  it('accepts null total cost so an amount can be cleared', () => {
    const parsed = eventWithAssignmentsSchema.parse({ ...validEvent, totalCost: null });

    expect(parsed.totalCost).toBeNull();
  });

  it('rejects non-positive total cost', () => {
    expect(() => eventWithAssignmentsSchema.parse({ ...validEvent, totalCost: 0 })).toThrow();
    expect(() => eventWithAssignmentsSchema.parse({ ...validEvent, totalCost: -1 })).toThrow();
  });

  it('rejects invalid calendar dates', () => {
    expect(() => eventWithAssignmentsSchema.parse({ ...validEvent, date: '09.09.2026' })).toThrow();
    expect(() => eventWithAssignmentsSchema.parse({ ...validEvent, date: '2026-02-31' })).toThrow();
  });
});

describe('ratingSchema', () => {
  it('rejects scores outside 1-5', () => {
    const valid = { foodScore: 3, ambienceScore: 3, pricePerformanceScore: 3 };

    expect(() => ratingSchema.parse({ ...valid, foodScore: 0 })).toThrow();
    expect(() => ratingSchema.parse({ ...valid, ambienceScore: 6 })).toThrow();
  });

  it('accepts scores from 1 to 5', () => {
    expect(ratingSchema.parse({ foodScore: 1, ambienceScore: 5, pricePerformanceScore: 3 })).toEqual({
      foodScore: 1,
      ambienceScore: 5,
      pricePerformanceScore: 3,
    });
  });
});
