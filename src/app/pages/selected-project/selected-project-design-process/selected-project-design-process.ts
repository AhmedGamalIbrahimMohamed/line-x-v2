import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

@Component({
  selector: 'app-selected-project-design-process',
  imports: [TranslateModule],
  templateUrl: './selected-project-design-process.html',
  styleUrl: './selected-project-design-process.scss',
})
export class SelectedProjectDesignProcess implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const label = host.querySelector<HTMLElement>('.design-process__label');
    const figures = host.querySelectorAll<HTMLElement>('.design-process__image');

    if (label) this.anim.fadeUp(label, host, { y: 25, start: 'top 90%' });
    if (figures.length) this.anim.scaleIn(figures, host, { stagger: 0.1, start: 'top 88%', delay: 0.1 });
  }
}
