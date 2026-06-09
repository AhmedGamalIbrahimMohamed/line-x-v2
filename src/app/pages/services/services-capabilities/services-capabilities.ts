import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

type Capability = {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  bullets: string[];
};

@Component({
  selector: 'app-services-capabilities',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './services-capabilities.html',
  styleUrl: './services-capabilities.scss',
})
export class ServicesCapabilities implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly capabilities: Capability[] = [
    {
      number: '01', title: 'Services.capabilities.items.0.title', description: 'Services.capabilities.items.0.description',
      image: 'assets/images/figma2/services-capability-1.jpg', imageAlt: 'Architectural desk with plans and materials',
      bullets: ['Services.capabilities.items.0.bullets.0', 'Services.capabilities.items.0.bullets.1', 'Services.capabilities.items.0.bullets.2', 'Services.capabilities.items.0.bullets.3'],
    },
    {
      number: '02', title: 'Services.capabilities.items.1.title', description: 'Services.capabilities.items.1.description',
      image: 'assets/images/figma2/services-capability-2.jpg', imageAlt: 'Technical architectural model and drawings',
      bullets: ['Services.capabilities.items.1.bullets.0', 'Services.capabilities.items.1.bullets.1', 'Services.capabilities.items.1.bullets.2', 'Services.capabilities.items.1.bullets.3'],
    },
    {
      number: '03', title: 'Services.capabilities.items.2.title', description: 'Services.capabilities.items.2.description',
      image: 'assets/images/figma2/services-capability-3.jpg', imageAlt: 'Construction site structure in progress',
      bullets: ['Services.capabilities.items.2.bullets.0', 'Services.capabilities.items.2.bullets.1', 'Services.capabilities.items.2.bullets.2', 'Services.capabilities.items.2.bullets.3'],
    },
    {
      number: '04', title: 'Services.capabilities.items.3.title', description: 'Services.capabilities.items.3.description',
      image: 'assets/images/figma2/services-capability-4.jpg', imageAlt: 'Building facade restoration detail',
      bullets: ['Services.capabilities.items.3.bullets.0', 'Services.capabilities.items.3.bullets.1', 'Services.capabilities.items.3.bullets.2', 'Services.capabilities.items.3.bullets.3'],
    },
  ];

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.services-capabilities__eyebrow');
    const title = host.querySelector<HTMLElement>('h2');
    const cards = host.querySelectorAll<HTMLElement>('.capability-card');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 88%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 87%' });

    cards.forEach((card, i) => {
      const content = card.querySelector<HTMLElement>('.capability-card__content');
      const media = card.querySelector<HTMLElement>('.capability-card__media');
      const isEven = i % 2 === 1;

      if (content) this.anim.slideFromLeft(content, card, { x: isEven ? 60 : -60, start: 'top 86%' });
      if (media) this.anim.slideFromRight(media, card, { x: isEven ? -60 : 60, start: 'top 86%' });
    });
  }
}
