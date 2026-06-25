import { AfterViewInit, Component, ElementRef, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectsService } from '../../../services/projects.service';
import { Project } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

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

  projects: Project[] = [];
  private viewReady = false;

  ngOnInit(): void {
    this.projectsService.getAll().subscribe((projects) => {
      this.projects = projects;
      if (this.viewReady) setTimeout(() => this.setupAnimations());
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.projects.length) setTimeout(() => this.setupAnimations());
  }

  private setupAnimations(): void {
    const host = this.sectionRef.nativeElement;
    const tabs = host.querySelectorAll<HTMLElement>('.projects-tabs__item');
    const cards = host.querySelectorAll<HTMLElement>('.project-card');
    const grid = host.querySelector<HTMLElement>('.projects-list__grid');

    if (tabs.length) this.anim.fadeUp(tabs, host, { y: 20, stagger: 0.07, start: 'top 90%' });
    if (grid && cards.length) this.anim.scaleIn(cards, grid, { stagger: 0.08, start: 'top 88%', delay: 0.05 });
  }
}
