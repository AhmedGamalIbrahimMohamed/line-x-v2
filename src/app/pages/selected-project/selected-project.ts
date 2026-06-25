import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectedProjectDesignProcess } from './selected-project-design-process/selected-project-design-process';
import { SelectedProjectHero } from './selected-project-hero/selected-project-hero';
import { SelectedProjectOverview } from './selected-project-overview/selected-project-overview';
import { SelectedProjectSolution } from './selected-project-solution/selected-project-solution';
import { SelectedProjectSolutions } from './selected-project-solutions/selected-project-solutions';
import { SelectedProjectVisualJourney } from './selected-project-visual-journey/selected-project-visual-journey';
import { CtaSectionComponent } from '../home/cta-section/cta-section';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/project.model';

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
export class SelectedProject implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);

  project: Project | undefined;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.projectsService.getById(id).subscribe((project) => (this.project = project));
  }
}
