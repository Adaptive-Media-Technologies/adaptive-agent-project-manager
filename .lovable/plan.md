# Ahrefs audit fixes — 12 Sep report

## What the report actually contains

| Issue | Level | Pages | Verdict |
| --- | --- | --- | --- |
| Orphan page (no incoming internal links) | Error | 22 | Crawler setting + internal links |
| Title too long (over 60 chars) | Warning | 19 | Fix titles |
| Low word count | Warning | 25 | Expand articles |
| Meta description too long | Warning | 1 | Trim to under 155 chars |
| Slow page / slow response for AI crawlers | Warning | 49 / 46 | Cannot fix in the site code |
| Only one incoming internal link | Notice | 4 | Internal links |
| HTTP to HTTPS redirect, 3XX redirect | Notice / Warning | 1 each | Expected, no action |
| Changed pages not submitted to IndexNow | Notice | many | Optional, needs an outside service |

Good news: the duplicate-canonical, missing-H1 and missing-description errors from the earlier reports are all gone.

## 1. Orphan pages (Error, 22 articles)

The crawl ran with JavaScript switched off, so Ahrefs saw the page shell with no article text and no links. That is why 22 articles look like they have no links pointing at them even though the blog index lists them all.

- You switch JavaScript rendering on in the Ahrefs project crawl settings, then re-run the audit. This is a setting on their side, not something I can change in the site.
- I will also add a short "Related articles" block at the bottom of each article, linking three other articles by shared tag. This gives every article several genuine incoming links and also clears the 4 "only one incoming link" notices.

## 2. Titles too long (Warning, 19 articles)

Every article title currently ends with " | Agntive Blog", which adds 15 characters. Combined with headlines up to 72 characters, 19 titles land between 64 and 87.

- Change the suffix to " | Agntive".
- Trim the longest headlines so each finished title fits inside 60 characters, keeping the same meaning and main search term.
- Headline changes go to the article records and to the small backup title list used while a page is loading, so both stay in step.

## 3. Low word count (Warning, 25 articles)

This one is real, not a crawl artefact: the articles run 250 to 500 words each. Only "AI in project management" (1,291 words) is a full piece.

- Expand each of the 25 flagged articles to roughly 900 to 1,200 words, keeping the existing angle, headline intent and TL;DR.
- Added material stays grounded: how Agntive actually works, practical steps, worked examples, trade-offs, and short FAQ sections. No invented statistics, customer names, prices, awards or research claims.
- Work in batches of about five articles so you can read and approve the tone early rather than after all 25.

## 4. Meta description too long (Warning, 1)

"AI in project management" is 174 characters. Trim it to under 155 without dropping its main term.

## 5. Slow pages (Warning, 49) — cannot be fixed from the site code

Time to first byte is 2.0 to 5.9 seconds, and the pages themselves are only 7 to 17 KB. The delay is entirely the hosting response before any of our files are involved, so nothing in the code changes it. The front-end is already lean: fonts load without blocking, analytics sits at the end of the page, and pages are split so only what is needed downloads.

I will report this as an accepted warning. If it matters commercially, the real fix is server-rendered hosting rather than a code tweak — I can explain the options separately.

## 6. Redirect notices (1 each) — no action

`http://agntive.ai/` correctly sends visitors to `https://agntive.ai/` with a permanent redirect. That is exactly what should happen; Ahrefs lists it for information. Mark as reviewed.

## 7. IndexNow notice — optional, your call

IndexNow pings search engines the moment a page changes. It needs an API key file hosted on the domain and a ping whenever content changes. Not in scope unless you want it; say the word and I will plan it.

## Technical notes

- Files: `src/pages/BlogPost.tsx` (title suffix, related-articles block), `src/components/blog/postTitles.ts` and `src/components/blog/postMeta.ts` (fallback title/description sync), a new small related-posts query in `src/hooks/useBlogPosts.ts`.
- Database: `blog_posts` updates for shortened titles, the trimmed meta description, and expanded `content` per article.
- `public/sitemap.xml` already lists all 26 posts; `lastmod` values get refreshed for edited posts.
- No changes to canonicals, H1s, pricing, design or product behaviour.

## After shipping

Publish, then re-run the Ahrefs audit with JavaScript rendering enabled. Expected result: orphan errors and the single-link notices clear, title and description warnings clear, word-count warnings clear as each batch lands, and the speed and redirect items remain as accepted.
