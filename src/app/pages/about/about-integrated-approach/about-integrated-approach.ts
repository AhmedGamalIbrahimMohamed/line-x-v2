import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type FlowStep = {
  number: string;
  title: string;
  description: string;
  featured?: boolean;
};

@Component({
  selector: 'app-about-integrated-approach',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-integrated-approach.html',
  styleUrl: './about-integrated-approach.scss',
})
export class AboutIntegratedApproach {
  readonly steps: FlowStep[] = [
    {
      number: '01',
      title: 'About.integratedApproach.steps.0.title',
      description: 'About.integratedApproach.steps.0.description',
    },
    {
      number: '02',
      title: 'About.integratedApproach.steps.1.title',
      description: 'About.integratedApproach.steps.1.description',
    },
    {
      number: '03',
      title: 'About.integratedApproach.steps.2.title',
      description: 'About.integratedApproach.steps.2.description',
      featured: true,
    },
  ];
}
