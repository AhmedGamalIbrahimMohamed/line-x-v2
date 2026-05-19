import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storageKey = 'x-line-theme';
  private readonly mode = signal<ThemeMode>(this.getInitialMode());

  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.applyTheme(this.mode());
  }

  toggleTheme(): void {
    const nextMode: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.mode.set(nextMode);
    this.applyTheme(nextMode);
    this.saveMode(nextMode);
  }

  private getInitialMode(): ThemeMode {
    const storedMode = this.getStoredMode();

    if (storedMode) {
      return storedMode;
    }

    return this.isMobileOrTablet() ? 'dark' : 'light';
  }

  private isMobileOrTablet(): boolean {
    try {
      return window.matchMedia?.('(max-width: 1024px)').matches ?? false;
    } catch {
      return false;
    }
  }

  private getStoredMode(): ThemeMode | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  private prefersDark(): boolean {
    try {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  }

  private saveMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }

  private applyTheme(mode: ThemeMode): void {
    const html = this.doc.documentElement;

    html.classList.toggle('theme-dark', mode === 'dark');
    html.classList.toggle('theme-light', mode === 'light');
    html.style.colorScheme = mode;
  }
}
