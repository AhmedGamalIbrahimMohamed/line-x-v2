import { AfterViewInit, Component, ElementRef, OnDestroy, inject, ViewChild } from '@angular/core';
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
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection') private heroSection!: ElementRef<HTMLElement>;
  @ViewChild('heroVideo') private heroVideo?: ElementRef<HTMLVideoElement>;

  private anim = inject(ScrollAnimationService);

  private cleanups: Array<() => void> = [];

  ngAfterViewInit(): void {
    const host = this.heroSection.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.hero-eyebrow');
    const lines = host.querySelectorAll<HTMLElement>('.hero-line');
    const desc = host.querySelector<HTMLElement>('.hero-description');
    const actions = host.querySelector<HTMLElement>('.hero-actions');
    const video = this.heroVideo?.nativeElement;

    this.anim.heroEntrance(eyebrow, lines, desc, actions);

    if (video) {
      this.anim.parallaxLayer(video, { speed: -20 });
      this.startVideo(video);
    }
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((off) => off());
    this.cleanups = [];
  }

  /**
   * The `autoplay`/`muted` attributes alone are unreliable here: Angular builds
   * the element at runtime, so the browser can evaluate its autoplay policy
   * before `muted` is reflected and leave the video paused on its first frame.
   * Set the properties, then drive playback ourselves — same approach as the
   * intro overlay.
   */
  private startVideo(video: HTMLVideoElement): void {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = () => {
      if (video.paused) {
        void video.play().catch(() => undefined);
      }
    };

    tryPlay();

    // Retry once the data is ready, when the tab comes back, and — as a last
    // resort — on the first user gesture, which always satisfies the policy.
    this.on(video, 'loadeddata', tryPlay);
    this.on(video, 'canplay', tryPlay);
    this.on(video, 'ended', tryPlay);
    this.on(document, 'visibilitychange', tryPlay);
    this.on(window, 'pageshow', tryPlay);

    const onGesture = () => {
      tryPlay();
      gestureEvents.forEach((type) => document.removeEventListener(type, onGesture));
    };
    const gestureEvents = ['pointerdown', 'touchstart', 'keydown'];
    gestureEvents.forEach((type) => document.addEventListener(type, onGesture, { passive: true }));
    this.cleanups.push(() => gestureEvents.forEach((type) => document.removeEventListener(type, onGesture)));
  }

  private on(target: EventTarget, type: string, handler: () => void): void {
    target.addEventListener(type, handler);
    this.cleanups.push(() => target.removeEventListener(type, handler));
  }
}
