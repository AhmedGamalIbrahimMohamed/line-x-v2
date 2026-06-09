import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-contact-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-hero.html',
  styleUrl: './contact-hero.scss',
})
export class ContactHero implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const image = host.querySelector<HTMLElement>('.contact-hero__image');
    const title = host.querySelector<HTMLElement>('#contact-title');
    const line = host.querySelector<HTMLElement>('.contact-hero__line');

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (image) {
      tl.fromTo(image, { scale: 1.12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 }, 0);
    }
    if (title) {
      tl.fromTo(title, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.4);
    }
    if (line) {
      tl.fromTo(line, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.8 }, '-=0.4');
    }
  }
}
