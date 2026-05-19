import { NgIf } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { gsap } from 'gsap';

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
  @ViewChild('skipButton') private skipButton?: ElementRef<HTMLButtonElement>;

  visible = false;

  private timeline?: gsap.core.Timeline;
  private hasPlayed = false;
  private pendingAnimation = false;

  ngOnInit(): void {
    queueMicrotask(() => this.playIntro());
  }

  ngAfterViewChecked(): void {
    if (!this.pendingAnimation || !this.overlay || !this.video || !this.skipButton) {
      return;
    }

    this.pendingAnimation = false;
    this.runIntroAnimation();
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
    document.body.classList.remove('intro-scroll-lock');
  }

  private playIntro(): void {
    if (this.hasPlayed) {
      return;
    }

    this.hasPlayed = true;
    this.visible = true;
    this.pendingAnimation = true;
    document.body.classList.add('intro-scroll-lock');
  }

  skipIntro(): void {
    if (!this.visible || !this.overlay) {
      return;
    }

    this.timeline?.kill();
    this.closeIntro(0.5);
  }

  finishIntro(): void {
    if (!this.visible || !this.overlay) {
      return;
    }

    this.timeline?.kill();
    this.closeIntro(0.8);
  }

  private runIntroAnimation(): void {
    const overlay = this.overlay!.nativeElement;
    const video = this.video!.nativeElement;
    const skipButton = this.skipButton!.nativeElement;

    video.muted = true;
    video.loop = false;
    void video.play().catch(() => undefined);

    this.timeline?.kill();
    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    this.timeline
      .set(overlay, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)' })
      .set(video, { autoAlpha: 1, scale: 1, clearProps: 'filter' })
      .fromTo(video, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0)
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
