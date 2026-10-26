# X-Line — Project Report

What the project is, how it is built, how it is organised, and everything that was changed during the admin/backend build-out and the full quality pass (October 2026).

---

## 1. What the project is

X-Line is a bilingual (English / Arabic, with right-to-left support) marketing and portfolio website for an architecture and construction company. Visitors browse the company's services and projects and contact the team. Staff manage the **projects** shown on the site through a private **admin dashboard** backed by its own **API and database**.

| Part | What it is | Where |
| --- | --- | --- |
| Public website | Angular 20 single-page app: Home, Projects, Project detail, Services, About, Contact | `src/app/pages`, `src/app/shared` |
| Admin dashboard | Private pages at `/admin` for managing projects | `src/app/admin` |
| API | Node.js / Express REST API with a MySQL database | `backend/` |

---

## 2. How it fits together

```
 Visitor ───────────────►  Angular site  ──── GET /api/projects ────►┐
                           (localhost:4200)                           │
 Admin ──► /admin pages ──► same Angular app ── JWT + cookie ───────►│  Express API  ──► MySQL
                           (login, projects, images)                  │  (localhost:4000)   (users, projects)
                                                                      │       │
                              GET /uploads/... ◄──────────────────────┘       └─► uploads/ (WebP images)
```

- The public site loads **published** projects from the API. If the API is unreachable it falls back to the bundled `src/assets/data/projects.json`, so the site never goes blank.
- The admin area is part of the same Angular app (lazy-loaded, so visitors never download it). It talks to the API with a short-lived **access token** (kept in memory) and a long-lived **refresh token** (an `httpOnly` cookie that scripts cannot read).
- Contact-form messages do **not** go through the API: they are sent with EmailJS directly from the browser.

---

## 3. Technology

| Area | Choice |
| --- | --- |
| Frontend | Angular 20.3 (standalone components, signals, lazy routes), TypeScript, SCSS |
| Styling | Bootstrap 5 grid/utilities (LTR and RTL builds), per-component SCSS, theme CSS variables (light/dark) |
| Animation | GSAP + ScrollTrigger, wrapped in one service |
| Translations | `@ngx-translate` (`en.json`, `ar.json`) + a `localize` pipe for project content |
| Maps / email | Leaflet (contact map), EmailJS (contact form) |
| API | Node ≥ 20, Express 4, Zod (validation), Helmet, CORS, rate limiting, Multer + Sharp (images) |
| Database | MySQL 8 through Prisma 6 |
| Auth | JWT access token + rotating `httpOnly` refresh cookie, bcrypt password hashes |
| Tests | Karma + Jasmine (27 unit tests); Puppeteer browser scripts used for end-to-end checks |

---

## 4. Repository layout

```
line-x-v2/
├─ backend/                       Express + Prisma API (own package.json)
│  ├─ prisma/
│  │  ├─ schema.prisma            tables: users, projects
│  │  ├─ seed.js                  first admin + imports projects.json
│  │  └─ set-admin.js             create / reset an admin account
│  ├─ src/
│  │  ├─ server.js, app.js        start-up, middleware stack
│  │  ├─ config/env.js            every setting, validated at boot
│  │  ├─ routes/                  auth.routes.js, projects.routes.js
│  │  ├─ controllers/             auth.controller.js, projects.controller.js
│  │  ├─ middleware/              auth, upload, validate, rate-limit, error
│  │  ├─ validators/schemas.js    Zod schemas (mirror the Angular model)
│  │  ├─ lib/                     prisma client, image processor, file storage
│  │  └─ utils/                   errors, cookies
│  ├─ uploads/                    uploaded images (git-ignored)
│  └─ README.md                   setup, endpoints, auth, deployment notes
├─ public/                        robots.txt (+ generated sitemap.xml)
├─ scripts/                       optimize-images, gif-to-webp, generate-sitemap
├─ docs/PROJECT-REPORT.md         this file
├─ src/
│  ├─ index.html, main.ts, styles.scss
│  ├─ environments/               environment.ts (dev), environment.production.ts
│  ├─ styles/                     _variables.scss, _layout.scss, _admin.scss
│  ├─ assets/
│  │  ├─ data/projects.json       bundled fallback + seed data
│  │  ├─ i18n/                    en.json, ar.json
│  │  ├─ images/, videos/
│  └─ app/
│     ├─ app.ts / app.html        root: shell, language, SEO, skip link
│     ├─ app.routes.ts            public routes, titles/descriptions, 404
│     ├─ models/                  project.model.ts (the data contract)
│     ├─ pipes/                   localize.pipe.ts
│     ├─ services/                projects, seo, theme, direction, cursor,
│     │                           scroll-animation, media-url
│     ├─ shared/                  navbar, footer, intro-overlay
│     ├─ pages/                   home, projects, selected-project, services,
│     │                           about, contact, not-found
│     └─ admin/                   core/ (auth, api), login, shell, dashboard,
│                                 projects (list), project-form, account
├─ angular.json, package.json, CLAUDE.md
```

