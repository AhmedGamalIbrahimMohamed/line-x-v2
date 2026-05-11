import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface TeamCard {
  image: string;
  name: string;
  role: string;
  summary: string;
}

@Component({
  selector: 'app-our-team',
  standalone: true,
  imports: [TranslateModule , RouterLink],
  templateUrl: './our-team.html',
  styleUrl: './our-team.scss',
})
export class OurTeam {
  @Input() showViewAll = true;

  readonly teamCards: TeamCard[] = [
    {
      image: 'assets/images/figma2/our-team-hover-1.jpg',
      name: 'Ahmed Amir',
      role: 'Home.ourTeam.members.0.role',
      summary: 'Home.ourTeam.members.0.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-2.jpg',
      name: 'Ahmed Amir',
      role: 'Home.ourTeam.members.1.role',
      summary: 'Home.ourTeam.members.1.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-3.jpg',
      name: 'Ahmed Amir',
      role: 'Home.ourTeam.members.2.role',
      summary: 'Home.ourTeam.members.2.summary',
    },
    {
      image: 'assets/images/figma2/our-team-hover-4.jpg',
      name: 'Ahmed Amir',
      role: 'Home.ourTeam.members.3.role',
      summary: 'Home.ourTeam.members.3.summary',
    },
  ];
}
