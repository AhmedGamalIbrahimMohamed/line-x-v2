import { Injectable, inject, DOCUMENT } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private doc = inject(DOCUMENT);

  setDirection(lang: string): void {
    const isRtl = ['ar', 'he', 'fa', 'ur'].includes(lang);
    const html = this.doc.documentElement;

    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);

    this.swapBootstrapCss(isRtl);
  }

  private swapBootstrapCss(rtl: boolean): void {
    const id = 'bootstrap-css';
    let link = this.doc.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
      link = this.doc.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      this.doc.head.appendChild(link);
    }

    link.href = rtl
      ? 'assets/bootstrap/bootstrap.rtl.min.css'
      : 'assets/bootstrap/bootstrap.min.css';
  }
}
