import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

/**
 * Uploaded images are stored on projects as site-relative paths (`/uploads/projects/x.webp`) so
 * moving the API to another domain never breaks them. The API origin is added when rendering.
 */
const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

/** `/uploads/...` → `https://api.example.com/uploads/...`; every other value is returned untouched. */
export function resolveMedia(url: string): string {
  return url.startsWith('/uploads/') ? apiOrigin + url : url;
}

/** Inverse of `resolveMedia`, applied before saving. Also handles legacy absolute upload URLs. */
export function relativizeMedia(url: string): string {
  const match = /^https?:\/\/[^/]+(\/uploads\/.+)$/.exec(url);
  return match ? match[1] : url;
}

/** Returns a copy of the project with `transform` applied to every image reference. */
export function mapProjectMedia(project: Project, transform: (url: string) => string): Project {
  const run = (url: string | undefined) => (url ? transform(url) : (url ?? ''));
  return {
    ...project,
    card: { ...project.card, image: run(project.card.image) },
    hero: { ...project.hero, image: run(project.hero.image) },
    designProcess: { ...project.designProcess, images: (project.designProcess.images ?? []).map(run) },
    visualJourney: { ...project.visualJourney, images: (project.visualJourney.images ?? []).map(run) },
    spatialExperience: project.spatialExperience
      ? { ...project.spatialExperience, image: run(project.spatialExperience.image) }
      : project.spatialExperience,
  };
}
