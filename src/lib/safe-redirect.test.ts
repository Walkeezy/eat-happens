import { describe, expect, it } from 'vitest';

import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('keeps same-origin paths including the query', () => {
    expect(safeRedirectPath('/restaurants/abc')).toBe('/restaurants/abc');
    expect(safeRedirectPath('/statistics?year=2025')).toBe('/statistics?year=2025');
  });

  it('falls back to the home page for anything that could leave the site', () => {
    expect(safeRedirectPath('https://evil.example')).toBe('/');
    expect(safeRedirectPath('//evil.example')).toBe('/');
    expect(safeRedirectPath('/\\evil.example')).toBe('/');
    expect(safeRedirectPath('restaurants')).toBe('/');
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath(null)).toBe('/');
  });
});