**Convention:** every public page is a thin component that arranges section components from a same-named sub-folder (for example `pages/home/hero`). Sections belong to one page and are not shared.

---

## 5. The public website

### Pages and routes
| URL | Page | Notes |
| --- | --- | --- |
| `/` | Home | hero video, statement, projects, expertise, team, partners, call to action |
| `/projects` | Projects | category tabs (only categories that have projects), "load more", cards |
| `/selected-project/:id` | Project detail | hero, overview (Challenge / Concept), Design Process, Visual Journey, Solution, Spatial Experience |
| `/services`, `/about`, `/contact` | Static pages | contact has the form, map and company info |
| `/admin/**` | Admin | see section 6 |
| anything else | 404 page | unknown URLs and unknown/unpublished project IDs |

Every route declares its page `title` and a description; `SeoService` turns these into the document title, meta description, Open Graph tags, canonical link and a `noindex` hint for the admin and 404 pages.

### Cross-cutting services (`src/app/services`)
- **ProjectsService** — loads published projects (API first, bundled JSON as fallback), finds a project by ID, and lets a signed-in admin open a **draft** through "View on site".
- **ScrollAnimationService** — the only place that calls GSAP/ScrollTrigger. Page triggers are cleaned up on every navigation; footer animations are marked as persistent; reduced-motion users get end states without movement.
- **SeoService**, **ThemeService** (light/dark, remembered), **DirectionService** (RTL/LTR + Bootstrap build swap), **CursorService** (custom cursor), **media-url** (adds the API origin to `/uploads/...` paths).

### Behaviours worth knowing
- **Language** is remembered (`x-line-lang`), falling back to the browser language, then English.
- **Intro video** plays once per browser session, is capped at 4 seconds, can be skipped, and is skipped entirely for reduced-motion visitors.
- **Optional project sections.** Challenge, Concept, Solution, Design Process, Visual Journey and Spatial Experience each have a `showcase` flag. A missing flag means "show", so older projects are unaffected.
- **Missing images** never render as broken images: empty hero/card/spatial images are simply skipped.
- **Accessibility:** skip-to-content link, accessible names on the animated headings, landmarks, reduced-motion support.
- **Contact form:** EmailJS, with a hidden trap field, a minimum fill time and a 30-second cooldown against bots. The recipient address lives in `environment.ts`.

---

## 6. The admin dashboard

Reached at `/admin` (own layout; the public navbar, footer and intro are not shown).

| Page | What it does |
| --- | --- |
| Login | email + password; clear errors; sign-in rate limited by the API |
| Dashboard | totals: all / published / drafts, projects per category |
| Projects | searchable, filterable list; status badge; **up/down reordering**; edit; delete with confirmation |
| Project form | every field in English and Arabic; image uploads with preview; per-section **Show on project page** switches; Published switch; **ID auto-filled from the English title**; warning if a published project has no card/hero image; **unsaved-changes prompt**; "View on site" (works for drafts) |
| Account | profile and change password (12+ characters) |

