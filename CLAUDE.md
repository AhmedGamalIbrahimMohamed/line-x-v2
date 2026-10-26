# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing/portfolio site for "X-Line" built with Angular 20 (standalone components, no NgModules). Generated via Angular CLI 20.3.10.

## Commands

```bash
npm start            # ng serve, dev server at http://localhost:4200/
npm run build        # ng build, output to dist/
npm run watch        # ng build --watch --configuration development
npm test             # ng test (Karma + Jasmine)
```

Run a single spec file: `ng test --include='**/hero.spec.ts'`.

There is no separate lint script configured in package.json.

`sync.sh` pulls from `origin` (AhmedGamalIbrahimMohamed/line-x-v2) and pushes to a second remote `line-x-test` (etman97/line-x-test) — used to mirror this repo to a second GitHub remote, not part of the normal build/test flow.

## Documentation

See [docs/README.md](docs/README.md): [developer guide](docs/DEVELOPER-GUIDE.md) (setup, architecture, recipes, deployment, troubleshooting), [project report](docs/PROJECT-REPORT.md) (what was built and changed), and the admin [user guide + video](docs/admin-guide/) for staff. Keep the user guide in step when admin screens change.

## Build tooling

```bash
npm run optimize:images   # shrink src/assets/images in place (needs `npm install` in backend/ for sharp)
node scripts/gif-to-webp.mjs in.gif out.webp [width] [quality]   # animated GIF -> animated WebP
SITE_URL=https://www.example.com API_URL=https://www.example.com/api npm run build   # prebuild writes public/sitemap.xml + robots.txt
```

`ng build` uses `src/environments/environment.production.ts` (`apiUrl: '/api'`, i.e. API behind the same domain); `ng serve` uses `environment.ts` (`http://localhost:4000/api`). Add new images already optimised — originals of several MB are what made the site slow before.

## Architecture

- **Routing**: all routes in [src/app/app.routes.ts](src/app/app.routes.ts) are lazy-loaded standalone components via `loadComponent`. Pages live under `src/app/pages/<page>/<page>.ts`.
- **Page composition**: each page (e.g. `home`, `about`, `services`, `contact`, `projects`, `selected-project`) is a thin standalone component that imports and arranges section components from a same-named subfolder (e.g. `pages/home/hero`, `pages/home/statement`, `pages/home/cta-section`). Sections are one-off, page-specific components — not shared across pages.
- **Shared components** live in `src/app/shared/` (`navbar`, `footer`, `intro-overlay`) and are wired into the root `App` component ([src/app/app.ts](src/app/app.ts)) alongside `<router-outlet>`.
- **Cross-cutting services** live in `src/app/services/`:
  - `ScrollAnimationService` — central GSAP/ScrollTrigger wrapper (fadeUp, clipReveal, slideFromLeft/Right, scaleIn, lineGrow, staggerChildren, parallaxLayer, heroEntrance). New scroll-triggered animations should be added here rather than calling `gsap` directly from components, to keep ScrollTrigger defaults/registration centralized. `App` calls `killPageTriggers()` on every `NavigationStart`, so a page's ScrollTriggers never outlive it; animations of shared layout (the footer) must be created inside `keepAcrossPages()`. Under `prefers-reduced-motion` the service speeds the global GSAP timeline up so every animation ends instantly.
  - `SeoService` — keeps the document title, description, Open Graph tags, canonical link and robots hint in step with the route. Routes declare `title` and `data.description` in [src/app/app.routes.ts](src/app/app.routes.ts); dynamic pages (a project) call `set()`.
  - `ThemeService` — light/dark mode via a signal, persisted to `localStorage` (`x-line-theme`), defaults to dark on mobile/tablet viewports.
  - `DirectionService` — toggles `dir`/`lang` on `<html>` and swaps the Bootstrap stylesheet between LTR/RTL builds (`assets/bootstrap/bootstrap.min.css` vs `.rtl.min.css`) based on the active language.
  - `CursorService` — custom cursor, initialized/destroyed from the root `App` component's lifecycle hooks.
- **Admin + backend**: the admin dashboard lives in `src/app/admin/` (lazy-loaded at `/admin` via `admin.routes.ts`: login, shell, dashboard, projects list, project form, account) and talks to the Express/Prisma/MySQL API in `backend/` (see [backend/README.md](backend/README.md)). `App` hides the navbar/footer/intro on `/admin` routes. Auth is in `admin/core/` (`AuthService`, `authInterceptor`, `authGuard`): the access token lives in memory only and the long-lived refresh token is an httpOnly cookie (`xl_rt`), restored on reload via `AuthService.ready()`; `localStorage` holds only a non-secret `x-line-admin-hint` flag. Guards must call `inject()` before their first `await`. Admin styles are global in `src/styles/_admin.scss`, scoped under `.admin`. Project images are stored as site-relative `/uploads/...` paths and given the API origin by `services/media-url.ts`; the API refuses to publish a project without a card and hero image. `ProjectsService` reads published projects from the API and falls back to `assets/data/projects.json` if it is unreachable. The project validator in `backend/src/validators/schemas.js` must stay in sync with `models/project.model.ts`.
- **i18n**: `@ngx-translate/core` with `provideTranslateHttpLoader`, translations at `src/assets/i18n/{en,ar}.json`, default/fallback language `en`. Switching language triggers `DirectionService` (RTL/LTR) via `onLangChange`. Templates use `TranslateModule` (`| translate` pipe / `translate` directive); components that render translated text import `TranslateModule` in their `imports` array.
- **Styling**: Bootstrap 5 (loaded dynamically per direction, see above) plus global SCSS partials in `src/styles/` (`_variables.scss`, `_layout.scss`). Each component has its own colocated `.scss` file.
- **Animation conventions**: components that animate on scroll grab `ScrollTrigger`-bound elements in `ngAfterViewInit` via `@ViewChild`/`querySelector` and delegate to `ScrollAnimationService` methods — see [src/app/pages/home/hero/hero.ts](src/app/pages/home/hero/hero.ts) as the reference pattern.
- **Assets**: images organized by page/section under `src/assets/images/` (e.g. `home/`, `services/`, `selectedProject/`, `figma2/` for newer Figma-sourced assets); videos under `src/assets/videos/`.
