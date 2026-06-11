import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss',
})
export class CtaSectionComponent implements AfterViewInit {
  @Input() page: string = 'Home';
  @Input() primaryRoute: string = '/contact';
  @Input() secondaryRoute: string = '/projects';

  isExternal(route: string): boolean {
    return route.startsWith('tel:') || route.startsWith('mailto:') || route.startsWith('#');
  }

  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const title = host.querySelectorAll<HTMLElement>('.cta-section__title-light, .cta-section__title-bold');
    const desc = host.querySelector<HTMLElement>('.cta-section__description');
    const actions = host.querySelector<HTMLElement>('.cta-section__actions');

    if (title.length) this.anim.clipReveal(title, host, { stagger: 0.1, start: 'top 85%' });
    if (desc) this.anim.fadeUp(desc, host, { y: 30, start: 'top 83%', delay: 0.25 });
    if (actions) this.anim.fadeUp(actions, host, { y: 25, start: 'top 82%', delay: 0.4 });
  }
}
