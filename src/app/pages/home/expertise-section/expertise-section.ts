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
      image: 'assets/images/home/expertise/expertise-1.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.1.subtitle',
      description: 'Home.expertise.slides.1.description',
      image: 'assets/images/home/expertise/expertise-2.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.2.subtitle',
      description: 'Home.expertise.slides.2.description',
      image: 'assets/images/home/expertise/expertise-3.jpg',
    },
    {
      subtitle: 'Home.expertise.slides.3.subtitle',
      description: 'Home.expertise.slides.3.description',
      image: 'assets/images/home/expertise/expertise-4.jpg',
    },
  ];
 
  activeIndex = 0;
  isChanging = false;
 
  private isMobile = false;
  private ticking = false;
  private lastAppliedIndex = 0;
  private readonly FADE_DURATION = 180;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollHandler!: () => void;
 
  ngAfterViewInit(): void {
    this.checkMobile();
    this.syncInitialSlide();
    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => this.onScroll();
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }
 
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
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
    this.setActiveIndex(index);
  }
 
  stepLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
 
  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 991;
  }
 
  /** Sync activeIndex on initial load in case the page loads mid-section. */
  private syncInitialSlide(): void {
    const index = this.indexFromScrollPosition();
    if (index === null) return;
    this.activeIndex = index;
    this.lastAppliedIndex = index;
  }
 
  private onScroll(): void {
    if (this.isMobile || this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      const index = this.indexFromScrollPosition();
      if (index === null || index === this.lastAppliedIndex) return;
      this.lastAppliedIndex = index;
      this.zone.run(() => this.setActiveIndex(index));
    });
  }
 
  /** Derive the active slide purely from how far the pinned stage has been scrolled through —
   *  no wheel interception, so native scroll momentum/inertia is never fought or bounced against. */
  private indexFromScrollPosition(): number | null {
    if (!this.sectionRef) return null;
    const section = this.sectionRef.nativeElement;
    const rect = section.getBoundingClientRect();
    const stageH = window.innerHeight;
    const scrollRange = section.offsetHeight - stageH;
    if (scrollRange <= 0) return null;
 
    const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
    return Math.min(this.slides.length - 1, Math.floor(progress * this.slides.length));
  }
 
  /** Fade out text, swap content, fade back in. */
  private setActiveIndex(index: number): void {
    if (index === this.activeIndex) return;
    this.isChanging = true;
    this.cdr.detectChanges();
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      this.activeIndex = index;
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