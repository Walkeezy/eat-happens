import { describe, expect, it } from 'vitest';

import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('returns "-" for null', () => {
    expect(formatCurrency(null)).toBe('-');
  });

  it('formats numbers as CHF currency', () => {
    const value = 1234.5;
    const expected = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);

    expect(formatCurrency(value)).toBe(expected);
  });
});
