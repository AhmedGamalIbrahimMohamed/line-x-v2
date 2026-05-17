import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface Slide {
  subtitle: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-expertise-section',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './expertise-section.html',
  styleUrl: './expertise-section.scss',
})
export class ExpertiseSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('expertiseSection') sectionRef!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  readonly slides: Slide[] = [
    {
      subtitle: 'Home.expertise.slides.0.subtitle',
      description: 'Home.expertise.slides.0.description',
      image: 'assets/images/figma2/expertise-1.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.1.subtitle',
      description: 'Home.expertise.slides.1.description',
      image: 'assets/images/figma2/expertise-2.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.2.subtitle',
      description: 'Home.expertise.slides.2.description',
      image: 'assets/images/figma2/expertise-3.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.3.subtitle',
      description: 'Home.expertise.slides.3.description',
      image: 'assets/images/figma2/expertise-4.jpg',
    },
  ];

  activeIndex = 0;
  isChanging = false;

  private isMobile = false;
  private isTransitioning = false;
  private readonly FADE_DURATION = 210;
  private readonly TRANSITION_COOLDOWN = 950;
  private wheelHandler!: (e: WheelEvent) => void;

  ngAfterViewInit(): void {
    this.checkMobile();
    this.syncInitialSlide();
    this.zone.runOutsideAngular(() => {
      this.wheelHandler = (e: WheelEvent) => this.onWheel(e);
      window.addEventListener('wheel', this.wheelHandler, { passive: false });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.wheelHandler);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    if (this.isMobile) this.activeIndex = 0;
  }

  selectStep(index: number): void {
    if (!this.isMobile) {
      this.scrollToSlide(index);
    }
    this.changeSlide(index);
  }

  stepLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 991;
  }

  /** Sync activeIndex on initial load in case the page loads mid-section. */
  private syncInitialSlide(): void {
    if (this.isMobile || !this.sectionRef) return;
    const section = this.sectionRef.nativeElement;
    const rect = section.getBoundingClientRect();
    const stageH = window.innerHeight;
    const scrollRange = section.offsetHeight - stageH;
    if (scrollRange <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
    this.activeIndex = Math.min(
      this.slides.length - 1,
      Math.floor(progress * this.slides.length)
    );
  }

  private onWheel(e: WheelEvent): void {
    if (this.isMobile || !this.sectionRef) return;

    const section = this.sectionRef.nativeElement;
    const rect = section.getBoundingClientRect();
    const stageH = window.innerHeight;

    // Only intercept while the stage is pinned (sticky phase).
    const isSticky = rect.top <= 2 && rect.bottom >= stageH - 2;
    if (!isSticky) return;

    // Ignore tiny/accidental scrolls — require a meaningful wheel delta.
    const MIN_DELTA = 30;
    if (Math.abs(e.deltaY) < MIN_DELTA) {
      e.preventDefault();
      return;
    }

    const goingDown = e.deltaY > 0;

    // Swallow all wheel events while a transition is in progress.
    if (this.isTransitioning) {
      e.preventDefault();
      return;
    }

    const sectionAbsTop = window.scrollY + rect.top;
    const scrollRange = section.offsetHeight - stageH;

    // Last slide scrolling down → smoothly exit the section.
    if (goingDown && this.activeIndex === this.slides.length - 1) {
      e.preventDefault();
      this.isTransitioning = true;
      window.scrollTo({ top: sectionAbsTop + scrollRange + 10, behavior: 'smooth' });
      setTimeout(() => (this.isTransitioning = false), this.TRANSITION_COOLDOWN);
      return;
    }

    // First slide scrolling up → smoothly exit the section upward.
    if (!goingDown && this.activeIndex === 0) {
      e.preventDefault();
      this.isTransitioning = true;
      window.scrollTo({ top: Math.max(0, sectionAbsTop - 10), behavior: 'smooth' });
      setTimeout(() => (this.isTransitioning = false), this.TRANSITION_COOLDOWN);
      return;
    }

    // Navigate to the adjacent slide.
    e.preventDefault();
    this.isTransitioning = true;
    const newIndex = goingDown ? this.activeIndex + 1 : this.activeIndex - 1;
    this.scrollToSlide(newIndex);
    this.zone.run(() => this.changeSlide(newIndex));
    setTimeout(() => (this.isTransitioning = false), this.TRANSITION_COOLDOWN);
  }

  /** Fade out text, swap content, fade back in. */
  private changeSlide(newIndex: number): void {
    this.isChanging = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.activeIndex = newIndex;
      this.isChanging = false;
      this.cdr.detectChanges();
    }, this.FADE_DURATION);
  }

  /** Programmatically scroll the page so the section's scroll offset matches the target slide. */
  private scrollToSlide(index: number): void {
    if (!this.sectionRef) return;
    const section = this.sectionRef.nativeElement;
    const rect = section.getBoundingClientRect();
    const stageH = window.innerHeight;
    const scrollRange = section.offsetHeight - stageH;
    const sectionAbsTop = window.scrollY + rect.top;
    const targetY = sectionAbsTop + (index / this.slides.length) * scrollRange;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
}
