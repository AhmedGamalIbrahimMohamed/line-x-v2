import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-selected-project-solutions',
  imports: [TranslateModule],
  templateUrl: './selected-project-solutions.html',
  styleUrl: './selected-project-solutions.scss',
})
export class SelectedProjectSolutions implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const media = host.querySelector<HTMLElement>('.solutions__media');
    const title = host.querySelector<HTMLElement>('.solutions__title');
    const text = host.querySelector<HTMLElement>('.solutions__text');

    if (media) this.anim.slideFromLeft(media, host, { x: -55, start: 'top 87%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 86%', duration: 1.0 });
    if (text) this.anim.fadeUp(text, host, { y: 30, start: 'top 84%', delay: 0.2 });
  }
}
