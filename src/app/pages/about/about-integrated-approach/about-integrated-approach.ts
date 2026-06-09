import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

type FlowStep = {
  number: string;
  title: string;
  description: string;
  featured?: boolean;
};

@Component({
  selector: 'app-about-integrated-approach',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-integrated-approach.html',
  styleUrl: './about-integrated-approach.scss',
})
export class AboutIntegratedApproach implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly steps: FlowStep[] = [
    { number: '01', title: 'About.integratedApproach.steps.0.title', description: 'About.integratedApproach.steps.0.description' },
    { number: '02', title: 'About.integratedApproach.steps.1.title', description: 'About.integratedApproach.steps.1.description' },
    { number: '03', title: 'About.integratedApproach.steps.2.title', description: 'About.integratedApproach.steps.2.description' },
  ];

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.about-approach__eyebrow');
    const title = host.querySelector<HTMLElement>('h2');
    const intro = host.querySelector<HTMLElement>('.about-approach__intro');
    const cards = host.querySelectorAll<HTMLElement>('.approach-card');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 88%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 87%' });
    if (intro) this.anim.fadeUp(intro, host, { y: 25, start: 'top 85%', delay: 0.2 });
    if (cards.length) this.anim.fadeUp(cards, host, { y: 45, stagger: 0.15, start: 'top 84%', delay: 0.1 });
  }
}
