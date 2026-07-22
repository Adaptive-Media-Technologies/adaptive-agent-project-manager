Fix the Ahrefs audit findings. Report contents:

| Issue | Severity | Count | Root cause |
| --- | --- | --- | --- |
| Multiple meta description tags | Error | ~28 URLs | Static `<meta name="description">` in `index.html` + per-route Helmet description both end up in the DOM |
| Open Graph URL not matching canonical | Warning | ~28 URLs | Static `og:url` in `index.html` hard-coded to `https://agntive.ai/` — appears on every route alongside the per-route Helmet `og:url` |
| Slow page (TTFB / load) | Warning | 19 URLs | Font stylesheet is render-blocking, Ahrefs + gtag load in `<head>`; some hosting cold-start TTFB not fixable from code |
| HTTP → HTTPS 301 | Notice | 1 | Expected DNS-level redirect, informational |
| 3XX redirect | Warning | 1 | Same root redirect as above |

## 1. Duplicate `<meta name="description">` (Error)

`index.html` and each route's `<Helmet>` both emit one. `react-helmet-async` dedupes for JS-executing crawlers but Ahrefs still records the pre-hydration tag alongside the hydrated one.

- Remove from `index.html`: `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:url">`.
- Keep in `index.html` (as fallback for non-JS social crawlers on the homepage): `og:type`, `og:title`, `og:description`, `og:image`, `twitter:*`. These are the same value as the homepage's Helmet and won't fire the "multiple descriptions" rule because they're `property="og:*"`, not `name="description"`.
- Every route already sets `<title>`, `<meta name="description">`, `<link rel="canonical">`, and `og:*` via Helmet — verified in `LandingPage.tsx`, `Auth.tsx`, `Docs.tsx`, `StaticPageLayout.tsx`.

## 2. `og:url` mismatch (Warning)

Static `og:url = https://agntive.ai/` in `index.html` conflicts with the per-route canonical.

- Removed as part of step 1. Per-route Helmet sets `og:url` to match its canonical (already the case in `StaticPageLayout`, `LandingPage`, `Auth`, `Docs`).

## 3. Verify canonical + og:url self-reference on every route

Audit each Helmet consumer to make sure both `<link rel="canonical">` and `<meta property="og:url">` point to the current route (per head-meta guide). Files to re-check:
- `src/pages/LandingPage.tsx` — should be `/`
- `src/pages/Auth.tsx` — `/auth`
- `src/pages/Docs.tsx` — `/docs`
- `src/components/landing/StaticPageLayout.tsx` — uses `url` prop; spot-check callers (`Security`, `Privacy`, `Contact`, `Cookie-Policy`, `Careers`, `Press`, `GDPR`, `Changelog`, `Terms`, `About`, `Community`, `Status`, `Partners`, `Data-Processing`, `Small-Team-Workspace`, `Blog`) pass the correct URL.
- `src/main.tsx` — confirm `<HelmetProvider>` wraps the tree exactly once.

## 4. Slow page (Warning) — frontend levers only

TTFB of 2–16s is largely Lovable hosting cold-start and can't be fixed in code, but a few frontend changes reduce render-blocking:

- `index.html`: swap the Google Fonts `<link rel="stylesheet">` for a non-blocking pattern (`rel="preload" as="style" onload="this.rel='stylesheet'"` with a `<noscript>` fallback). Removes ~200–400 ms of blocking on every page.
- Move `<script src="…ahrefs…">` and the gtag `<script>` block to the end of `<body>` (still `async`, but out of the critical `<head>` parse path).
- Add `<link rel="preload">` for the primary display font weight (Sora 700) so it's ready when the hero renders.
- Confirm route-level `React.lazy` code-splitting from prior work is still in place (`App.tsx`).

## 5. HTTP→HTTPS + 3XX redirect (Notice / Warning)

These describe the `http://agntive.ai/ → https://agntive.ai/` redirect performed by Lovable hosting. Not fixable from application code; will be marked as reviewed/ignored in the SEO tab.

## 6. Rescan

After deploying, tell the user to rerun the Ahrefs Site Audit; the duplicate-description and og:url errors should clear immediately, and slow-page numbers should improve on warm cache.

## Files touched

- `index.html` (remove duplicate description/canonical/og:url; non-blocking font load; move analytics scripts to end of body)
- `src/pages/LandingPage.tsx`, `src/pages/Auth.tsx`, `src/pages/Docs.tsx` (verify canonical+og:url self-reference; no changes expected unless mismatch found)
- `src/components/landing/StaticPageLayout.tsx` (spot-check `url` prop propagation)
- `src/main.tsx` (confirm single `<HelmetProvider>`)

No backend, routing, or business-logic changes.
