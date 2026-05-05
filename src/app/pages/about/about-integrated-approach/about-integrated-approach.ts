import { Component } from '@angular/core';

type FlowStep = {
  number: string;
  title: string;
  description: string;
  featured?: boolean;
};

@Component({
  selector: 'app-about-integrated-approach',
  standalone: true,
  templateUrl: './about-integrated-approach.html',
  styleUrl: './about-integrated-approach.scss',
})
export class AboutIntegratedApproach {
  readonly steps: FlowStep[] = [
    {
      number: '01',
      title: 'Strategic Planning',
      description:
        'Rigorous analysis and feasibility studies to ensure project viability and align with client objectives from day one.',
    },
    {
      number: '02',
      title: 'Architectural Design',
      description:
        'Creating innovative, functional, and sustainable spaces that reflect modern architectural principles and client identity.',
    },
    {
      number: '03',
      title: 'Flawless Execution',
      description:
        'Translating blueprints into reality with meticulous construction management, ensuring quality control at every phase.',
      featured: true,
    },
  ];
}
