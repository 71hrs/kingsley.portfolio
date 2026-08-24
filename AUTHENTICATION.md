# Portfolio access and asset system

The site keeps its original HTML in `Website Pages/` and its unchanged asset sources in `Assets/`. Every Case Study uses the same `/project-assets/...` media gateway. The project configuration decides whether that gateway is public or password protected.

`Assets/` is the only editable asset source. `public/static/` is generated and should not be edited. HTML pages are organized by site section under `Website Pages/`; use the local server for previews rather than opening nested HTML files directly. Authentication files and project access configuration are grouped in `Password System/`.

## Configure a project

Change only `protected: false` to `protected: true` in `Password System/config/projects.data.json` when a project needs a password. Both the page and its media immediately use the same rule. No files need to be moved.

Keep the GitHub repository private. Case Study media is stored once in Vercel Private Blob under `library/static/`; public projects are served without a password and protected projects require the signed session cookie.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Generate a password hash with `pnpm auth:hash -- "your password"`.
3. Generate `SESSION_SECRET` with `openssl rand -base64 32`.
4. Run `pnpm dev` and open `http://localhost:3000`.

Local development reads all project media directly from `Assets/` through the same controlled route.

## Vercel deployment

1. Import the private GitHub repository into Vercel.
2. Add `PORTFOLIO_PASSWORD_HASH`, `SESSION_SECRET`, and `AUTH_VERSION` to Production and Preview environment variables.
3. Create and connect a Private Vercel Blob store. Keep `BLOB_READ_WRITE_TOKEN` server-only.
4. Run `pnpm assets:upload-all` after adding or replacing project media. Assets are deduplicated into one private library.
5. Deploy a preview, complete the security tests, then attach `yuhuiqi.com`.
6. Disable the old GitHub Pages deployment so legacy public HTML cannot bypass authentication.

Protected HTML and asset responses use `private, no-store` and explicit Vercel CDN no-store headers. The session is signed, HttpOnly, Secure in production, SameSite=Lax, scoped to the entire site, and expires after seven days.

## Required production checks

- An unauthenticated protected URL returns only the password page.
- A wrong password stays on the password page and shows the inline error.
- A correct password sets the secure cookie and reveals the page.
- The same cookie unlocks every protected project.
- Protected copy is absent from returned HTML and browser JavaScript bundles.
- Direct protected asset requests without the cookie return 404.
- Protected responses are never publicly cached.
