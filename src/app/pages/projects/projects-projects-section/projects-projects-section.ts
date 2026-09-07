import { AfterViewInit, Component, ElementRef, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectsService } from '../../../services/projects.service';
import { Project } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

/** Tab key that shows every project instead of filtering by `project.category`. */
const ALL_CATEGORIES = 'All Projects';

@Component({
  selector: 'app-projects-projects-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalizePipe],
  templateUrl: './projects-projects-section.html',
  styleUrl: './projects-projects-section.scss',
})
export class ProjectsProjectsSection implements OnInit, AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);
  private projectsService = inject(ProjectsService);

  /** Tab labels double as i18n keys under `Projects.section.*` and as `project.category` values. */
  readonly categories = [
    ALL_CATEGORIES,
    'Administrative',
    'Commercial',
    'Interior Design',
    'Entertainment',
    'Landscape',
    'Residential',
  ];

  activeCategory = ALL_CATEGORIES;
  projects: Project[] = [];
  filteredProjects: Project[] = [];

  private viewReady = false;
  private cardsTween: ReturnType<ScrollAnimationService['scaleIn']> | null = null;

  ngOnInit(): void {
    this.projectsService.getAll().subscribe((projects) => {
      this.projects = projects;
      this.applyFilter();
      if (this.viewReady) setTimeout(() => this.setupAnimations());
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.projects.length) setTimeout(() => this.setupAnimations());
  }

  selectCategory(category: string): void {
    if (category === this.activeCategory) return;

    this.activeCategory = category;
    this.applyFilter();
    if (this.viewReady) setTimeout(() => this.animateCards());
  }

  trackById(_index: number, project: Project): string {
    return project.id;
  }

  private applyFilter(): void {
    if (this.activeCategory === ALL_CATEGORIES) {
      this.filteredProjects = this.projects;
      return;
    }

    const active = this.normalize(this.activeCategory);
    this.filteredProjects = this.projects.filter((project) => this.normalize(project.category) === active);
  }

  private normalize(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private setupAnimations(): void {
    const host = this.sectionRef.nativeElement;
    const tabs = host.querySelectorAll<HTMLElement>('.projects-tabs__item');

    if (tabs.length) this.anim.fadeUp(tabs, host, { y: 20, stagger: 0.07, start: 'top 90%' });
    this.animateCards();
  }

  /** Re-runs the card reveal after a filter change, discarding the previous tween's ScrollTrigger. */
  private animateCards(): void {
    this.cardsTween?.scrollTrigger?.kill();
    this.cardsTween?.kill();
    this.cardsTween = null;

    const host = this.sectionRef.nativeElement;
    const cards = host.querySelectorAll<HTMLElement>('.project-card');
    const grid = host.querySelector<HTMLElement>('.projects-list__grid');

    if (grid && cards.length) {
      this.cardsTween = this.anim.scaleIn(cards, grid, { stagger: 0.08, start: 'top 88%', delay: 0.05 });
    }

    // Filtering changes the page height, so every ScrollTrigger below this section holds
    // stale start/end positions and would never fire, leaving those sections invisible.
    requestAnimationFrame(() => this.anim.refresh());
  }
}
