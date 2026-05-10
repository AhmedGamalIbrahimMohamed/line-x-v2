import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projects-projects-section',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './projects-projects-section.html',
  styleUrl: './projects-projects-section.scss',
})
export class ProjectsProjectsSection {}
