import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class AdminShell {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isMenuOpen = signal(false);

  constructor() {
    // Close the mobile drawer after navigating.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.isMenuOpen.set(false));
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  logout(): void {
    this.auth.logout();
  }
}
