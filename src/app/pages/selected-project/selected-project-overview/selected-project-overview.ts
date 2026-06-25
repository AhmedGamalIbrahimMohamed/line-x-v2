import { AfterViewInit, Component, ElementRef, Input, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectOverview } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

@Component({
  selector: 'app-selected-project-overview',
  imports: [TranslateModule, LocalizePipe],
  templateUrl: './selected-project-overview.html',
  styleUrl: './selected-project-overview.scss',
})
export class SelectedProjectOverview implements AfterViewInit {
  @Input({ required: true }) overview!: ProjectOverview;
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const items = host.querySelectorAll<HTMLElement>('.project-overview__item');

    items.forEach((item, i) => {
      // .project-overview__item has display:contents — no layout box for ScrollTrigger.
      // Use the child containers which are position:absolute and have measurable bounds.
      const headingBox = item.querySelector<HTMLElement>('.project-overview__heading');
      const contentBox = item.querySelector<HTMLElement>('.project-overview__content');
      const numberSpan = item.querySelector<HTMLElement>('.project-overview__heading span');
      const h2 = item.querySelector<HTMLElement>('h2');
      const paragraphs = item.querySelectorAll<HTMLElement>('p');

      if (headingBox) {
        if (numberSpan) this.anim.fadeUp(numberSpan, headingBox, { y: 20, start: 'top 90%' });
        if (h2) this.anim.clipReveal(h2, headingBox, { start: 'top 87%' });
      }

      if (contentBox && paragraphs.length) {
        this.anim.fadeUp(paragraphs, contentBox, { y: 30, stagger: 0.13, start: 'top 88%', delay: 0.08 * i });
      }
    });
  }
}
