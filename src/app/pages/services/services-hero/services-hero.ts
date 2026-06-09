import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-services-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './services-hero.html',
  styleUrl: './services-hero.scss',
})
export class ServicesHero implements AfterViewInit {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.services-hero__eyebrow');
    const lines = host.querySelectorAll<HTMLElement>('.services-hero__title-italic, .services-hero__title-bold');
    const desc = host.querySelector<HTMLElement>('.services-hero__description');

    this.anim.heroEntrance(eyebrow, lines, desc, null);
  }
}
