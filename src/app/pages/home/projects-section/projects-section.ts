import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss',
})
export class ProjectsSectionComponent {}
