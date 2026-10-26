import { LocalizedText } from './localized-text.model';

/**
 * Values allowed for `Project.category`. Shared by the admin category dropdown and the projects
 * page filter tabs, where each also serves as an i18n key under `Projects.section.*`.
 */
export const PROJECT_CATEGORIES: readonly string[] = [
  'Administrative',
  'Commercial',
  'Interior Design',
  'Entertainment',
  'Landscape',
  'Residential',
];

export interface ProjectCard {
  image: string;
  title: LocalizedText;
  location: LocalizedText;
  area: LocalizedText;
  size: 'large' | 'small' | 'full';
}

export interface ProjectHeroDetails {
  location: LocalizedText;
  totalArea: LocalizedText;
  year: string;
  scope: LocalizedText;
}

export interface ProjectHero {
  eyebrow: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  image: string;
  details: ProjectHeroDetails;
}

/**
 * Challenge, Concept, Solution, Design Process and Visual Journey are optional per project.
 * `showcase` turns a section on or off on the project page; missing means shown, so projects
 * saved before the flag existed keep all their sections.
 */
export interface ProjectOverviewBlock {
  showcase?: boolean;
  number: string;
  title: LocalizedText;
  quote: LocalizedText;
  paragraph1: LocalizedText;
  paragraph2: LocalizedText;
}

export interface ProjectOverview {
  challenge: ProjectOverviewBlock;
  concept: ProjectOverviewBlock;
}

export interface ProjectDesignProcess {
  showcase?: boolean;
  label: LocalizedText;
  /** Flat list of image URLs. Rendered in repeating groups of 5: [main, planA-1, planA-2, planB-1, planB-2]. */
  images: string[];
}

export interface ProjectVisualJourney {
  showcase?: boolean;
  label: LocalizedText;
  /** Flat list of image URLs. Rendered in repeating cycles of 4: [big, smallTop, smallBottom, band]. */
  images: string[];
}

export interface ProjectSolution {
  showcase?: boolean;
  number: string;
  title: LocalizedText;
  quote: LocalizedText;
  paragraph1: LocalizedText;
  paragraph2: LocalizedText;
}

export interface ProjectSpatialExperience {
  showcase?: boolean;
  image: string;
  title: LocalizedText;
  text: LocalizedText;
}

export interface Project {
  id: string;
  category: string;
  /** Set by the API. Drafts (false) are only returned to signed-in admins. */
  isPublished?: boolean;
  sortOrder?: number;
  card: ProjectCard;
  hero: ProjectHero;
  overview: ProjectOverview;
  designProcess: ProjectDesignProcess;
  visualJourney: ProjectVisualJourney;
  solution: ProjectSolution;
  spatialExperience: ProjectSpatialExperience;
}
