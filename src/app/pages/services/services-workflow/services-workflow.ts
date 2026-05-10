import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

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
export class ServicesWorkflow {
  readonly steps: WorkflowStep[] = [
    { number: '01', label: 'Services.workflow.steps.0' },
    { number: '02', label: 'Services.workflow.steps.1' },
    { number: '03', label: 'Services.workflow.steps.2' },
    { number: '04', label: 'Services.workflow.steps.3' },
    { number: '05', label: 'Services.workflow.steps.4' },
    { number: '06', label: 'Services.workflow.steps.5' },
  ];
}
