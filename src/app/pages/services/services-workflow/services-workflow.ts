import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

type WorkflowStep = {
  number: string;
  label: string;
};

@Component({
  selector: 'app-services-workflow',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './services-workflow.html',
  styleUrl: './services-workflow.scss',
})
export class ServicesWorkflow implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly steps: WorkflowStep[] = [
    { number: '01', label: 'Services.workflow.steps.0' },
    { number: '02', label: 'Services.workflow.steps.1' },
    { number: '03', label: 'Services.workflow.steps.2' },
    { number: '04', label: 'Services.workflow.steps.3' },
    { number: '05', label: 'Services.workflow.steps.4' },
    { number: '06', label: 'Services.workflow.steps.5' },
  ];

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow = host.querySelector<HTMLElement>('.services-workflow__eyebrow');
    const title = host.querySelector<HTMLElement>('h2');
    const steps = host.querySelectorAll<HTMLElement>('.workflow-step');

    if (eyebrow) this.anim.fadeUp(eyebrow, host, { y: 25, start: 'top 88%' });
    if (title) this.anim.clipReveal(title, host, { start: 'top 87%' });
    if (steps.length) this.anim.fadeUp(steps, host, { y: 40, stagger: 0.1, start: 'top 85%', delay: 0.15 });
  }
}
