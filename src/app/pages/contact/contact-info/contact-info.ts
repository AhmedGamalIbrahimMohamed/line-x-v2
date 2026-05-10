import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {}
