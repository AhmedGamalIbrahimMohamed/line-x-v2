import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimationService } from '../../../services/scroll-animation.service';

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
export class AboutTeam implements AfterViewInit {
  @ViewChild('sectionRef') private sectionRef!: ElementRef<HTMLElement>;

  private anim = inject(ScrollAnimationService);

  readonly teamCards: TeamCard[] = [
    { image: 'assets/images/figma2/our-team-hover-1.jpg', name: 'Ahmed Amir', role: 'About.team.members.0.role', summary: 'About.team.members.0.summary' },
    { image: 'assets/images/figma2/our-team-hover-2.jpg', name: 'Ahmed Amir', role: 'About.team.members.1.role', summary: 'About.team.members.1.summary' },
    { image: 'assets/images/figma2/our-team-hover-3.jpg', name: 'Ahmed Amir', role: 'About.team.members.2.role', summary: 'About.team.members.2.summary' },
    { image: 'assets/images/figma2/our-team-hover-4.jpg', name: 'Ahmed Amir', role: 'About.team.members.3.role', summary: 'About.team.members.3.summary' },
  ];

  ngAfterViewInit(): void {
    const host = this.sectionRef.nativeElement;
    const eyebrow   = host.querySelector<HTMLElement>('.about-team__eyebrow');
    const lead      = host.querySelector<HTMLElement>('.about-team__lead');
    const photo     = host.querySelector<HTMLElement>('.about-team__main-photo');
    const spotlight = host.querySelector<HTMLElement>('.about-team__spotlight');
    const bioItems  = host.querySelectorAll<HTMLElement>('.about-team__role, .about-team__name, .about-team__position, .about-team__quote, .about-team__summary');
    const members   = host.querySelector<HTMLElement>('.about-team__members');
    const memberCards = host.querySelectorAll<HTMLElement>('.about-team__member-card');

    const trigger = spotlight ?? host;

    if (eyebrow) this.anim.fadeUp(eyebrow, eyebrow, { y: 30, start: 'top 90%' });
    if (lead)    this.anim.clipReveal(lead, lead, { start: 'top 90%' });
    if (photo)   this.anim.slideFromLeft(photo, photo, { x: -80, start: 'top 90%' });
    if (bioItems.length) this.anim.fadeUp(bioItems, trigger, { y: 40, stagger: 0.2, start: 'top 85%', delay: 0.2 });
    if (members && memberCards.length) this.anim.scaleIn(memberCards, members, { stagger: 0.18, start: 'top 90%' });
  }
}
