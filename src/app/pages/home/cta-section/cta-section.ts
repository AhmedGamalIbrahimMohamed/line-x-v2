import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss',
})
export class CtaSectionComponent {}
