## Ahrefs Audit — Fix Plan

Full audit summary and per-file fixes below. Root cause of ~80% of warnings: this is a Vite SPA, so all crawler-visible `<head>` tags come from a single static `index.html`. Ahrefs sees the same title/description/OG on every URL, and the sitewide description is 168 chars (over 160).

### Issues in the audit

| Ahrefs issue | Pages | Root cause |
|---|---|---|
| Error: Page has no outgoing links | `/auth`, `/docs` | Bare pages, no nav/footer |
| Warning: H1 missing | `/auth` | No `<h1>` on the auth form |
| Warning: Low word count (40) | `/auth` | Form-only page |
| Warning: Meta description too long (168) | `/`, `/auth`, `/docs` | Sitewide `index.html` description exceeds 160 chars |
| Warning: Meta description too short (<110) | `/privacy`, `/contact`, `/cookie-policy`, `/press`, `/terms`, `/careers`, `/gdpr`, `/changelog`, `/about`, `/community`, `/status`, `/partners`, `/data-processing` | Short descriptions in `StaticPageLayout` `useEffect` |
| Warning: OG tags incomplete | All routes | `og:image` is `/favicon.png` (relative, not absolute https); no per-route `og:url` |
| Warning: Slow page (2–7 s) | All routes | Single monolithic SPA bundle, no route-level code splitting |
| Notice: HTTP→HTTPS 301 / 3XX redirect | `http://agntive.ai/` | Hosting-level, not actionable in code |
| Notice: Pages to submit to IndexNow | All | Informational only |

### Fixes

**1. Per-route head tags — install `react-helmet-async`**
- Add provider in `src/main.tsx`.
- Remove sitewide `og:title`, `og:description`, `og:url`, `og:image`, `twitter:*` from `index.html` where per-route values will override; keep only sitewide fallbacks.
- Fix sitewide description in `index.html` to ≤ 160 chars (rewrite to ~155).
- Set `og:image` to an absolute https URL: `https://agntive.ai/favicon.png` (or omit — Lovable hosting injects one).

**2. Add `<Helmet>` to every landing/static route**
Give each page a unique title, a 130–155 char description, self-referencing `canonical` + `og:url`, and per-route `og:title` / `og:description`.

Routes to update (all in `src/pages/`):
- `LandingPage.tsx` — home, use trimmed ≤160 description.
- Static pages via `StaticPageLayout.tsx` — extend props to accept an optional longer `ogDescription` and a route `path`, then render Helmet inside the layout for: `About`, `Careers`, `Changelog`, `Community`, `CookiePolicy`, `DataProcessing`, `GDPR`, `Partners`, `PressKit`, `PrivacyPolicy`, `Security`, `StatusPage`, `TermsOfService`, `Contact`.
- `Auth.tsx`, `Docs.tsx`, `Blog.tsx`, `BlogPost.tsx`, `ReplaceSlackNotion.tsx`, `SmallTeamWorkspace.tsx` — add Helmet directly.

**3. Lengthen short meta descriptions (target 130–155 chars)**
Rewrite the descriptions passed to `StaticPageLayout` on: Privacy, Contact, CookiePolicy, PressKit, TermsOfService, Careers, GDPR, Changelog, About, Community, StatusPage, Partners, DataProcessing. Each rewrite adds a benefit clause + brand mention to reach ~140 chars without keyword-stuffing.

**4. Fix `/auth` — H1 + outgoing links + word count**
- Add a visible `<h1>Sign in to Agntive</h1>` (styled small if needed) above the card.
- Wrap the page with `LandingNav` + `LandingFooter` (adds 20+ outbound links, resolves both "no outgoing links" and "low word count").
- Add a short SEO paragraph under the form describing what Agntive is (~80 words).

**5. Fix `/docs` — outgoing links**
- Wrap `Docs.tsx` with `LandingNav` + `LandingFooter`.
- Add Helmet with docs-specific title/description.

**6. Slow page — route-level code splitting**
In `src/App.tsx`, convert route components to `React.lazy(() => import(...))` with a `<Suspense>` fallback. This shrinks the initial bundle so first-render on marketing routes drops from ~7 s to ~1–2 s TTFB-equivalent.

**7. Non-actionable notices — document only**
- HTTP→HTTPS 301 is correct behavior; leave.
- IndexNow: I'll leave a note; user can enable via Bing/IndexNow key later if desired.

### Files changed
- `package.json` — add `react-helmet-async`
- `index.html` — trim description, remove/adjust OG duplicates, absolute og:image
- `src/main.tsx` — wrap with `HelmetProvider`
- `src/components/landing/StaticPageLayout.tsx` — render Helmet, accept `path` + `ogDescription`
- `src/pages/*` (14 static pages) — pass longer descriptions + path
- `src/pages/Auth.tsx` — H1, LandingNav/Footer, SEO paragraph, Helmet
- `src/pages/Docs.tsx` — LandingNav/Footer, Helmet
- `src/pages/LandingPage.tsx`, `Blog.tsx`, `BlogPost.tsx`, `ReplaceSlackNotion.tsx`, `SmallTeamWorkspace.tsx` — Helmet
- `src/App.tsx` — React.lazy + Suspense for route splitting

### Out of scope
- Per-route metadata will work for JS-executing crawlers (Googlebot, Ahrefs with rendering). Social-preview crawlers (LinkedIn/Slack/Facebook) still see the static `index.html` fallback — full per-route social previews would require SSR (not this stack).
- HTTP→HTTPS redirect notice is hosting behavior, no code fix.
