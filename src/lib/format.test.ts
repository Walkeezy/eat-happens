import { describe, expect, it } from 'vitest';

import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('returns "-" for null', () => {
    expect(formatCurrency(null)).toBe('-');
  });

  it('formats numbers and decimal strings as CHF currency', () => {
    const expected = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(1234.5);

    expect(formatCurrency(1234.5)).toBe(expected);
    expect(formatCurrency('1234.50')).toBe(expected);
  });
});
