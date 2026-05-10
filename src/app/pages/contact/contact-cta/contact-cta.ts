import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-cta',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-cta.html',
  styleUrl: './contact-cta.scss',
})
export class ContactCta {}
