import { Project } from '../models/project.model';
import { mapProjectMedia, relativizeMedia, resolveMedia } from './media-url';

const text = { en: '', ar: '' };

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'demo',
    category: 'Residential',
    card: { image: '/uploads/projects/card.webp', title: text, location: text, area: text, size: 'large' },
    hero: {
      eyebrow: text,
      title: text,
      subtitle: text,
      image: '',
      details: { location: text, totalArea: text, year: '2024', scope: text },
    },
    overview: {
      challenge: { number: '01', title: text, quote: text, paragraph1: text, paragraph2: text },
      concept: { number: '02', title: text, quote: text, paragraph1: text, paragraph2: text },
    },
    designProcess: { label: text, images: ['/uploads/projects/a.webp', 'assets/images/b.jpg', ''] },
    visualJourney: { label: text, images: [] },
    solution: { number: '03', title: text, quote: text, paragraph1: text, paragraph2: text },
    spatialExperience: { image: 'https://cdn.example.com/x.jpg', title: text, text },
    ...overrides,
  };
}

describe('media-url', () => {
  it('prefixes only /uploads paths with the API origin', () => {
    expect(resolveMedia('/uploads/projects/a.webp')).toMatch(/^https?:\/\/.+\/uploads\/projects\/a\.webp$/);
    expect(resolveMedia('assets/images/a.jpg')).toBe('assets/images/a.jpg');
    expect(resolveMedia('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });

  it('turns absolute upload URLs back into relative paths', () => {
    expect(relativizeMedia('http://localhost:4000/uploads/projects/a.webp')).toBe('/uploads/projects/a.webp');
    expect(relativizeMedia('https://api.example.com/uploads/projects/a.webp')).toBe('/uploads/projects/a.webp');
    expect(relativizeMedia('https://cdn.example.com/photo.jpg')).toBe('https://cdn.example.com/photo.jpg');
    expect(relativizeMedia('assets/images/a.jpg')).toBe('assets/images/a.jpg');
  });

  it('round-trips a project without changing its stored form', () => {
    const original = project();
    const roundTripped = mapProjectMedia(mapProjectMedia(original, resolveMedia), relativizeMedia);
    expect(roundTripped).toEqual(original);
  });

  it('leaves empty images empty and does not mutate its input', () => {
    const original = project();
    const mapped = mapProjectMedia(original, (url) => `x:${url}`);

    expect(mapped.hero.image).toBe('');
    expect(mapped.designProcess.images[2]).toBe('');
    expect(mapped.card.image).toBe('x:/uploads/projects/card.webp');
    expect(original.card.image).toBe('/uploads/projects/card.webp');
  });
});
