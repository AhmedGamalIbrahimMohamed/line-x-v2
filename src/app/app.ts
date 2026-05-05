import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DirectionService } from './services/direction.service';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private translate = inject(TranslateService);
  private direction = inject(DirectionService);

  constructor() {
    this.translate.addLangs(['en', 'ar']);

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.direction.setDirection(lang);
    });

    this.translate.use('en');
  }

  switchLanguage(lang: 'en' | 'ar'): void {
    this.translate.use(lang);
  }
}
