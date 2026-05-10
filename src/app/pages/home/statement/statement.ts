import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './statement.html',
  styleUrl: './statement.scss',
})
export class StatementComponent {}
