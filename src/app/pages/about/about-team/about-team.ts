import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface TeamCard {
  image: string;
  name: string;
  role: string;
  summary: string;
}

@Component({
  selector: 'app-about-team',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-team.html',
  styleUrl: './about-team.scss',
})
export class AboutTeam {
  readonly teamCards: TeamCard[] = [
    {
      image: 'assets/images/figma2/our-team-hover-1.jpg',
      name: 'Ahmed Amir',
      role: 'About.team.members.0.role',
      summary: 'About.team.members.0.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-2.jpg',
      name: 'Ahmed Amir',
      role: 'About.team.members.1.role',
      summary: 'About.team.members.1.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-3.jpg',
      name: 'Ahmed Amir',
      role: 'About.team.members.2.role',
      summary: 'About.team.members.2.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-4.jpg',
      name: 'Ahmed Amir',
      role: 'About.team.members.3.role',
      summary: 'About.team.members.3.summary',
    },
  ];
}
