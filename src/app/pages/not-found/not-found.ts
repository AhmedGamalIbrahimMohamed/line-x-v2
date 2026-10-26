import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/** Shown for unknown URLs and for project IDs that do not exist (or are not published). */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslateModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}
