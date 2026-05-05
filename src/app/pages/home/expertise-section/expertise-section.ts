import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Slide {
  subtitle: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-expertise-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './expertise-section.html',
  styleUrl: './expertise-section.scss',
})
export class ExpertiseSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('expertiseSection') sectionRef!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);

  readonly slides: Slide[] = [
    {
      subtitle: 'Architectural Design',
      description: 'Designing functional, aesthetic, and context-driven architectural solutions.',
      image: 'assets/images/figma2/expertise-1.jpg',
    },
    {
      subtitle: 'Technical Engineering',
      description: 'Providing precise technical documentation to ensure accurate and efficient execution.',
      image: 'assets/images/figma2/expertise-2.jpg',
    },
    {
      subtitle: 'Construction & Contracting',
      description: 'Delivering projects with high standards, efficiency, and full execution control.',
      image: 'assets/images/figma2/expertise-3.jpg',
    },
    {
      subtitle: 'Maintenance & Restoration',
      description: 'Ensuring long-term performance and sustainability of built environments.',
      image: 'assets/images/figma2/expertise-4.jpg',
    },
  ];

  activeIndex = 0;

  private rafId = 0;
  private isMobile = false;

  ngAfterViewInit(): void {
    this.checkMobile();
    this.update();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.update());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    if (this.isMobile) this.activeIndex = 0;
  }

  selectStep(index: number): void {
    this.activeIndex = index;
  }

  stepLabel(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 991;
  }

  private update(): void {
    if (this.isMobile || !this.sectionRef) return;

    const section = this.sectionRef.nativeElement;
    const rect = section.getBoundingClientRect();
    const stageH = window.innerHeight;
    const scrollRange = section.offsetHeight - stageH;

    if (scrollRange <= 0) return;

    const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
    const newIndex = Math.min(
      this.slides.length - 1,
      Math.floor(progress * this.slides.length)
    );

    if (newIndex !== this.activeIndex) {
      this.activeIndex = newIndex;
      this.cdr.detectChanges();
    }
  }
}
