import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero';
import { StatementComponent } from './statement/statement';
import { PartnersStripComponent } from './partners-strip/partners-strip';
import { ProjectsSectionComponent } from './projects-section/projects-section';
import { ExpertiseSectionComponent } from './expertise-section/expertise-section';
import { WhyPartnerComponent } from './why-partner/why-partner';
import { CtaSectionComponent } from './cta-section/cta-section';
// import { OurTeam } from './our-team/our-team';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    StatementComponent,
    PartnersStripComponent,
    ProjectsSectionComponent,
    ExpertiseSectionComponent,
    WhyPartnerComponent,
    CtaSectionComponent,
    // OurTeam,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
