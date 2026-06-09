import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-about-who-we-are',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-who-we-are.html',
  styleUrl: './about-who-we-are.scss',
})
export class AboutWhoWeAre implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.about-who__eyebrow');
    const title = host.querySelector<HTMLElement>('h2');
    const line = host.querySelector<HTMLElement>('.about-who__line');
    const paragraphs = host.querySelectorAll<HTMLElement>('.about-who__copy p');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 88%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 86%', duration: 1.0 });
    if (line) this.anim.lineGrow(line, host, { start: 'top 84%', delay: 0.2 });
    if (paragraphs.length) this.anim.fadeUp(paragraphs, host, { y: 35, stagger: 0.16, start: 'top 82%', delay: 0.15 });
  }
}
