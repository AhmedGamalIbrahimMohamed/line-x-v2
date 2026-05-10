import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-hero.html',
  styleUrl: './contact-hero.scss',
})
export class ContactHero {}
