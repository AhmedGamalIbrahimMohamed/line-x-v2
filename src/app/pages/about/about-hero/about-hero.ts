import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-about-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-hero.html',
  styleUrl: './about-hero.scss',
})
export class AboutHero implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.about-hero__eyebrow');
    const lines = host.querySelectorAll<HTMLElement>('.about-hero__title-italic, .about-hero__title-bold');
    const desc = host.querySelector<HTMLElement>('.about-hero__description');

    this.anim.heroEntrance(eyebrow, lines, desc, null);
  }
}
