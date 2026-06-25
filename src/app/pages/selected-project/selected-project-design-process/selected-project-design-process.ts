import { AfterViewInit, Component, ElementRef, Input, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectDesignProcess } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

const GROUP_SIZE = 5;

@Component({
  selector: 'app-selected-project-design-process',
  imports: [TranslateModule, LocalizePipe],
  templateUrl: './selected-project-design-process.html',
  styleUrl: './selected-project-design-process.scss',
})
export class SelectedProjectDesignProcess implements AfterViewInit {
  @Input({ required: true }) designProcess!: ProjectDesignProcess;
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  /** Splits the flat image list into repeating [main, planA-1, planA-2, planB-1, planB-2] groups. */
  get imageGroups(): string[][] {
    const images = this.designProcess.images ?? [];
    const groups: string[][] = [];
    for (let i = 0; i < images.length; i += GROUP_SIZE) {
      groups.push(images.slice(i, i + GROUP_SIZE));
    }
    return groups;
  }

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const label = host.querySelector<HTMLElement>('.design-process__label');
    const figures = host.querySelectorAll<HTMLElement>('.design-process__image');

    if (label) this.anim.fadeUp(label, host, { y: 25, start: 'top 90%' });
    if (figures.length) this.anim.scaleIn(figures, host, { stagger: 0.1, start: 'top 88%', delay: 0.1 });
  }
}
