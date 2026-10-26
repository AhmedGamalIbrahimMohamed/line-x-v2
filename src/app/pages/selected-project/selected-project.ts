import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SelectedProjectDesignProcess } from './selected-project-design-process/selected-project-design-process';
import { SelectedProjectHero } from './selected-project-hero/selected-project-hero';
import { SelectedProjectOverview } from './selected-project-overview/selected-project-overview';
import { SelectedProjectSolution } from './selected-project-solution/selected-project-solution';
import { SelectedProjectSpatialExperience } from './selected-project-spatial-experience/selected-project-spatial-experience';
import { SelectedProjectVisualJourney } from './selected-project-visual-journey/selected-project-visual-journey';
import { CtaSectionComponent } from '../home/cta-section/cta-section';
import { NotFound } from '../not-found/not-found';
import { ProjectsService } from '../../services/projects.service';
import { SeoService } from '../../services/seo.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-selected-project',
  imports: [
    TranslateModule,
    SelectedProjectDesignProcess,
    SelectedProjectHero,
    SelectedProjectOverview,
    SelectedProjectSolution,
    SelectedProjectSpatialExperience,
    SelectedProjectVisualJourney,
    CtaSectionComponent,
    NotFound,
  ],
  templateUrl: './selected-project.html',
  styleUrl: './selected-project.scss',
})
export class SelectedProject implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private seo = inject(SeoService);
  private subscription?: Subscription;

  project: Project | undefined;
  /** True once loading has finished and no visible project has this ID. */
  notFound = false;

  ngOnInit(): void {
    // Follow the URL, so moving from one project straight to another reloads the page content.
    this.subscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.project = undefined;
      this.notFound = false;
      if (!id) return;

      this.projectsService.getById(id).subscribe((project) => {
        this.project = project;
        this.notFound = !project;
        this.updateSeo(project);
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateSeo(project: Project | undefined): void {
    if (!project) {
      this.seo.set({ title: 'Project not found | X-Line', noindex: true });
      return;
    }

    this.seo.set({
      title: `${project.hero.title.en || project.card.title.en} | X-Line`,
      description: project.hero.subtitle.en || undefined,
      image: project.card.image || project.hero.image || undefined,
      // A draft someone opened through "View on site" must never be indexed.
      noindex: project.isPublished === false,
    });
  }
}
