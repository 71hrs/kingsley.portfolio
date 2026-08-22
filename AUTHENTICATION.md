# Portfolio project protection

The site keeps its original HTML in `legacy-pages/` and its unchanged asset sources in `source-assets/`. The build publishes only public files at the original `/static/...` URLs. Next.js now provides routing and server-side access control around those files.

`source-assets/` is the editable source of truth. `public/static/` is a generated, gitignored deployment copy and should not be edited. `legacy-pages/static` is a symbolic link to `source-assets/`, not another copy.

## Configure a project

All current projects are public. Change only `protected: false` to `protected: true` in `config/projects.data.json` when a project is ready. Both `/work/project-slug` and the legacy `/project-slug.html` URL use the same rule. `config/projects.config.ts` is the server-only typed reader and normally needs no edits.

Protected source content must not remain in a public GitHub repository. Before enabling protection, make the repository private and place sensitive HTML in `private-content/<source>.html`. Local private media belongs under `private-assets/<project-slug>/`; production media belongs in Vercel Private Blob under the same project-prefixed pathname.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Generate a password hash with `pnpm auth:hash -- "your password"`.
3. Generate `SESSION_SECRET` with `openssl rand -base64 32`.
4. Run `pnpm dev` and open `http://localhost:3000`.

For a local protected media URL such as `/protected-assets/example/demo.webm`, store the file as `private-assets/example/demo.webm`.

## Vercel deployment

1. Import the private GitHub repository into Vercel.
2. Add `PORTFOLIO_PASSWORD_HASH`, `SESSION_SECRET`, and `AUTH_VERSION` to Production and Preview environment variables.
3. Create and connect a Private Vercel Blob store. Keep `BLOB_READ_WRITE_TOKEN` server-only.
4. Run `pnpm assets:upload -- <project-slug>` to upload every media dependency of that Case Study to Private Blob.
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
