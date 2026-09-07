import { AfterViewInit, Component, ElementRef, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectsService } from '../../../services/projects.service';
import { Project, ProjectCard } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

/** Tab key that shows every project instead of filtering by `project.category`. */
const ALL_CATEGORIES = 'All Projects';

/** Cards shown before "Load More" is offered, and how many each click adds. */
const PAGE_SIZE = 6;

type CardSize = ProjectCard['size'];
type CardTween = ReturnType<ScrollAnimationService['scaleIn']>;

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
  /** Every project in the active category. */
  filteredProjects: Project[] = [];
  /** The first `visibleCount` of `filteredProjects` — what the grid renders. */
  visibleProjects: Project[] = [];
  /** Layout size per rendered card, parallel to `visibleProjects`. */
  cardSizes: CardSize[] = [];

  private visibleCount = PAGE_SIZE;
  private viewReady = false;
  private cardTweens: CardTween[] = [];

  /** Only offer "Load More" while the category still holds projects the grid is not showing. */
  get hasMore(): boolean {
    return this.filteredProjects.length > this.visibleProjects.length;
  }

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
    this.visibleCount = PAGE_SIZE;
    this.applyFilter();
    if (this.viewReady) setTimeout(() => this.animateCards());
  }

  loadMore(): void {
    const shownBefore = this.visibleProjects.length;

    this.visibleCount += PAGE_SIZE;
    this.updateVisible();
    // Only the appended cards animate; the ones already on screen keep their existing tween.
    if (this.viewReady) setTimeout(() => this.animateCards(shownBefore));
  }

  trackById(_index: number, project: Project): string {
    return project.id;
  }

  private applyFilter(): void {
    if (this.activeCategory === ALL_CATEGORIES) {
      this.filteredProjects = this.projects;
    } else {
      const active = this.normalize(this.activeCategory);
      this.filteredProjects = this.projects.filter((project) => this.normalize(project.category) === active);
    }

    this.updateVisible();
  }

  private updateVisible(): void {
    this.visibleProjects = this.filteredProjects.slice(0, this.visibleCount);

    const total = this.visibleProjects.length;
    this.cardSizes = this.visibleProjects.map((_project, index) => this.sizeAt(index, total));
  }

  /**
   * Sizes follow the design's repeating large → small → full rhythm by position, so a filtered
   * subset re-flows on its own instead of inheriting the sizes of the unfiltered list. A card that
   * would otherwise sit alone on a row spans the full width instead.
   */
  private sizeAt(index: number, total: number): CardSize {
    const slot = index % 3;
    if (slot === 2) return 'full';
    if (slot === 1) return 'small';
    return index === total - 1 ? 'full' : 'large';
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

  /**
   * Reveals the cards from `fromIndex` on. A full re-run (the default) first discards the previous
   * tweens and their ScrollTriggers, which would otherwise stay bound to removed nodes.
   */
  private animateCards(fromIndex = 0): void {
    if (fromIndex === 0) this.killCardTweens();

    const host = this.sectionRef.nativeElement;
    const grid = host.querySelector<HTMLElement>('.projects-list__grid');
    const cards = Array.from(host.querySelectorAll<HTMLElement>('.project-card')).slice(fromIndex);

    // A "load more" batch triggers off its own first card, so it reveals as the reader
    // reaches it rather than off the grid top, which is long past by then.
    const trigger = fromIndex === 0 ? grid : cards[0];

    if (trigger && cards.length) {
      this.cardTweens.push(this.anim.scaleIn(cards, trigger, { stagger: 0.08, start: 'top 88%', delay: 0.05 }));
    }

    // Filtering and paging change the page height, so every ScrollTrigger below this section
    // holds stale start/end positions and would never fire, leaving those sections invisible.
    requestAnimationFrame(() => this.anim.refresh());
  }

  private killCardTweens(): void {
    this.cardTweens.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
    this.cardTweens = [];
  }
}
