import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../services/scroll-animation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements AfterViewInit {
  @ViewChild('poweredCredit') private poweredCredit?: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const credit = this.poweredCredit?.nativeElement;
    if (!credit) return;

    const label = credit.querySelector<HTMLElement>('.x-footer__powered-label');

    if (label) this.anim.fadeUp(label, credit, { y: 12, stagger: 0, start: 'top bottom', once: true });
    this.anim.staggerChildren(credit, '.x-footer__powered-char', {
      y: 20,
      duration: 0.7,
      stagger: 0.035,
      delay: 0.12,
      // last block on the page: fire the moment it enters, and never reverse -
      // the mask on .x-footer__powered-mark would otherwise clip the letters away
      start: 'top bottom',
      once: true,
    });
  }
}
