import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-services-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './services-hero.html',
  styleUrl: './services-hero.scss',
})
export class ServicesHero {}
