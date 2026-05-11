import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private translate = inject(TranslateService);
  readonly theme = inject(ThemeService);

  isMenuOpen = false;

  @Output() languageChange = new EventEmitter<'en' | 'ar'>();

  get currentLang(): 'en' | 'ar' {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    return lang === 'ar' ? 'ar' : 'en';
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this.languageChange.emit(lang);
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
