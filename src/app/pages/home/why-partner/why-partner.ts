import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-why-partner',
  standalone: true,
  templateUrl: './why-partner.html',
  styleUrls: ['./why-partner.scss'],
})
export class WhyPartnerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('partnerSection') private partnerSection?: ElementRef<HTMLElement>;
  @ViewChild('partnerStage') private partnerStage?: ElementRef<HTMLElement>;
  @ViewChild('partnerMediaWrap') private partnerMediaWrap?: ElementRef<HTMLElement>;
  @ViewChild('partnerRight') private partnerRight?: ElementRef<HTMLElement>;
  @ViewChild('partnerViewport') private partnerViewport?: ElementRef<HTMLElement>;
  @ViewChild('partnerTrack') private partnerTrack?: ElementRef<HTMLElement>;
  @ViewChild('progressRail') private progressRail?: ElementRef<HTMLElement>;
  @ViewChild('progressThumb') private progressThumb?: ElementRef<HTMLElement>;

  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.observeLayout();
    this.scheduleUpdate();
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.resizeObserver?.disconnect();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.updateScene();
      this.rafId = null;
    });
  }

  private updateScene(): void {
    if (
      !this.partnerSection ||
      !this.partnerStage ||
      !this.partnerMediaWrap ||
      !this.partnerRight ||
      !this.partnerViewport ||
      !this.partnerTrack ||
      !this.progressRail ||
      !this.progressThumb
    ) {
      return;
    }

    if (window.innerWidth <= 767) {
      this.resetMobileScene();
      return;
    }

    this.updateDesktopScene();
  }

  private updateDesktopScene(): void {
    const section = this.partnerSection!.nativeElement;
    const stage = this.partnerStage!.nativeElement;
    const mediaWrap = this.partnerMediaWrap!.nativeElement;
    const rightPanel = this.partnerRight!.nativeElement;
    const viewport = this.partnerViewport!.nativeElement;
    const track = this.partnerTrack!.nativeElement;
    const rail = this.progressRail!.nativeElement;
    const thumb = this.progressThumb!.nativeElement;

    const stageHeight = stage.clientHeight || window.innerHeight;
    const sectionWidth = section.clientWidth;

    // Use the section's CSS-governed height (min-height: 320vh).
    // Never override it from JS — that fights the CSS and can break sticky.
    const totalScrollable = Math.max(section.offsetHeight - stageHeight, 1);

    const rect = section.getBoundingClientRect();
    const overallProgress = this.clamp(-rect.top / totalScrollable, 0, 1);

    // 0–34 %  → image shrinks from full width to 50 % (reveal phase)
    // 34–40 % → panel visible, track stationary (hold phase — user sees heading)
    // 40–100% → track scrolls through all feature content
    const revealPhaseEnd = 0.34;
    const holdPhaseEnd   = 0.40;
    const revealProgress = this.clamp(overallProgress / revealPhaseEnd, 0, 1);
    const contentProgress = this.clamp(
      (overallProgress - holdPhaseEnd) / (1 - holdPhaseEnd),
      0,
      1,
    );

    const contentTravel = Math.max(track.scrollHeight - viewport.clientHeight, 0);
    const contentOffset = contentTravel * contentProgress;
    // Panel becomes visible at start of hold phase (not just at end of reveal)
    const isActive = overallProgress >= revealPhaseEnd;

    const splitWidth = sectionWidth / 2;
    const currentWidth = this.lerp(sectionWidth, splitWidth, revealProgress);

    mediaWrap.style.width = `${currentWidth}px`;
    mediaWrap.style.height = `${stageHeight}px`;
    mediaWrap.style.left = '0';
    mediaWrap.style.top = '0';
    mediaWrap.style.transform = 'translate3d(0, 0, 0)';
    mediaWrap.style.clipPath = '';

    rightPanel.style.opacity = isActive ? '1' : '0';
    track.style.transform = `translate3d(0, -${contentOffset}px, 0)`;

    rightPanel.classList.toggle('is-active', isActive);
    rail.classList.toggle('is-active', isActive && contentTravel > 0);

    const trackHeight = Math.max(rail.clientHeight - thumb.clientHeight, 0);
    thumb.style.transform = `translateY(${trackHeight * contentProgress}px)`;
  }

  private resetMobileScene(): void {
    const section = this.partnerSection!.nativeElement;
    const mediaWrap = this.partnerMediaWrap!.nativeElement;
    const rightPanel = this.partnerRight!.nativeElement;
    const track = this.partnerTrack!.nativeElement;
    const rail = this.progressRail!.nativeElement;
    const thumb = this.progressThumb!.nativeElement;

    section.style.height = '';
    mediaWrap.style.width = '100%';
    mediaWrap.style.height = '100svh';
    mediaWrap.style.left = '0';
    mediaWrap.style.top = '0';
    mediaWrap.style.transform = 'translate3d(0, 0, 0)';
    mediaWrap.style.clipPath = '';

    rightPanel.style.opacity = '1';
    rightPanel.classList.add('is-active');
    rail.classList.remove('is-active');
    track.style.transform = 'translate3d(0, 0, 0)';
    thumb.style.transform = 'translateY(0)';
  }

  private observeLayout(): void {
    if (
      !this.partnerSection ||
      !this.partnerStage ||
      !this.partnerViewport ||
      !this.partnerTrack ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());

    this.resizeObserver.observe(this.partnerSection.nativeElement);
    this.resizeObserver.observe(this.partnerStage.nativeElement);
    this.resizeObserver.observe(this.partnerViewport.nativeElement);
    this.resizeObserver.observe(this.partnerTrack.nativeElement);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }
}
