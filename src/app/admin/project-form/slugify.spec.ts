import { slugify } from './slugify';

describe('slugify', () => {
  it('makes a URL-safe slug from a title', () => {
    expect(slugify('The Ramlah Hotel')).toBe('the-ramlah-hotel');
    expect(slugify('  Mali   Tower!! ')).toBe('mali-tower');
  });

  it('strips accents and symbols', () => {
    expect(slugify('Café & Résidence #2')).toBe('cafe-residence-2');
  });

  it('returns an empty string when nothing usable is left (e.g. Arabic-only text)', () => {
    expect(slugify('مشروع')).toBe('');
    expect(slugify('')).toBe('');
  });

  it('matches the API rule: lowercase letters, numbers and single hyphens', () => {
    expect(slugify('A--B__C  d')).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('caps the length at 120 characters', () => {
    expect(slugify('a'.repeat(300)).length).toBe(120);
  });
});