**Security model:** guards redirect signed-out visitors; the access token lives only in memory; the refresh token is an `httpOnly` cookie restored on reload; an expired token is refreshed transparently and the failed call retried; if the refresh fails the user is signed out.

---

## 7. The API (`backend/`)

### Data model (`prisma/schema.prisma`)
- **users** — id, email (unique), bcrypt password, name, role (`ADMIN` / `EDITOR`), active flag, last login.
- **projects** — `id` (the URL slug), `category`, `isPublished`, `sortOrder`, and `data` (JSON: card, hero, overview, designProcess, visualJourney, solution, spatialExperience).

A project is one JSON document because it is deeply nested, bilingual content that the site renders as-is; only the fields the API filters or sorts on are real columns.

### Endpoints
| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | public | sign in (sets refresh cookie) |
| POST | `/api/auth/refresh` | cookie | new access token, rotates the cookie |
| POST | `/api/auth/logout` | public | clears the cookie |
| GET | `/api/auth/me` | admin | current user |
| POST | `/api/auth/change-password` | admin | change own password |
| GET | `/api/projects` | public | published projects; `?includeUnpublished=true` needs a valid token |
| GET | `/api/projects/:id` | public | one project (drafts need a token) |
| POST / PUT / DELETE | `/api/projects`, `/api/projects/:id` | admin | create / update / delete |
| PUT | `/api/projects/reorder` | admin | save display order |
| POST | `/api/projects/upload` | admin | upload one image → WebP, returns `/uploads/...` |
| GET | `/api/health` | public | status |

### Rules enforced by the API
- Strict validation (Zod): ID format, allowed categories, text lengths, image references (empty, `http(s)`, `/uploads/…`, `assets/…` only), boolean section flags.
- **A project cannot be published without a card image and a hero image.** Drafts can be incomplete.
- Unknown fields are stripped; uploads must be real images (JPEG/PNG/WebP/AVIF, ≤ 12 MB) and are re-encoded as WebP (≤ 1920 px).
- Files that no project references any more are deleted when a project is edited or removed.
- Helmet headers, CORS allow-list, global rate limit, stricter sign-in limit, JSON body limit 2 MB, no stack traces in production.

---

## 8. Running, building, deploying

```bash
# one-time
cd backend && npm install && cp .env.example .env     # then edit .env
npm run setup                                         # prisma generate + db push + seed
# every day
cd backend && npm run dev                             # API  → http://localhost:4000
npm start                                             # site → http://localhost:4200  (repo root)
# production build of the site
SITE_URL=https://your-domain API_URL=https://your-domain/api npm run build
# maintenance
npm run optimize:images                               # shrink new images in src/assets/images
npm test                                              # unit tests
```

Important settings:
- **Frontend:** `src/environments/environment.ts` (dev API `http://localhost:4000/api`) and `environment.production.ts` (`/api`, i.e. API behind the same domain via a reverse proxy).
- **Backend `.env`:** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `PUBLIC_URL`, admin seed values, `COOKIE_SAMESITE` (set to `none` with HTTPS if the site and API are on different domains).
- The site's build only writes `sitemap.xml` when `SITE_URL` is set.
- On this machine Docker Desktop must be running for MySQL, and a corporate certificate proxy means some commands need `NODE_USE_SYSTEM_CA=1` (see the project memory note).

---

## 9. What was done

### Phase 1 — Admin and API (modelled on the Rashidi-Web repository)
- Studied the reference repo's backend (Express + Prisma + JWT, uploads, validation, error handling) and its admin pages.
- Built `backend/` (auth, projects CRUD, image upload, seed from `projects.json`, rate limiting, validation).
- Built the admin UI (login, shell, dashboard, projects list, project form, account), reusing your existing project editor but saving to the API and uploading real files instead of keeping data in the browser.
- Wired the public site to read from the API with the bundled JSON as fallback; hid the public navbar/footer on `/admin`.
- Set up MySQL in Docker, created `.env`, seeded the admin and the 6 projects, and verified end to end.

