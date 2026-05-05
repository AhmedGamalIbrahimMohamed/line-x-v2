import { Component, Input } from '@angular/core';

interface TeamCard {
  image: string;
  name: string;
  role: string;
  summary: string;
}

@Component({
  selector: 'app-our-team',
  standalone: true,
  imports: [],
  templateUrl: './our-team.html',
  styleUrl: './our-team.scss',
})
export class OurTeam {
  @Input() showViewAll = true;

  readonly teamCards: TeamCard[] = [
    {
      image: 'assets/images/figma2/our-team-hover-1.jpg',
      name: 'Ahmed Amir',
      role: 'Interior Arch. Lead',
      summary: 'Luxury hospitality designed with commercial efficiency.',
    },
    {
      image: 'assets/images/figma2/our-team-hover-2.jpg',
      name: 'Ahmed Amir',
      role: 'Interior Arch. Lead',
      summary: 'Luxury hospitality designed with commercial efficiency.',
    },
    {
      image: 'assets/images/figma2/our-team-hover-3.jpg',
      name: 'Ahmed Amir',
      role: 'Interior Arch. Lead',
      summary: 'Luxury hospitality designed with commercial efficiency.',
    },
    {
      image: 'assets/images/figma2/our-team-hover-4.jpg',
      name: 'Ahmed Amir',
      role: 'Interior Arch. Lead',
      summary: 'Luxury hospitality designed with commercial efficiency.',
    },
  ];
}
