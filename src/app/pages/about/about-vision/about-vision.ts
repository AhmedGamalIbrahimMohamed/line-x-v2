import { Component } from '@angular/core';

type VisionCard = {
  title: string;
  description: string;
  tabletHidden?: boolean;
};

@Component({
  selector: 'app-about-vision',
  standalone: true,
  templateUrl: './about-vision.html',
  styleUrl: './about-vision.scss',
})
export class AboutVision {
  readonly cards: VisionCard[] = [
    {
      title: 'Construction',
      description:
        'Executing complex structures with absolute precision, utilizing advanced engineering practices to ensure durability, safety, and operational excellence for commercial and government entities.',
      tabletHidden: true,
    },
    {
      title: 'Design',
      description:
        'Conceptualizing spaces that harmonize form and function. We deliver innovative architectural blueprints that reflect modern aesthetics while solving complex spatial challenges.',
    },
    {
      title: 'Maintenance',
      description:
        'Providing comprehensive lifecycle management and facility maintenance to preserve asset value, ensure ongoing operational efficiency, and extend the lifespan of infrastructure.',
    },
  ];
}