### Phase 2 — Optional sections and renames
- Added the `showcase` visibility flag to **Challenge, Concept, Solution, Design Process, Visual Journey**, then renamed the last section from `solutions` to **`spatialExperience`** (it clashed with `solution`) and gave it the same flag. Included a layout rule for when only one overview block is shown, a data migration for existing rows, and defaults so old projects keep every section.

### Phase 3 — Draft preview
- "View on site" now works for unpublished projects when you are signed in (the public site asks the API for the draft by ID).

### Phase 4 — Full test pass and fixes
The whole site was tested in headless Chrome (public pages at desktop / tablet / mobile, navigation, Arabic/RTL, dark mode, filtering, contact form, every admin screen), plus ~60 API cases, a dependency audit, a production build and the unit tests. Everything found was fixed:

**Bugs fixed**

| # | Problem | Fix |
| --- | --- | --- |
| 1 | Home page transferred ≈ 125 MB, a project page ≈ 108 MB (images up to 23 MB, 78 MB GIF) | Images recompressed in place (232 MB → 11 MB), GIF → animated WebP (78 MB → 9 MB), below-the-fold images lazy-loaded. Now ≈ 6.5 MB home / 2.7 MB project page |
| 2 | Five projects contained 14 `PASTE IMAGE LINK HERE` placeholders each; blank images showed as broken | Placeholders cleaned (database + JSON); empty images are skipped on the site; API rejects placeholders and refuses to publish without card + hero image |
| 3 | No 404 page (blank screen + console error) | `**` route and a translated 404 page; unknown project IDs show it too |
| 4 | Admin showed 6 of 7 projects (drafts vanished) with an expired token instead of signing out | Asking for drafts now requires a valid token (401 otherwise) so the app refreshes or signs out |
| 5 | Services page scrolled sideways on tablets | Section clips the off-screen slide-in offset |
| 6 | Both existing unit tests failed | Rewritten; 27 tests now pass |
| 7 | High-severity dependency advisories | Angular → 20.3.34; `sharp` 0.35, `zod` 4, body-parser patched. Frontend audit: 0. Backend: only a Prisma CLI advisory (needs Prisma 7) |
| 8 | Disallowed CORS origin returned a 500 | Plain CORS refusal |
| 9 | Corrupt "image" upload returned a 500 | Clear 400 message |
| 10 | `javascript:` / free text accepted as an image URL | Strict image-reference rule |
| 11 | Scroll animations were never cleaned up between pages; unused `PageTransitionService` | Cleanup on every navigation; dead service removed |
| 12 | *(found while fixing)* wrong current password signed the admin out; async guard used `inject()` after `await` | Interceptor ends the session only when the refresh itself fails; guards inject first; both covered by unit tests; API now answers 400 for a wrong current password |
| 13 | *(found while recording the user guide)* the delete-confirmation box was invisible: the dimmed backdrop appeared but no dialog, because the CSS class `.modal` is hidden by Bootstrap | Dialog classes renamed (`.dialog*`); verified the box is visible and its buttons clickable; rule added to the developer guide |

**Enhancements added**

| Area | Enhancement |
| --- | --- |
| Performance | Optimised images, lazy loading, animated WebP, Bootstrap JS and the third-party icon stylesheet removed (WhatsApp icon now from the installed icon font), production environment file, bundle 687 kB → 617 kB |
| Intro | Once per session, 4-second cap, skipped for reduced motion |
| Language | Remembered between visits |
| SEO | Per-page titles, descriptions, Open Graph, canonical links, `noindex` for admin/404/drafts, `robots.txt`, sitemap generator (runs before `npm run build`) |
| Accessibility | Skip link, accessible heading names, reduced-motion support |
| Contact form | Trap field, minimum fill time, cooldown, recipient moved to config |
| Projects page | Tabs only for categories that have projects |
| Admin | Unsaved-changes prompt, reordering, auto slug, warning for missing images, draft preview banner, 12-character passwords |
| Data | Uploads stored as relative paths (survive a domain change); unused uploaded files cleaned up |
| Security | Refresh token moved from browser storage to an `httpOnly` cookie |
| Tooling | `optimize-images`, `gif-to-webp`, `generate-sitemap` scripts; documentation updated |

