import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../admin/core/auth.service';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';
import { ProjectsService } from './projects.service';

const text = { en: 'x', ar: 'س' };

const makeProject = (id: string, extra: Partial<Project> = {}): Project => ({
  id,
  category: 'Residential',
  card: { image: '/uploads/projects/c.webp', title: text, location: text, area: text, size: 'large' },
  hero: { eyebrow: text, title: text, subtitle: text, image: '', details: { location: text, totalArea: text, year: '2024', scope: text } },
  overview: {
    challenge: { number: '01', title: text, quote: text, paragraph1: text, paragraph2: text },
    concept: { number: '02', title: text, quote: text, paragraph1: text, paragraph2: text },
  },
  designProcess: { label: text, images: [] },
  visualJourney: { label: text, images: [] },
  solution: { number: '03', title: text, quote: text, paragraph1: text, paragraph2: text },
  spatialExperience: { image: '', title: text, text },
  ...extra,
});

describe('ProjectsService', () => {
  let http: HttpTestingController;
  const signedIn = signal(false);

  function setup(): ProjectsService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { ready: () => Promise.resolve(), isAuthenticated: () => signedIn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(ProjectsService);
  }

  afterEach(() => {
    signedIn.set(false);
    http.verify();
  });

  it('loads published projects from the API and resolves upload paths', () => {
    const service = setup();
    http.expectOne(`${environment.apiUrl}/projects`).flush({ data: [makeProject('a')] });

    let result: Project[] = [];
    service.getAll().subscribe((projects) => (result = projects));
    expect(result.length).toBe(1);
    expect(result[0].card.image).toMatch(/^https?:\/\/.+\/uploads\/projects\/c\.webp$/);
  });

  it('falls back to the bundled JSON when the API is unreachable', () => {
    const service = setup();
    http.expectOne(`${environment.apiUrl}/projects`).error(new ProgressEvent('error'));
    http.expectOne('assets/data/projects.json').flush({ projects: [makeProject('bundled')] });

    let ids: string[] = [];
    service.getAll().subscribe((projects) => (ids = projects.map((p) => p.id)));
    expect(ids).toEqual(['bundled']);
  });

  it('finds a published project by id', async () => {
    const service = setup();
    http.expectOne(`${environment.apiUrl}/projects`).flush({ data: [makeProject('a'), makeProject('b')] });

    const found = await new Promise<Project | undefined>((resolve) => service.getById('b').subscribe(resolve));
    expect(found?.id).toBe('b');
  });

  it('reports an unknown id as not found without calling the API when signed out', async () => {
    const service = setup();
    http.expectOne(`${environment.apiUrl}/projects`).flush({ data: [makeProject('a')] });

    const found = await new Promise<Project | undefined>((resolve) => service.getById('missing').subscribe(resolve));
    expect(found).toBeUndefined();
    http.expectNone(`${environment.apiUrl}/projects/missing?includeUnpublished=true`);
  });

  it('lets a signed-in admin open a draft that is not in the published list', async () => {
    signedIn.set(true);
    const service = setup();
    http.expectOne(`${environment.apiUrl}/projects`).flush({ data: [makeProject('a')] });

    const pending = new Promise<Project | undefined>((resolve) => service.getById('draft').subscribe(resolve));
    await Promise.resolve(); // let the auth.ready() promise settle
    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/projects/draft`);
    expect(request.request.params.get('includeUnpublished')).toBe('true');
    request.flush({ data: makeProject('draft', { isPublished: false }) });

    const found = await pending;
    expect(found?.id).toBe('draft');
    expect(found?.isPublished).toBe(false);
  });
});
