import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DirectionService } from './services/direction.service';
import { CursorService } from './services/cursor.service';
import { filter } from 'rxjs/operators';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { IntroOverlay } from './shared/intro-overlay/intro-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, IntroOverlay],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private direction = inject(DirectionService);
  private cursorService = inject(CursorService);
  private router = inject(Router);

  constructor() {
    this.translate.addLangs(['en', 'ar']);

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.direction.setDirection(lang);
    });

    this.translate.use('en');

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
