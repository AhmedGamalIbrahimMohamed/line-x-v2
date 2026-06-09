import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-projects-projects-section',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './projects-projects-section.html',
  styleUrl: './projects-projects-section.scss',
})
export class ProjectsProjectsSection implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const tabs = host.querySelectorAll<HTMLElement>('.projects-tabs__item');
    const cards = host.querySelectorAll<HTMLElement>('.project-card');
    const grid = host.querySelector<HTMLElement>('.projects-list__grid');

    if (tabs.length) this.anim.fadeUp(tabs, host, { y: 20, stagger: 0.07, start: 'top 90%' });
    if (grid && cards.length) this.anim.scaleIn(cards, grid, { stagger: 0.08, start: 'top 88%', delay: 0.05 });
  }
}
