import { Component } from '@angular/core';
import { SelectedProjectDesignProcess } from './selected-project-design-process/selected-project-design-process';
import { SelectedProjectHero } from './selected-project-hero/selected-project-hero';
import { SelectedProjectOverview } from './selected-project-overview/selected-project-overview';
import { SelectedProjectSolution } from './selected-project-solution/selected-project-solution';
import { SelectedProjectSolutions } from './selected-project-solutions/selected-project-solutions';
import { SelectedProjectVisualJourney } from './selected-project-visual-journey/selected-project-visual-journey';
import { CtaSectionComponent } from '../home/cta-section/cta-section';

@Component({
  selector: 'app-selected-project',
  imports: [
    SelectedProjectHero,
    SelectedProjectOverview,
    SelectedProjectDesignProcess,
    SelectedProjectVisualJourney,
    SelectedProjectSolution,
    SelectedProjectSolutions,
    CtaSectionComponent
  ],
  templateUrl: './selected-project.html',
  styleUrl: './selected-project.scss',
})
export class SelectedProject {}
