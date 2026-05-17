import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DirectionService } from './services/direction.service';
import { CursorService } from './services/cursor.service';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private direction = inject(DirectionService);
  private cursorService = inject(CursorService);

  constructor() {
    this.translate.addLangs(['en', 'ar']);

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.direction.setDirection(lang);
    });

    this.translate.use('en');
  }

  ngOnInit(): void {
    this.cursorService.initCursor();
  }

  ngOnDestroy(): void {
    this.cursorService.destroy();
  }

  switchLanguage(lang: 'en' | 'ar'): void {
    this.translate.use(lang);
  }
}
