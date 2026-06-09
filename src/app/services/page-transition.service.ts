import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { gsap } from 'gsap';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageTransitionService {
  private router = inject(Router);
  private overlay: HTMLElement | null = null;

  init(): void {
    this.overlay = document.getElementById('page-transition-overlay');

    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.playExit());

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        this.playEnter();
      });
  }

  private playExit(): void {
    if (!this.overlay) return;
    gsap.fromTo(
      this.overlay,
      { scaleY: 0, transformOrigin: 'bottom center', autoAlpha: 1 },
      { scaleY: 1, duration: 0.45, ease: 'power3.inOut' }
    );
  }

  private playEnter(): void {
    if (!this.overlay) return;
    gsap.to(this.overlay, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 0.5,
      delay: 0.05,
      ease: 'power3.inOut',
      onComplete: () => gsap.set(this.overlay!, { autoAlpha: 0 }),
    });
  }
}
