import { NgIf } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { gsap } from 'gsap';

/** Set once the intro has played, so it shows once per browser session instead of on every full page load. */
const INTRO_SEEN_KEY = 'x-line-intro-seen';

/** Upper bound on how long the intro blocks the page, even if the video is longer. */
const INTRO_MAX_MS = 4000;

@Component({
  selector: 'app-intro-overlay',
  standalone: true,
  imports: [NgIf],
  templateUrl: './intro-overlay.html',
  styleUrl: './intro-overlay.scss',
})
export class IntroOverlay implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('overlay') private overlay?: ElementRef<HTMLElement>;
  @ViewChild('video') private video?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoMobile') private videoMobile?: ElementRef<HTMLVideoElement>;
  @ViewChild('skipButton') private skipButton?: ElementRef<HTMLButtonElement>;

  visible = false;

  private timeline?: gsap.core.Timeline;
  private hasPlayed = false;
  private pendingAnimation = false;
  private maxDurationTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    queueMicrotask(() => this.playIntro());
  }

  ngAfterViewChecked(): void {
    if (!this.pendingAnimation || !this.overlay || !this.video || !this.videoMobile || !this.skipButton) {
      return;
    }

    this.pendingAnimation = false;
    this.runIntroAnimation();
  }

  ngOnDestroy(): void {
    clearTimeout(this.maxDurationTimer);
    this.timeline?.kill();
    document.body.classList.remove('intro-scroll-lock');
  }

  private playIntro(): void {
    if (this.hasPlayed) {
      return;
    }

    this.hasPlayed = true;

    if (this.shouldSkipIntro()) {
      return;
    }

    this.rememberIntroSeen();
    this.visible = true;
    this.pendingAnimation = true;
    document.body.classList.add('intro-scroll-lock');
  }

  /** Skip for returning visitors in the same session and for visitors who prefer reduced motion. */
  private shouldSkipIntro(): boolean {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }

    try {
      return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  }

  private rememberIntroSeen(): void {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      // Without storage the intro simply plays again on the next load.
    }
  }

  skipIntro(): void {
    if (!this.visible || !this.overlay) {
      return;
    }

    clearTimeout(this.maxDurationTimer);
    this.timeline?.kill();
    this.closeIntro(0.5);
  }

  finishIntro(): void {
    if (!this.visible || !this.overlay) {
      return;
    }

    clearTimeout(this.maxDurationTimer);
    this.timeline?.kill();
    this.closeIntro(0.8);
  }

  private runIntroAnimation(): void {
    const overlay = this.overlay!.nativeElement;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const activeVideo = isMobile
      ? this.videoMobile!.nativeElement
      : this.video!.nativeElement;
    const skipButton = this.skipButton!.nativeElement;

    activeVideo.muted = true;
    activeVideo.loop = false;
    void activeVideo.play().catch(() => undefined);
    this.maxDurationTimer = setTimeout(() => this.finishIntro(), INTRO_MAX_MS);

    this.timeline?.kill();
    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    this.timeline
      .set(overlay, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)' })
      .set(activeVideo, { autoAlpha: 1, scale: 1, clearProps: 'filter' })
      .fromTo(activeVideo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0)
      .fromTo(skipButton, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.3);
  }

  private closeIntro(duration: number): void {
    const overlay = this.overlay!.nativeElement;

    gsap
      .timeline({
        defaults: { ease: 'expo.inOut' },
        onComplete: () => {
          document.body.classList.remove('intro-scroll-lock');
          this.visible = false;
        },
      })
      .to(overlay, { clipPath: 'inset(0% 0% 100% 0%)', duration }, 0)
      .to(overlay, { autoAlpha: 0, duration: 0.18 }, duration * 0.7);
  }
}
