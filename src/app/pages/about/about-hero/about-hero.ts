import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about-hero.html',
  styleUrl: './about-hero.scss',
})
export class AboutHero {}
