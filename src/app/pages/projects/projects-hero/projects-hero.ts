import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-projects-hero',
  imports: [TranslateModule],
  templateUrl: './projects-hero.html',
  styleUrl: './projects-hero.scss',
})
export class ProjectsHero implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.projects-hero__eyebrow');
    const lines = host.querySelectorAll<HTMLElement>('.projects-hero__title-italic, .projects-hero__title-bold');
    const desc = host.querySelector<HTMLElement>('.projects-hero__description');

    this.anim.heroEntrance(eyebrow, lines, desc, null);
  }
}
