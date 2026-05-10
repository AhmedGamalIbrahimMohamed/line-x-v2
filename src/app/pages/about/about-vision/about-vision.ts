import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type VisionCard = {
  title: string;
  description: string;
  tabletHidden?: boolean;
};

@Component({
  selector: 'app-about-vision',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-vision.html',
  styleUrl: './about-vision.scss',
})
export class AboutVision {
  readonly cards: VisionCard[] = [
    {
      title: 'About.vision.cards.0.title',
      description: 'About.vision.cards.0.description',
      tabletHidden: true,
    },
    {
      title: 'About.vision.cards.1.title',
      description: 'About.vision.cards.1.description',
    },
    {
      title: 'About.vision.cards.2.title',
      description: 'About.vision.cards.2.description',
    },
  ];
}
