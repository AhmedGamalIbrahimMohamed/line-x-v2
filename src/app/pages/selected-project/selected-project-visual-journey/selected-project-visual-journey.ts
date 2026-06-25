import { AfterViewInit, Component, ElementRef, Input, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectVisualJourney } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

const GROUP_SIZE = 4;

@Component({
  selector: 'app-selected-project-visual-journey',
  imports: [TranslateModule, LocalizePipe],
  templateUrl: './selected-project-visual-journey.html',
  styleUrl: './selected-project-visual-journey.scss',
})
export class SelectedProjectVisualJourney implements AfterViewInit {
  @Input({ required: true }) visualJourney!: ProjectVisualJourney;
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  /** Splits the flat image list into repeating [big, smallTop, smallBottom, band] groups. */
  get imageGroups(): string[][] {
    const images = this.visualJourney.images ?? [];
    const groups: string[][] = [];
    for (let i = 0; i < images.length; i += GROUP_SIZE) {
      groups.push(images.slice(i, i + GROUP_SIZE));
    }
    return groups;
  }

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const label = host.querySelector<HTMLElement>('.visual-journey__label');
    const figures = host.querySelectorAll<HTMLElement>('.visual-journey__image');

    if (label) this.anim.fadeUp(label, host, { y: 25, start: 'top 90%' });
    if (figures.length) this.anim.scaleIn(figures, host, { stagger: 0.07, start: 'top 88%', delay: 0.1 });
  }
}
