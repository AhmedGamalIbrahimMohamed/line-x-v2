import { Component } from '@angular/core';
import { ProjectsHero } from './projects-hero/projects-hero';
import { ProjectsCover } from './projects-cover/projects-cover';
import { ProjectsProjectsSection } from './projects-projects-section/projects-projects-section';
import { CtaSectionComponent } from '../home/cta-section/cta-section';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectsHero, ProjectsCover, ProjectsProjectsSection, CtaSectionComponent],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {}
