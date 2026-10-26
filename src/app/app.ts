import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, NavigationStart } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DirectionService } from './services/direction.service';
import { CursorService } from './services/cursor.service';
import { ScrollAnimationService } from './services/scroll-animation.service';
import { SeoService } from './services/seo.service';
import { filter } from 'rxjs/operators';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { IntroOverlay } from './shared/intro-overlay/intro-overlay';

type Language = 'en' | 'ar';

const LANGUAGE_KEY = 'x-line-lang';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, Navbar, Footer, IntroOverlay],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private direction = inject(DirectionService);
  private cursorService = inject(CursorService);
  private scrollAnimations = inject(ScrollAnimationService);
  private seo = inject(SeoService);
  private router = inject(Router);

  readonly isAdminRoute = signal(/^\/admin(\/|$|\?)/.test(window.location.pathname));

  constructor() {
    this.translate.addLangs(['en', 'ar']);

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.direction.setDirection(lang);
      this.saveLanguage(lang);
    });

    this.translate.use(this.initialLanguage());
    this.seo.init();

    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => {
      // The page being left registered its own ScrollTriggers; drop them before the next page adds more.
      this.scrollAnimations.killPageTriggers();
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        this.setAdminRoute(e.urlAfterRedirects);
      });
  }

  /** The admin area has its own layout, so the public navbar, footer and intro are not rendered. */
  private setAdminRoute(url: string): void {
    const isAdmin = url === '/admin' || url.startsWith('/admin/') || url.startsWith('/admin?');
    this.isAdminRoute.set(isAdmin);
    document.body.classList.toggle('admin-mode', isAdmin);
  }

  ngOnInit(): void {
    this.cursorService.initCursor();
  }

  ngOnDestroy(): void {
    this.cursorService.destroy();
  }

  /** A plain #anchor would resolve against <base href="/"> and reload the home page, so focus the content directly. */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView();
  }

  switchLanguage(lang: Language): void {
    this.translate.use(lang);
  }

  /** The visitor's last choice, else their browser language, else English. */
  private initialLanguage(): Language {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
    return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  }

  private saveLanguage(lang: string): void {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // The choice simply will not survive a reload.
    }
  }
}