### Phase 5 — Documentation and training material
- **Admin user guide** for non-technical staff (Markdown + a single-file HTML version with 16 screenshots) and a **captioned video walkthrough** (≈ 4 minutes), both produced by driving the real dashboard with a demo project that was deleted afterwards. Recording them exposed the invisible delete dialog (bug 13).
- **Developer guide** (setup, architecture, data model, API, conventions, how-to recipes, testing, deployment checklist, troubleshooting) and a **docs index** (`docs/README.md`).

---

## 10. Testing and results

| Check | Result |
| --- | --- |
| Unit tests (`npm test`) | **27 / 27 pass** — app shell, media URLs, slug generator, projects service (API, fallback, drafts), route guards, auth interceptor |
| Admin end-to-end (browser) | **23 / 23 pass** — guards, login, create / edit / upload, flags, draft preview, delete, reorder, unsaved-changes prompt, password rules, cookie session restore, token refresh, mobile layout |
| Public site fixes (browser) | **15 / 15 pass** — 404 pages, titles and tags, language memory, intro, skip link, tabs, no broken images, tablet overflow, page weight, draft banner, contact protection |
| Backend features | **18 / 18 pass** — uploads, orphan cleanup, publish rules, reordering, password policy, cookie auth, strict draft access, CORS |
| Production build | passes; initial JS 617 kB raw / 158 kB transferred |
| Dependency audit | frontend 0 vulnerabilities; backend 1 (Prisma CLI, see below) |

Notes: the browser scripts are not stored in the repo (they ran from a temporary folder). A few early failures were mistakes in the test scripts themselves, not in the site.

---

## 11. Known limits and decisions for you

1. **Five projects still need hero images** (Madar Tower is a draft; Masterplan, Mali Tower, Zara Branch, Modern Villa are published). They show a dark hero until you upload images. Until then they cannot be re-saved as published (the new rule); upload a hero image or untick Published.
2. **No server-side rendering.** The site is a client-rendered app; search engines get titles, descriptions, sitemap and robots, but not pre-rendered HTML. Adding `@angular/ssr` pre-rendering is a larger project.
3. **Contact form has no CAPTCHA** (needs Cloudflare Turnstile/reCAPTCHA keys). EmailJS keys are public by design — restrict them to your domain in the EmailJS dashboard.
4. **Prisma 7** is needed to clear the last advisory (it is in Prisma's command-line configuration tooling, not in request handling).
5. **Images have no width/height attributes**, so layout can still shift slightly while they load.
6. **Heavy media remains by design:** the hero video (4 MB) and the partner animation (9 MB, loaded only on the pages that show it).
7. **Nothing has been committed yet** — all changes are in the working folder.
8. **Production wiring is untested here:** the production environment expects the API behind the same domain at `/api` (and `/uploads`); check CORS, cookies and HTTPS when you deploy.

---

## 12. Maintenance tips

- Add images already optimised (or run `npm run optimize:images`); multi-megabyte originals are what made the site slow.
- When you change the project shape, update **both** `src/app/models/project.model.ts` and `backend/src/validators/schemas.js` (and the category list lives in both).
- Run `npm test` before releasing; run the sitemap step with `SITE_URL` set for production builds.
- Use `npm run admin:set -- email password` to create or reset an admin.
- Keep dependency updates in step: after changing Angular packages, install with `--legacy-peer-deps` once (the lock file pins peers).
