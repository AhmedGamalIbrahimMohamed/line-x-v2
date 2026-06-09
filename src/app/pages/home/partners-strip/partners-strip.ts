import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-partners-strip',
  standalone: true,
  templateUrl: './partners-strip.html',
  styleUrl: './partners-strip.scss',
})
export class PartnersStripComponent implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    this.anim.fadeUp(host, host, { y: 30, stagger: 0, duration: 0.8, start: 'top 92%' });
  }
}
