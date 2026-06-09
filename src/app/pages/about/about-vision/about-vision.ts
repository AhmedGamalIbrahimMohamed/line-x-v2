import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

type VisionCard = {
  title: string;
  description: string;
  tabletHidden?: boolean;
};

@Component({
  selector: 'app-about-vision',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-vision.html',
  styleUrl: './about-vision.scss',
})
export class AboutVision implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly cards: VisionCard[] = [
    { title: 'About.vision.cards.1.title', description: 'About.vision.cards.1.description' },
    { title: 'About.vision.cards.0.title', description: 'About.vision.cards.0.description', tabletHidden: true },
    { title: 'About.vision.cards.2.title', description: 'About.vision.cards.2.description' },
  ];

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.about-vision__eyebrow');
    const title = host.querySelector<HTMLElement>('h2');
    const cards = host.querySelectorAll<HTMLElement>('.vision-card');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 88%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 87%' });
    if (cards.length) this.anim.scaleIn(cards, host, { stagger: 0.12, start: 'top 85%', delay: 0.1 });
  }
}
