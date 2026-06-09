import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-contact-cta',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-cta.html',
  styleUrl: './contact-cta.scss',
})
export class ContactCta implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const titleSpans = host.querySelectorAll<HTMLElement>('.contact-cta__title span, .contact-cta__title strong');
    const text = host.querySelector<HTMLElement>('.contact-cta__text');
    const button = host.querySelector<HTMLElement>('.contact-cta__button');

    if (titleSpans.length) this.anim.clipReveal(titleSpans, host, { stagger: 0.1, start: 'top 85%' });
    if (text) this.anim.fadeUp(text, host, { y: 25, start: 'top 83%', delay: 0.2 });
    if (button) this.anim.scaleIn(button, host, { start: 'top 82%', delay: 0.35 });
  }
}
