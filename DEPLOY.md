# Deploy & AdSense-readiness guide

This site is a Vite + React SPA that is **prerendered at build time** so every
indexable URL ships real HTML (not an empty `<div id="root">`). This guide covers
building, hosting (nginx / Apache), Google Search Console, and the AdSense steps
you must do in the dashboard.

---

## 1. Build

```bash
npm install          # first time only (installs puppeteer + Chromium for prerender)
npm run build        # vite build  +  prerender every route from the sitemap
```

Output is in `dist/`. The build:

1. Runs `vite build` (bundles the app, generates `sitemap.xml` + `robots.txt`
   from live Strapi data).
2. Runs `node scripts/prerender.mjs`, which boots the built app in headless
   Chromium for **every URL in `dist/sitemap.xml`** and writes the fully
   rendered HTML to `dist/<route>/index.html` — including the per-route
   `<title>`, meta description, canonical and JSON-LD that the app sets at
   runtime.

Useful flags:

| Command | What it does |
|---|---|
| `npm run build` | Full build + prerender all routes (use this for production). |
| `npm run build:csr` | Plain `vite build`, **no** prerender (fast; falls back to CSR). |
| `PRERENDER=false npm run build` | Build but skip prerender. |
| `PRERENDER_LIMIT=10 npm run build` | Prerender only the first 10 routes (testing). |
| `PRERENDER_CONCURRENCY=8 npm run build` | More parallel pages (faster, more RAM). |

Prerendering is **non-fatal**: if Chromium can't run or a route fails, the build
still succeeds and that route falls back to the normal CSR shell via the SPA
rewrite. A full prerender of all article/category/author/forum URLs takes a few
minutes.

> Always run `npm run build` in CI/deploy — never hand-deploy a stale `dist/`.
> A fresh build also refreshes the sitemap with any newly published articles.

---

## 2. Hosting (serve `dist/`)

The server must: serve real files directly, map pretty URLs to the prerendered
`<route>/index.html`, and fall back to `/index.html` for client-only routes.

### nginx
Use the sample in [`deploy/nginx.conf`](deploy/nginx.conf). Point `root` at your
`dist/` path and reload nginx. Core rule:

```nginx
location / {
    try_files $uri $uri/ $uri/index.html /index.html;
}
```

### Apache
`public/.htaccess` is copied into `dist/.htaccess` automatically, so Apache works
out of the box (needs `mod_rewrite` + `mod_headers`). Confirm `dist/.htaccess`
exists after building and that `AllowOverride All` is set for the vhost.

### Any static host (Cloudflare Pages, Netlify, S3+CloudFront, …)
Configure a SPA fallback to `/index.html`. `dist/404.html` is a real, branded,
`noindex` 404 page that hosts which auto-serve `/404.html` will use.

> The in-app router renders a `noindex` 404 view for unknown URLs (served with a
> 200 by the SPA fallback — a standard "soft 404"). That's fine; the `noindex`
> keeps junk URLs out of the index.

---

## 3. Google Search Console (indexing)

1. Add `https://hairstylesforseniors.com` as a property.
2. Choose **HTML tag** verification, copy the token (the `content="..."` value).
3. Put it in `.env.production` (see `.env.production.example`):
   ```
   VITE_GSC_TOKEN=your_token_here
   ```
   `vite.config.ts` injects `<meta name="google-site-verification" ...>` at build.
4. `npm run build`, deploy, then click **Verify**.
5. Submit `https://hairstylesforseniors.com/sitemap.xml` under **Sitemaps**.
6. Use **URL Inspection → Request indexing** for the homepage and a few key
   articles to kick off crawling.

---

## 4. AdSense — REQUIRED dashboard steps

The code keeps the AdSense loader (`ca-pub-1088654265590051`) in `index.html`.
The funnel/no-content pages that triggered the rejection have been removed from
the site. Before re-applying, do this in the AdSense dashboard:

1. **Turn OFF Auto Ads** (Ads → By site → your site → Auto ads = Off, or set Auto
   ads to off globally). Auto Ads was injecting ads on every page including
   thin/loading states. With it off, no ads render until you add manual units.
2. **Re-apply for review.** The site is now a clean content publisher: real
   articles, About/Contact/Privacy/Terms reachable from the menu, no fake
   captchas, no CPA redirects, real content in the HTML.
3. **After approval**, add manual `<ins class="adsbygoogle">` units **inside
   article bodies only** (e.g. in `Post.tsx` between paragraphs). Never place ad
   code on the search page, the in-app 404, or empty/loading states.

> Do **not** re-add any `/captcha`, `/rtcredit`, `/worldcars`, `/videomkt`,
> `/product` style pages or `nice-advice.info` redirects to this domain. Host any
> arbitrage funnel on a separate domain with no AdSense, or the account is at
> risk of a permanent ban.

---

## 5. Post-deploy checklist

- [ ] `npm run build` completes; `dist/` has per-route folders (`dist/about/index.html`, etc.).
- [ ] `dist/.htaccess` (Apache) or nginx config in place; deep links like `/about` and `/post/<id>` load directly.
- [ ] `view-source:` on the homepage and an article shows real text in `#root` (not an empty div).
- [ ] `robots.txt` and `sitemap.xml` resolve; sitemap has no `/captcha`, `/rtcredit`, `/worldcars`, `/videomkt`, `/product` URLs.
- [ ] GSC verified + sitemap submitted.
- [ ] AdSense Auto Ads turned OFF; site re-submitted for review.
