import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private translate = inject(TranslateService);

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

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}