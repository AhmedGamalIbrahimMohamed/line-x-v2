import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-selected-project-hero',
  imports: [TranslateModule],
  templateUrl: './selected-project-hero.html',
  styleUrl: './selected-project-hero.scss',
})
export class SelectedProjectHero implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const layers = host.querySelectorAll<HTMLElement>('.selected-project__media');
    const eyebrow = host.querySelector<HTMLElement>('.selected-project__eyebrow');
    const title = host.querySelector<HTMLElement>('.selected-project__title');
    const subtitle = host.querySelector<HTMLElement>('.selected-project__subtitle');
    const details = host.querySelectorAll<HTMLElement>('.selected-project__detail');

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(layers, { scale: 1.1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, stagger: 0.07 }, 0);

    if (eyebrow) tl.fromTo(eyebrow, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.4);
    if (title) tl.fromTo(title, { clipPath: 'inset(105% 0% -0.25em 0%)', y: 20 }, { clipPath: 'inset(0% 0% -0.25em 0%)', y: 0, duration: 1.0 }, '-=0.45');
    if (subtitle) tl.fromTo(subtitle, { y: 25, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.5');

    if (details.length) {
      tl.fromTo(details, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1 }, '-=0.4');
    }

    layers.forEach((layer, i) => {
      this.anim.parallaxLayer(layer, { speed: -15 - i * 10 });
    });
  }
}
