import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-selected-project-solution',
  imports: [TranslateModule],
  templateUrl: './selected-project-solution.html',
  styleUrl: './selected-project-solution.scss',
})
export class SelectedProjectSolution implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const kicker = host.querySelector<HTMLElement>('.solution__kicker');
    const title = host.querySelector<HTMLElement>('.solution__title');
    const paragraphs = host.querySelectorAll<HTMLElement>('.solution__quote, .solution__body');

    if (kicker) this.anim.fadeUp(kicker, host, { y: 20, start: 'top 90%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 88%' });
    if (paragraphs.length) this.anim.fadeUp(paragraphs, host, { y: 30, stagger: 0.12, start: 'top 86%', delay: 0.1 });
  }
}
