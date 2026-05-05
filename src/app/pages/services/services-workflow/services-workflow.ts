import { Component } from '@angular/core';

type WorkflowStep = {
  number: string;
  label: string;
};

@Component({
  selector: 'app-services-workflow',
  standalone: true,
  templateUrl: './services-workflow.html',
  styleUrl: './services-workflow.scss',
})
export class ServicesWorkflow {
  readonly steps: WorkflowStep[] = [
    { number: '01', label: 'Concept' },
    { number: '02', label: 'Design' },
    { number: '03', label: 'Engineering' },
    { number: '04', label: 'Construction' },
    { number: '05', label: 'Delivery' },
    { number: '06', label: 'Maintenance' },
  ];
}
