import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  imports: [RouterLink, TranslateModule],
})
export class HeroComponent implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.hero-eyebrow');
    const lines = host.querySelectorAll<HTMLElement>('.hero-line');
    const desc = host.querySelector<HTMLElement>('.hero-description');
    const actions = host.querySelector<HTMLElement>('.hero-actions');
    const layers = host.querySelectorAll<HTMLElement>('.hero-layer');

    this.anim.heroEntrance(eyebrow, lines, desc, actions);

    layers.forEach((layer, i) => {
      this.anim.parallaxLayer(layer, { speed: -20 - i * 12 });
    });
  }
}
