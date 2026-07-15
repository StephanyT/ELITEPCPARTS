# Changelog

All notable changes to ELITEPCPARTS are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — 2026-06-30

### Authentication, accounts & synced cart (Firebase)
- `auth.js` rewritten to make **Firebase Auth the source of truth**. It mirrors a
  lightweight profile into `localStorage` for instant header paint, then follows
  `onAuthStateChanged`: builds the profile from the `usuarios/{uid}` doc, updates
  the header, and triggers the cart sync. `logout()` now calls `auth.signOut()`.
- **Header logged-in indicator** — the account icon becomes an avatar (initials) +
  dropdown showing the user's name/email with "Mi cuenta / Mis pedidos / Mis builds"
  and **Cerrar sesión**. The widget is idempotent and uses a path-aware selector so
  it works on the root `index.html` and every `src/pages/*` page (previously it only
  updated on `index.html`).
- **Cart persisted to Firestore per user.** `main.js` `saveCart()` mirrors the cart
  to `usuarios/{uid}.cart` while logged in. On login (`syncCartOnLogin`) the anonymous
  local cart is **merged** with the stored online cart — quantities for the same
  product id are summed — and the merged union is written back to both. Anonymous
  carts still work via `localStorage`.
- **Checkout → orders.** `carrito.js` checkout requires login, writes an order to
  `usuarios/{uid}.pedidos` (via `arrayUnion`), and clears the cart. `cuenta.js`
  "Mis pedidos" renders those real orders.
- **Standard account features.** Login page: **password reset** (`sendPasswordResetEmail`
  from the email field) and **"Recordarme"** persistence (LOCAL vs SESSION). Login +
  registro: **Google sign-in** (`signInWithPopup`) that upserts the `usuarios` doc.
  Account page: profile save (name/phone → Firestore + `updateProfile`) and
  **change password** (`updatePassword`).
- Cart/suggested/wishlist grids now use the Firestore catalog and **string product ids**
  (fixes the id quoting after the components migration). Added `data.js` to
  `carrito.html` and `cuenta.html` and fixed `cuenta.html` script order.
- `firestore.rules` — `usuarios/{uid}` widened to `usuarios/{uid}/{document=**}` so the
  per-user `cart`/`pedidos` (and any future subcollections) are covered; still private
  to the owning user.
- `SETUP.md` — added a **Firebase one-time owner setup** section (enable Email/Password
  + Google, `firebase deploy --only firestore:rules`, seed, authorized domains) and
  clarified that a cloned/redeployed copy needs **no Firebase credentials** — only the
  AWS secrets — since it uses the shared public Firebase project.

### Product data from Firestore
- Added `src/js/data.js` — a shared classic-global data layer (`window.EPC`) that
  loads the Firestore `components` collection once, caches the promise, and
  normalizes it into UI-ready records: type id → Spanish category, brand derived
  from the product name, `rating` string `"(NN)"` → stars (NN% of 5), and
  `socket`/`memType` parsed from the free-text specs for the PC Builder.
- Replaced the three hardcoded product datasets with Firestore data:
  - `main.js` — removed the sample `products` array; the home "featured" grid now
    renders the first 8 loaded products (cards link to `producto.html?id=`).
  - `catalogo.js` — loads the full catalog; category and brand filters are now
    generated from the data, and the price slider auto-sizes to the real range.
  - `producto.js` — binds the page to the product named by `?id=` (name, category,
    price, stars, image, breadcrumb, spec line, related products).
  - `pcbuilder.js` — builder steps are filled from the data grouped by slot, with
    real component images and specs-driven compatibility checks.
- Added `<script src=".../data.js">` after `firebase-init.js` on `index.html`,
  `catalogo.html`, `producto.html`, and `pcbuilder.html`.
- `firestore.rules` — `components` is now world-readable (`allow read: if true`)
  and client-write-denied; seeding stays via the Admin SDK
  (`scripts/import-components.mjs`). `usuarios` rules unchanged.

### CloudFront security headers (CSP)
- `infra/cloudformation.yml` — added an `AWS::CloudFront::ResponseHeadersPolicy`
  (attached to the default cache behavior) with a Content-Security-Policy that
  whitelists the Firebase/Google endpoints the SDK calls directly
  (`*.googleapis.com`, Identity Toolkit, Secure Token, `*.firebaseio.com`) and the
  `product-images-…` S3 bucket, plus HSTS/frame/referrer/nosniff headers.

### Project restructure (source layout)
- Moved the site into a `src/` structure with `index.html` kept at the repository root
  as the entry point:
  - `src/css/` — all stylesheets (`style.css`, `auth.css`, and per-page CSS).
  - `src/js/` — all scripts (`main.js`, `auth.js`, `firebase-init.js`, and per-page JS).
  - `src/pages/` — all secondary HTML pages (`404`, `carrito`, `catalogo`, `contacto`,
    `cuenta`, `login`, `pcbuilder`, `producto`, `registro`, `servicios`).
- Updated all referenced paths for the new layout:
  - `index.html` references assets as `src/css/…` / `src/js/…` and links to pages as
    `src/pages/….html`.
  - `src/pages/*.html` reference assets as `../css/…` / `../js/…`; the home link points to
    `../../index.html`; sibling page links stay relative.
- Removed stale duplicate `*.css` / `*.js` files that previously sat at the repo root
  (identical copies of the `css/` and `js/` folder versions).
- Removed a stray 0-byte `npm` file from the repo root.

### Build tooling (npm)
- Added `package.json` making the project build/deploy via npm. Scripts: `build`, `dev`,
  `preview`.
- Added `scripts/build.mjs` which assembles the deployable site into `dist/`:
  copies `index.html` + `src/`, then esbuild-bundles `firebase-init.js`.
- Ignored `dist/` in `.gitignore` (`node_modules/` was already ignored).

### Firebase
- Moved Firebase from the gstatic CDN `<script>` tags to the npm `firebase` package
  (pinned `^10.13.0`, matching the previous CDN version).
- `src/js/firebase-init.js` now imports `firebase/compat/{app,auth,firestore}` and is
  bundled by esbuild into a self-contained file; it exposes `window.firebase`,
  `window.auth`, and `window.db` for the classic (non-module) page scripts.
- Removed the three `gstatic.com/firebasejs/*-compat.js` CDN tags from `index.html` and
  every `src/pages/*.html`. All other scripts remain classic globals (unchanged), so the
  inline `onclick=` handlers keep working.
- Firestore project, rules, and config are unchanged — the bundled SDK initializes the same
  `firebaseConfig`.

### Deployment (AWS S3 + CloudFront)
- Added `infra/cloudformation.yml`: a private S3 bucket (all public access blocked, AES256)
  served through CloudFront via Origin Access Control (OAC), with `index.html` as the root
  object and 403/404 → `/src/pages/404.html`. Outputs the bucket name, distribution ID, and
  domain.
- Added `.github/workflows/deploy.yml` (on push to `main` + manual dispatch):
  `npm ci` → `npm run build` → `cloudformation deploy` (idempotent) → `s3 sync dist/`
  (long-cache assets, no-cache HTML) → CloudFront invalidation.
  Authenticates with `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets;
  region via `AWS_REGION` variable (default `us-east-1`).
- Updated `.github/workflows/ci.yml` to install deps, run the build, and verify the
  `dist/` artifact (instead of only checking `index.html`).

### Notes
- Post-deploy manual step: add the CloudFront domain to **Firebase Console → Authentication
  → Settings → Authorized domains** so Auth works from the new origin.
- The Firebase web API key in `firebase-init.js` is a public client identifier and is safe
  to keep in the repo.
