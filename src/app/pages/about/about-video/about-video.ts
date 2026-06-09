import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-about-video',
  standalone: true,
  templateUrl: './about-video.html',
  styleUrl: './about-video.scss',
})
export class AboutVideo implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const media = host.querySelector<HTMLElement>('.about-video__media');
    if (media) this.anim.scaleIn(media, host, { scale: 0.92, duration: 1.1, start: 'top 88%' });
  }
}
