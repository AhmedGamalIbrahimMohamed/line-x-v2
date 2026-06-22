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

## Architecture

- **Routing**: all routes in [src/app/app.routes.ts](src/app/app.routes.ts) are lazy-loaded standalone components via `loadComponent`. Pages live under `src/app/pages/<page>/<page>.ts`.
- **Page composition**: each page (e.g. `home`, `about`, `services`, `contact`, `projects`, `selected-project`) is a thin standalone component that imports and arranges section components from a same-named subfolder (e.g. `pages/home/hero`, `pages/home/statement`, `pages/home/cta-section`). Sections are one-off, page-specific components — not shared across pages.
- **Shared components** live in `src/app/shared/` (`navbar`, `footer`, `intro-overlay`) and are wired into the root `App` component ([src/app/app.ts](src/app/app.ts)) alongside `<router-outlet>`.
- **Cross-cutting services** live in `src/app/services/`:
  - `ScrollAnimationService` — central GSAP/ScrollTrigger wrapper (fadeUp, clipReveal, slideFromLeft/Right, scaleIn, lineGrow, staggerChildren, parallaxLayer, heroEntrance). New scroll-triggered animations should be added here rather than calling `gsap` directly from components, to keep ScrollTrigger defaults/registration centralized.
  - `PageTransitionService` — drives a full-page transition overlay (`#page-transition-overlay`) on router `NavigationStart`/`NavigationEnd`.
  - `ThemeService` — light/dark mode via a signal, persisted to `localStorage` (`x-line-theme`), defaults to dark on mobile/tablet viewports.
  - `DirectionService` — toggles `dir`/`lang` on `<html>` and swaps the Bootstrap stylesheet between LTR/RTL builds (`assets/bootstrap/bootstrap.min.css` vs `.rtl.min.css`) based on the active language.
  - `CursorService` — custom cursor, initialized/destroyed from the root `App` component's lifecycle hooks.
- **i18n**: `@ngx-translate/core` with `provideTranslateHttpLoader`, translations at `src/assets/i18n/{en,ar}.json`, default/fallback language `en`. Switching language triggers `DirectionService` (RTL/LTR) via `onLangChange`. Templates use `TranslateModule` (`| translate` pipe / `translate` directive); components that render translated text import `TranslateModule` in their `imports` array.
- **Styling**: Bootstrap 5 (loaded dynamically per direction, see above) plus global SCSS partials in `src/styles/` (`_variables.scss`, `_layout.scss`). Each component has its own colocated `.scss` file.
- **Animation conventions**: components that animate on scroll grab `ScrollTrigger`-bound elements in `ngAfterViewInit` via `@ViewChild`/`querySelector` and delegate to `ScrollAnimationService` methods — see [src/app/pages/home/hero/hero.ts](src/app/pages/home/hero/hero.ts) as the reference pattern.
- **Assets**: images organized by page/section under `src/assets/images/` (e.g. `home/`, `services/`, `selectedProject/`, `figma2/` for newer Figma-sourced assets); videos under `src/assets/videos/`.
