# X-Line API

Express + Prisma + MySQL backend for the admin dashboard (`/admin` in the Angular app).

## Setup

```bash
cd backend
npm install
cp .env.example .env      # set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_*
npm run setup             # prisma generate + db push + seed (admin user + projects.json import)
npm run dev               # http://localhost:4000/api/health
```

Then run the site (`npm start` in the repo root) and sign in at <http://localhost:4200/admin/login>.
The site reads the API address from `apiUrl` in `src/environments/environment.ts` (development) and
`environment.production.ts` (production build).

`npm run admin:set -- you@example.com "a-new-password-12+"` creates or resets an admin account.

> If `prisma generate` fails with a certificate error on a corporate network, run it with
> `NODE_USE_SYSTEM_CA=1` so Node trusts the Windows certificate store.

## Authentication

- `POST /api/auth/login` returns a short-lived **access token** in the body (the site keeps it in memory)
  and sets the long-lived **refresh token** as an `httpOnly` cookie (`xl_rt`, path `/api/auth`), which page
  scripts cannot read.
- `POST /api/auth/refresh` reads that cookie, rotates it and returns a new access token. `POST /api/auth/logout`
  clears it.
- Site and API on one domain: the defaults work. On **different** domains set `COOKIE_SAMESITE=none` (HTTPS
  required), add the site to `CORS_ORIGINS`, and use the full API URL in `environment.production.ts`.
- New passwords need at least 12 characters. Sign-in is limited to 10 failed attempts per 15 minutes per IP.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | – | Sign in |
| POST | `/api/auth/refresh` | cookie | New access token (rotates the cookie) |
| POST | `/api/auth/logout` | – | Clear the refresh cookie |
| GET | `/api/auth/me` | ✔ | Current user |
| POST | `/api/auth/change-password` | ✔ | Change own password |
| GET | `/api/projects` | optional | Published projects (`?category=`). `?includeUnpublished=true` adds drafts and **requires** a valid token (401 otherwise) |
| GET | `/api/projects/:id` | optional | One project. A draft needs a valid token and `includeUnpublished=true` |
| POST | `/api/projects` | ✔ | Create |
| PUT | `/api/projects/:id` | ✔ | Update (the ID cannot change) |
| PUT | `/api/projects/reorder` | ✔ | Save the display order: `{ "ids": [...] }` |
| DELETE | `/api/projects/:id` | ✔ | Delete |
| POST | `/api/projects/upload` | ✔ | Upload one image (`image` field) → `{ "url": "/uploads/projects/….webp" }` |

## Projects and images

- A project is one JSON document per row (see `prisma/schema.prisma`); its shape is validated by
  `src/validators/schemas.js`, which mirrors `src/app/models/project.model.ts`. Keep the two in sync,
  including `PROJECT_CATEGORIES`.
- Images are `""` (not uploaded yet), an `http(s)` URL, a `/uploads/...` path or a bundled `assets/...` path.
  Anything else (free text, `javascript:` URLs) is rejected.
- **A project cannot be published without a card image and a hero image.** Drafts may leave them empty.
- Uploads are re-encoded as WebP (max 1920px wide) and stored in `uploads/`. They are saved as
  site-relative paths, so changing the API domain never breaks them.
- When a project is edited or deleted, uploaded files that nothing references any more are removed.
