import { AfterViewInit, Component, ElementRef, Input, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';
import { ProjectSpatialExperience } from '../../../models/project.model';
import { LocalizePipe } from '../../../pipes/localize.pipe';

@Component({
  selector: 'app-selected-project-spatial-experience',
  imports: [TranslateModule, LocalizePipe],
  templateUrl: './selected-project-spatial-experience.html',
  styleUrl: './selected-project-spatial-experience.scss',
})
export class SelectedProjectSpatialExperience implements AfterViewInit {
  @Input({ required: true }) spatialExperience!: ProjectSpatialExperience;
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const media = host.querySelector<HTMLElement>('.spatial-experience__media');
    const title = host.querySelector<HTMLElement>('.spatial-experience__title');
    const text = host.querySelector<HTMLElement>('.spatial-experience__text');

    if (media) this.anim.slideFromLeft(media, host, { x: -55, start: 'top 87%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 86%', duration: 1.0 });
    if (text) this.anim.fadeUp(text, host, { y: 30, start: 'top 84%', delay: 0.2 });
  }
}
