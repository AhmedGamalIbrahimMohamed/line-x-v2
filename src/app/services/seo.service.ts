import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface PageSeo {
  title: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

const SITE_NAME = 'X-Line';
const DEFAULT_DESCRIPTION =
  'X-Line delivers business-driven architectural solutions through immersive visual storytelling for forward-thinking clients.';

/**
 * Keeps the document title, description, social-sharing tags, canonical link and robots hint in
 * step with the page. Routes declare `title` and `data.description`; pages with dynamic content
 * (a project) call `set()` once their data has loaded.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  init(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const route = this.deepestRoute(this.router.routerState.snapshot.root);
      const data = route.data;
      // The router applies the route `title` just after NavigationEnd, so read it from the route itself
      // (pages without a static title keep whatever they set via set()).
      this.apply({
        title: route.title ?? this.title.getTitle(),
        description: data['description'] ?? DEFAULT_DESCRIPTION,
        noindex: !!data['noindex'],
      });
    });
  }

  set(page: PageSeo): void {
    this.title.setTitle(page.title);
    this.apply({ ...page, description: page.description ?? DEFAULT_DESCRIPTION });
  }

  private apply(page: PageSeo): void {
    const url = this.doc.location?.href.split('#')[0] ?? '';

    this.meta.updateTag({ name: 'description', content: page.description ?? DEFAULT_DESCRIPTION });
    this.meta.updateTag({ name: 'robots', content: page.noindex ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description ?? DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: page.image ? 'summary_large_image' : 'summary' });

    if (page.image) {
      this.meta.updateTag({ property: 'og:image', content: new URL(page.image, this.doc.baseURI).href });
    } else {
      this.meta.removeTag("property='og:image'");
    }

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
