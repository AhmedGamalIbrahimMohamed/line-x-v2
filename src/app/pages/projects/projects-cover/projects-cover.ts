import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-projects-cover',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './projects-cover.html',
  styleUrl: './projects-cover.scss',
})
export class ProjectsCover implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const image = host.querySelector<HTMLElement>('.projects-cover__image');
    const stats = host.querySelectorAll<HTMLElement>('.projects-cover__stat');

    if (image) this.anim.scaleIn(image, host, { scale: 0.94, duration: 1.1, start: 'top 90%' });
    if (stats.length) this.anim.fadeUp(stats, host, { y: 35, stagger: 0.13, start: 'top 85%', delay: 0.2 });
  }
}
