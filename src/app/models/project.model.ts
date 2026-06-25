import { LocalizedText } from './localized-text.model';

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

export interface ProjectOverviewBlock {
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
  label: LocalizedText;
  /** Flat list of image URLs. Rendered in repeating groups of 5: [main, planA-1, planA-2, planB-1, planB-2]. */
  images: string[];
}

export interface ProjectVisualJourney {
  label: LocalizedText;
  /** Flat list of image URLs. Rendered in repeating cycles of 4: [big, smallTop, smallBottom, band]. */
  images: string[];
}

export interface ProjectSolution {
  number: string;
  title: LocalizedText;
  quote: LocalizedText;
  paragraph1: LocalizedText;
  paragraph2: LocalizedText;
}

export interface ProjectSolutions {
  image: string;
  title: LocalizedText;
  text: LocalizedText;
}

export interface Project {
  id: string;
  category: string;
  card: ProjectCard;
  hero: ProjectHero;
  overview: ProjectOverview;
  designProcess: ProjectDesignProcess;
  visualJourney: ProjectVisualJourney;
  solution: ProjectSolution;
  solutions: ProjectSolutions;
}
