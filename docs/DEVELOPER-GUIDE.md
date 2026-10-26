# X-Line — Developer Guide

Everything a developer needs to set the project up, understand it, change it safely and ship it.
For the history of what was built and why, read [PROJECT-REPORT.md](PROJECT-REPORT.md). For the people who use the
admin dashboard, see [admin-guide/](admin-guide/). The short, always-loaded summary for AI assistants is
[../CLAUDE.md](../CLAUDE.md); keep it in step with this file.

---

## 1. At a glance

| | |
| --- | --- |
| **What** | Bilingual (EN/AR, RTL) marketing + portfolio site for an architecture firm, with a private admin dashboard to manage projects |
| **Frontend** | Angular 20 · standalone components · signals · lazy routes · SCSS · Bootstrap 5 · GSAP |
| **Backend** | Node ≥ 20 · Express 4 · Prisma 6 · MySQL 8 · Zod · JWT |
| **Folders** | repo root = Angular app · `backend/` = API (separate `package.json`) |
| **Ports** | site `4200`, API `4000`, MySQL `3306` |

---

## 2. Prerequisites

- **Node.js 20+** (developed on 24) and npm
- **Docker Desktop** (for MySQL) — or any MySQL 8 server
- **Google Chrome** (for unit tests: `CHROME_BIN`)
- Windows notes: see [section 12](#12-troubleshooting)

---

## 3. First-time setup

```bash
# 1. dependencies
npm install                      # frontend (repo root)
cd backend && npm install        # API

# 2. database (Docker)
docker run -d --name xline-mysql -e MYSQL_ROOT_PASSWORD=choose-a-password -e MYSQL_DATABASE=xline -p 3306:3306 mysql:8

# 3. API configuration
cp .env.example .env             # inside backend/
#   set DATABASE_URL="mysql://root:choose-a-password@127.0.0.1:3306/xline"
#   set JWT_SECRET and JWT_REFRESH_SECRET (generate:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
#   set ADMIN_EMAIL / ADMIN_PASSWORD (12+ characters) for the first admin

# 4. create tables, first admin, and import the sample projects
npm run setup                    # = prisma generate + prisma db push + seed
```

Run everything (two terminals):

```bash
cd backend && npm run dev        # API  → http://localhost:4000/api/health
npm start                        # site → http://localhost:4200   (repo root)
```

Sign in to the admin at <http://localhost:4200/admin/login> with the seeded account.

| Command | Where | Purpose |
| --- | --- | --- |
| `npm start` | root | dev server (uses `environment.ts`) |
| `npm run build` | root | production build; `prebuild` writes `robots.txt` / `sitemap.xml` |
| `npm test` | root | Karma + Jasmine unit tests |
| `npm run optimize:images` | root | shrink `src/assets/images` in place |
| `node scripts/gif-to-webp.mjs in.gif out.webp [width] [quality]` | root | animated GIF → animated WebP |
| `npm run dev` / `start` | `backend/` | API with / without file watching |
| `npm run setup` | `backend/` | generate client, create tables, seed |
| `npm run db:push` | `backend/` | apply `schema.prisma` to the database |
| `npm run db:seed` | `backend/` | add the admin + any missing projects (never overwrites) |
| `npm run admin:set -- email "password" [name]` | `backend/` | create or reset an admin |
| `npm run prisma:studio` | `backend/` | browse the database in a browser |

---

## 4. Architecture

```
Browser ── Angular app ──┬── public pages ─────── GET /api/projects ─────────┐
                         └── /admin pages ─ Bearer token + httpOnly cookie ──┤
                                                                              ▼
                                                  Express API ─ Prisma ─► MySQL (users, projects)
                                                       └─ Sharp ─► backend/uploads/  ← served at /uploads
Contact form ─── EmailJS (browser → EmailJS, not through the API)
```

Key ideas:

1. **A project is one JSON document.** It is bilingual, deeply nested, and rendered as-is, so it lives in a single JSON column. Only `id`, `category`, `isPublished` and `sortOrder` are real columns.
2. **The public site never breaks if the API is down.** `ProjectsService` falls back to `src/assets/data/projects.json`.
3. **Auth is split.** A short-lived *access token* (memory only) is sent as `Authorization: Bearer …`. The long-lived *refresh token* is an `httpOnly` cookie (`xl_rt`, path `/api/auth`) that scripts cannot read. `AuthService.ready()` restores the session on reload.
4. **Optional sections** use a `showcase` boolean; **missing means shown**, so old data keeps working.
5. **Images are site-relative** (`/uploads/projects/x.webp`) in the database; `services/media-url.ts` adds the API origin when rendering and removes it before saving.

---

## 5. Repository map

```
backend/
  prisma/            schema.prisma · seed.js · set-admin.js
  src/
    server.js app.js            boot + middleware stack (helmet, cors, compression, morgan, limits)
    config/env.js               ALL settings, validated at start-up (never read process.env elsewhere)
    routes/ controllers/        thin routes → controllers (auth, projects)
    middleware/                 auth (requireAuth, optionalAuth, requireAuthForDrafts) · upload · validate · rate-limit · error
    validators/schemas.js       Zod: project shape, categories, passwords  ← mirrors the Angular model
    lib/                        prisma client · image-processor (Sharp→WebP) · storage (files + orphan detection)
    utils/                      errors (ApiError) · cookies (refresh cookie helpers)
src/
  environments/                 environment.ts (dev) · environment.production.ts
  styles.scss  styles/          global theme variables (light/dark), _admin.scss (scoped under .admin)
  assets/ data/ i18n/ images/ videos/
  app/
    app.ts app.html app.routes.ts   shell, language, SEO init, skip link, routes (+ titles, 404)
    models/                         project.model.ts  ← THE data contract
    services/                       projects · seo · theme · direction · cursor · scroll-animation · media-url
    pipes/localize.pipe.ts          picks .en / .ar from { en, ar }
    shared/                         navbar · footer · intro-overlay
    pages/<page>/<section>/         one thin page + one folder of section components per page
    admin/                          core/ (auth, api, guards, interceptor) · login · shell · dashboard · projects · project-form · account
scripts/                         optimize-images · gif-to-webp · generate-sitemap
public/                          robots.txt (+ generated sitemap.xml)
docs/                            this guide · PROJECT-REPORT.md · admin-guide/
```

---

## 6. Data model

`src/app/models/project.model.ts` (frontend) and `backend/src/validators/schemas.js` (API) describe the same shape.
**Change both together**, plus the category list that exists in both places.

```
Project
 ├─ id (slug, immutable) · category (one of PROJECT_CATEGORIES) · isPublished · sortOrder
 ├─ card            { image, title{en,ar}, location, area, size: large|small|full }
 ├─ hero            { eyebrow, title, subtitle, image, details{ location, totalArea, year, scope } }
 ├─ overview        { challenge, concept }     each: { showcase, number, title, quote, paragraph1, paragraph2 }
 ├─ designProcess   { showcase, label, images[] }      (rendered in groups of 5)
 ├─ visualJourney   { showcase, label, images[] }      (rendered in cycles of 4)
 ├─ solution        { showcase, number, title, quote, paragraph1, paragraph2 }
 └─ spatialExperience { showcase, image, title, text }
```

Rules the API enforces: ID = lowercase letters/numbers/hyphens; text ≤ 4000 chars; image = `""`, `http(s)://…`, `/uploads/…` or `assets/…`; **published ⇒ card image and hero image required**; section flags are booleans (default `true`).

Prisma tables: `users` (email unique, bcrypt hash, role `ADMIN|EDITOR`, `isActive`) and `projects` (see `schema.prisma`).

---

## 7. API reference

Base: `/api`. Responses are `{ "success": true, "data": … }` or `{ "success": false, "error": { "message", "details?" } }`.

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/auth/login` | public | 10 failed attempts / 15 min / IP. Sets the refresh cookie; body has `accessToken`, `user` |
| POST | `/auth/refresh` | cookie | rotates the cookie, returns a new access token |
| POST | `/auth/logout` | public | clears the cookie |
| GET | `/auth/me` | token | |
| POST | `/auth/change-password` | token | new password ≥ 12 chars; wrong current password → 400 |
| GET | `/projects` | public | published only. `?category=`; `?includeUnpublished=true` **requires** a valid token (401 otherwise — never a silently shorter list) |
| GET | `/projects/:id` | public | drafts need a token **and** `includeUnpublished=true` |
| POST | `/projects` | token | 201; 409 if the ID exists; 400 with `details` on validation errors |
| PUT | `/projects/:id` | token | body `id` must match the URL; removes upload files no longer referenced |
| PUT | `/projects/reorder` | token | `{ ids: [...] }` in display order |
| DELETE | `/projects/:id` | token | removes now-unreferenced uploads |
| POST | `/projects/upload` | token | multipart field `image`; JPEG/PNG/WebP/AVIF ≤ 12 MB → WebP ≤ 1920 px; returns `{ url: "/uploads/…" }` |
| GET | `/health` | public | |

Static files: `/uploads/**` (long-lived cache). CORS only allows `CORS_ORIGINS`.

### Backend `.env`
`NODE_ENV`, `PORT`, `API_PREFIX`, `PUBLIC_URL`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`,
`CORS_ORIGINS`, `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`, `IMAGE_FULL_WIDTH`, `IMAGE_QUALITY`, `RATE_LIMIT_*`, `ADMIN_EMAIL/PASSWORD/NAME`,
`COOKIE_SAMESITE` (`lax` default; `none` + HTTPS if the site and API are on different domains), `COOKIE_SECURE`. See `.env.example`.

---

## 8. Frontend conventions

- **Standalone components only**; each is `name.ts` + `name.html` + `name.scss` (admin pages share global admin styles instead of per-component SCSS).
- **Pages are thin.** `pages/<page>/<page>.ts` just lists section components from `pages/<page>/<section>/`. Sections are not shared across pages.
- **Translations:** static text → `en.json` / `ar.json` + `| translate`. Project content → `{ en, ar }` objects + `| localize`. Never hard-code visitor-facing text.
- **RTL:** use logical CSS (`inset-inline-start`, `padding-inline`, …) so Arabic works without overrides; `DirectionService` swaps the Bootstrap build.
- **Animations:** never import `gsap` in components. Add a method to `ScrollAnimationService` and call it from `ngAfterViewInit` (see `pages/home/hero/hero.ts`). Anything in *shared layout* (footer/navbar) must run inside `keepAcrossPages()`; page animations are cleaned up automatically on navigation.
- **Images in templates:** below the fold → `loading="lazy" decoding="async"`; above the fold (hero) stay eager. Guard optional images with `@if (src)`.
- **Admin:** signals + `AdminApiService`; styles live in `src/styles/_admin.scss` under `.admin`.
- **Don't reuse Bootstrap class names.** Bootstrap's CSS is global: a class such as `.modal` (`display: none`), `.btn`, `.card`, `.badge` or `.form-*` silently inherits Bootstrap's rules. The delete dialog once rendered as an invisible box for exactly this reason (it is now `.dialog`). Prefer the project's own names, and check new UI visually — an automated "element exists" test would not have caught it.
- **Guards:** call `inject()` *before* the first `await` (otherwise Angular throws outside an injection context).
- **Line endings:** the repo is mostly CRLF; git normalises. Don't mass-reformat files.
- **Commits:** conventional style used so far (`feat: …`, `fix: …`).

---

## 9. How to… (recipes)

### Add a field to every project (e.g. `client`)
1. `models/project.model.ts` — add it to the right interface.
2. `backend/src/validators/schemas.js` — add it to `projectSchema` (give optional fields a default so old rows still load).
3. `admin/project-form/project-form.html` + `blankProject()` in `.ts` — add the input and default value.
4. Public component — render it. Old rows will not have the value, so guard with `@if`.
5. No database migration is needed (it is JSON). Add a test if there is logic.

### Add another optional section
Follow `spatialExperience`: model interface with `showcase?: boolean` → validator (`showcase` default `true`) → form checkbox in the section's header + `withShowcaseDefaults()` + `blankProject()` → wrap the component in `selected-project.html` with `@if (project.x.showcase !== false)`.

### Add a project category
Add it to `PROJECT_CATEGORIES` in **both** `project.model.ts` and `schemas.js`, then add the label `Projects.section.<Category>` to `en.json` and `ar.json` (the key is the category name, e.g. `Projects.section.Hospitality`).

### Add a public page
Create `pages/<name>/<name>.ts` (+ section folder), add a lazy route in `app.routes.ts` **with `title` and `data.description`** (SEO), add the nav link in `shared/navbar`, add translations, add it to the page list in `scripts/generate-sitemap.mjs`.

### Add an admin page
Create the component under `admin/<name>/`, add a child route in `admin/admin.routes.ts` (inside the `authGuard` block), add a link in `admin/shell/shell.html`.

### Add an API endpoint
Route in `routes/*.routes.js` → controller in `controllers/*.js` (wrap with `asyncHandler`, throw `ApiError.*`) → schema in `validators/schemas.js` used through `validate(schema)`. Public reads use `optionalAuth`; writes use `requireAuth`. Add the call to `AdminApiService` and document it in section 7.

### Change the database schema
Edit `prisma/schema.prisma`, then `npm run db:push` (development). For production use Prisma migrations (`prisma migrate dev` locally, `prisma migrate deploy` on the server) instead of `db:push`. Stop the API first when running `prisma generate` on Windows (the engine file is locked).

### Add a translation
Add the same key to both `src/assets/i18n/en.json` and `ar.json` (keep the structure identical) and use it with the `translate` pipe.

---

## 10. Testing

**Unit tests** (`npm test`; headless: `CHROME_BIN=<chrome.exe> npx ng test --watch=false --browsers=ChromeHeadless`) — 27 specs: app shell, media URLs, slug generator, projects service (API / fallback / drafts), guards, auth interceptor.

Add a spec next to the code (`*.spec.ts`). Provide what the component needs: `provideRouter([])`, `provideHttpClient()` + `provideHttpClientTesting()`, `provideTranslateService({ lang: 'en', fallbackLang: 'en' })`. Set `sessionStorage['x-line-intro-seen'] = '1'` when rendering `App` so the intro does not play.

**End-to-end:** the browser checks used during development (Puppeteer driving Chrome) are not stored in the repo. If you want a permanent suite, Playwright is the natural choice. Scenarios worth covering: guard redirects, login → create (with upload) → publish → public page → unpublish → delete, token refresh, 404 page, language persistence, contact form (mock EmailJS).

**API smoke test:** `curl http://localhost:4000/api/health`, then log in and call the endpoints in section 7.

---

## 11. Build, deploy, operate

Production checklist:

1. **Backend `.env`:** strong `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 chars, different), `NODE_ENV=production`, real `DATABASE_URL`, `CORS_ORIGINS` = the site's origin(s), `PUBLIC_URL` = the API's public URL, change the seeded admin password.
2. **Cookies:** same domain for site and API → defaults are fine (cookie is `Secure` in production). Different domains → `COOKIE_SAMESITE=none` (HTTPS required) and a full `apiUrl` in `environment.production.ts`.
3. **Frontend:** `environment.production.ts` uses `apiUrl: '/api'` (API behind the same domain through a reverse proxy that also forwards `/uploads`). Change it if the API is elsewhere.
4. **Build:** `SITE_URL=https://your-domain API_URL=https://your-domain/api npm run build` → `dist/my-app/browser`. Serve it with fallback to `index.html` (single-page app) and long caching for hashed files.
5. **API process:** `npm start` (or a process manager); run `npx prisma migrate deploy` (or `db:push` for the first deploy) and `npm run db:seed` once.
6. **Uploads:** `backend/uploads` must persist across deploys (volume or object storage) and be backed up with the database.
7. **EmailJS:** restrict the public key to your domain in the EmailJS dashboard; the recipient is `environment.contact.recipientEmail`.
8. **Rate limits & proxy:** the API trusts one proxy hop (`trust proxy 1`); keep that in step with your hosting.

Backups: database (`mysqldump`) + `backend/uploads/`. Restoring a project's images without the database rows does nothing, and vice versa.

---

## 12. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `self-signed certificate in certificate chain` from npm/Prisma/ng build | Corporate TLS proxy. Run the command with `NODE_USE_SYSTEM_CA=1` (Node then trusts the Windows certificate store). Do **not** disable TLS verification. |
| `prisma generate` fails with EPERM/rename | The API is running and holds the Prisma engine file. Stop it, generate, restart. |
| Site can't reach the API / lists show only bundled projects | API not running, or `apiUrl` / `CORS_ORIGINS` mismatch. Check `http://localhost:4000/api/health`. |
| `localhost:4200` works but `127.0.0.1:4200` doesn't | The dev server binds IPv6. Use `localhost`. Node scripts should call the API at `127.0.0.1:4000`. |
| Signed out on every reload | Refresh cookie not stored: check `COOKIE_SAMESITE`/`Secure`, that the API is on the same site, and that the request sends credentials. |
| Admin shows fewer projects than expected | Drafts are only returned to a valid session; an expired session now returns 401 and triggers refresh/sign-out. |
| Can't save a project as published | It needs a card image and a hero image (API rule). Upload them or untick Published. |
| Upload says "not a valid image" | The file isn't a decodable JPEG/PNG/WebP/AVIF. |
| `npm install` fails with ERESOLVE after bumping Angular | Update all `@angular/*` together and use `npm install --legacy-peer-deps` once. |
| Docker/MySQL unreachable | Docker Desktop must be running; check `docker ps` for `xline-mysql`. |
| Dev servers stop when a terminal closes | Start them detached, or in their own terminals. |

---

## 13. Quality rules to keep

- **Performance:** add images already optimised (run `npm run optimize:images`); the site was once 125 MB per page because of multi-megabyte originals. Check new pages at tablet width for horizontal scroll.
- **Security:** never commit `.env`; validate everything on the server; images are re-encoded (never serve user files raw); keep dependencies patched (`npm audit`).
- **Accessibility:** keep the skip link, give animated headings an `aria-label`, respect reduced motion, keep link/button names.
- **SEO:** every route needs `title` + `data.description`.

---

## 14. Known limitations / open items

- Four published projects (Masterplan, Mali Tower, Zara Branch, Modern Villa) and the Madar Tower draft have no hero image; they cannot be re-saved as published until one is uploaded.
- No server-side rendering / pre-rendering (search engines get meta tags and a sitemap, not pre-rendered HTML).
- Contact form has no CAPTCHA (trap field + minimum time + cooldown only).
- Prisma 7 upgrade pending (clears the last `npm audit` item, which is in Prisma's CLI config tooling).
- Images lack `width`/`height` attributes (small layout shift while loading).
- No automated end-to-end suite in the repo.
- `EDITOR` role exists in the schema but every signed-in user currently has full access.
