import { AfterViewInit, Component, ElementRef, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectsService } from '../../../services/projects.service';
import { Project } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

/** Number of projects featured on the home page; the rest live on /projects. */
const HOME_PROJECTS_LIMIT = 6;

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalizePipe],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);
  private projectsService = inject(ProjectsService);

  projects: Project[] = [];
  private viewReady = false;

  ngOnInit(): void {
    this.projectsService.getAll().subscribe((projects) => {
      this.projects = projects.slice(0, HOME_PROJECTS_LIMIT);
      if (this.viewReady) setTimeout(() => this.setupAnimations());
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    setTimeout(() => this.setupAnimations());
  }

  private setupAnimations(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.projects__eyebrow');
    const headline = host.querySelector<HTMLElement>('.projects__headline');
    const viewAll = host.querySelectorAll<HTMLElement>('.projects__view-all');
    const cards = host.querySelectorAll<HTMLElement>('.project-card');
    const grid = host.querySelector<HTMLElement>('.projects-grid');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 30, start: 'top 88%' });
    if (headline) this.anim.clipReveal(headline, host, { start: 'top 87%', duration: 1.0 });
    if (viewAll.length) this.anim.fadeUp(viewAll, host, { y: 20, start: 'top 85%', delay: 0.15 });

    if (grid && cards.length) {
      this.anim.scaleIn(cards, grid, { stagger: 0.09, start: 'top 88%', duration: 0.75 });
    }
  }
}
