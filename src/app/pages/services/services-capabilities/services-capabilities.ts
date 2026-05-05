import { Component } from '@angular/core';

type Capability = {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  bullets: string[];
};

@Component({
  selector: 'app-services-capabilities',
  standalone: true,
  templateUrl: './services-capabilities.html',
  styleUrl: './services-capabilities.scss',
})
export class ServicesCapabilities {
  readonly capabilities: Capability[] = [
    {
      number: '01',
      title: 'Architectural Design',
      description: 'Designing functional, aesthetic, and context-driven architectural solutions.',
      image: 'assets/images/figma2/services-capability-1.jpg',
      imageAlt: 'Architectural desk with plans and materials',
      bullets: [
        'Site study & concept development',
        'Architectural planning',
        'Exterior & Interior design',
        'Project visualization & Licensing support',
      ],
    },
    {
      number: '02',
      title: 'Technical Engineering',
      description: 'Providing precise technical documentation to ensure accurate and efficient execution.',
      image: 'assets/images/figma2/services-capability-2.jpg',
      imageAlt: 'Technical architectural model and drawings',
      bullets: [
        'Architectural & Structural drawings',
        'Electrical, Plumbing & Drainage plans',
        'HVAC systems',
        'Bill of Quantities (BOQ)',
      ],
    },
    {
      number: '03',
      title: 'Construction & Contracting',
      description: 'Delivering projects with high standards, efficiency, and full execution control.',
      image: 'assets/images/figma2/services-capability-3.jpg',
      imageAlt: 'Construction site structure in progress',
      bullets: [
        'Structural works',
        'Electrical & mechanical works',
        'Finishing, detailing, flooring & ceilings',
        'Full construction execution',
      ],
    },
    {
      number: '04',
      title: 'Maintenance & Restoration',
      description: 'Ensuring long-term performance and sustainability of built environments.',
      image: 'assets/images/figma2/services-capability-4.jpg',
      imageAlt: 'Building facade restoration detail',
      bullets: ['Maintenance services', 'Restoration works', 'System upgrades', 'Ongoing support'],
    },
  ];
}
