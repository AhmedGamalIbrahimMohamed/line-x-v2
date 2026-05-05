import { Component } from '@angular/core';
import { AboutHero } from './about-hero/about-hero';
import { AboutIntegratedApproach } from './about-integrated-approach/about-integrated-approach';
import { AboutTeam } from './about-team/about-team';
import { AboutVideo } from './about-video/about-video';
import { AboutVision } from './about-vision/about-vision';
import { AboutWhoWeAre } from './about-who-we-are/about-who-we-are';
import { AboutWhyPartener } from './about-why-partener/about-why-partener';
import { CtaSectionComponent } from '../home/cta-section/cta-section';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    AboutHero,
    AboutWhoWeAre,
    AboutVideo,
    AboutIntegratedApproach,
    AboutTeam,
    AboutWhyPartener,
    AboutVision,
    CtaSectionComponent,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
