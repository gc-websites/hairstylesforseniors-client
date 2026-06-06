/**
 * Build-time prerendering for the HairStylesForSeniors SPA.
 *
 * WHY: the app is client-side rendered, so the raw HTML for every URL is an
 * empty <div id="root"></div>. That is bad for indexing AND it is the literal
 * trigger for AdSense's "ads on screens without publisher content" — the ad
 * script is in the HTML while the body has no content. This script boots the
 * built app in a headless browser for every route in the sitemap, waits for the
 * real content + per-route <title>/meta/canonical/JSON-LD (which useSEO injects
 * at runtime) to render, then writes that fully-rendered HTML to
 * dist/<route>/index.html. Crawlers and the AdSense reviewer now receive real
 * publisher content in the initial HTML.
 *
 * It is intentionally NON-FATAL: if puppeteer/Chromium is unavailable, or any
 * route fails, the build still succeeds and the affected route simply falls back
 * to the normal CSR shell (served via the SPA rewrite). Run `npm run build`.
 *
 * Env:
 *   PRERENDER=false      skip entirely
 *   PRERENDER_LIMIT=N    only prerender the first N routes (useful for testing)
 *   PRERENDER_CONCURRENCY=N   parallel pages (default 4)
 */
import http from 'node:http';
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = 5055;
const HOST = '127.0.0.1';
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 2);
const LIMIT = process.env.PRERENDER_LIMIT
  ? Number(process.env.PRERENDER_LIMIT)
  : Infinity;
// Optional substring filter (e.g. PRERENDER_MATCH=/post/ to only do articles).
const MATCH = process.env.PRERENDER_MATCH || '';
const NAV_TIMEOUT = Number(process.env.PRERENDER_NAV_TIMEOUT || 60000);
const CONTENT_TIMEOUT = Number(process.env.PRERENDER_CONTENT_TIMEOUT || 30000);

if (process.env.PRERENDER === 'false') {
  console.log('[prerender] PRERENDER=false → skipping.');
  process.exit(0);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Static file server for dist/ with SPA fallback to index.html. */
const createServer = (shellHtml) =>
  http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const ext = path.extname(urlPath);
      if (ext) {
        const filePath = path.join(DIST, urlPath);
        if (filePath.startsWith(DIST) && existsSync(filePath)) {
          const body = await readFile(filePath);
          res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
          });
          res.end(body);
          return;
        }
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      // Navigation request → always serve the CSR shell so the SPA renders.
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(shellHtml);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });

const getRoutesFromSitemap = async () => {
  const sitemapPath = path.join(DIST, 'sitemap.xml');
  if (!existsSync(sitemapPath)) return ['/'];
  const xml = await readFile(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const routes = locs
    .map((loc) => {
      try {
        return new URL(loc).pathname || '/';
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  // De-dupe, always include the homepage, keep it first.
  const set = new Set(['/', ...routes]);
  return [...set];
};

const outPathFor = (route) => {
  if (route === '/' || route === '') return path.join(DIST, 'index.html');
  const clean = route.replace(/\/+$/, '');
  return path.join(DIST, clean, 'index.html');
};

async function run() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html missing — did vite build run? Skipping.');
    return;
  }

  let puppeteer;
  try {
    ({ default: puppeteer } = await import('puppeteer'));
  } catch {
    console.warn(
      '[prerender] puppeteer not installed — skipping prerender (CSR build still valid).\n' +
        '            Run `npm install` then `npm run build` to enable prerendering.',
    );
    return;
  }

  const rawShell = await readFile(path.join(DIST, 'index.html'), 'utf8');
  // Serve a CLEAN empty-root shell (strip any previously-baked content) so the
  // SPA boots from scratch on every prerender.
  const shellHtml = rawShell.replace(
    /(<div id="root">)[\s\S]*?(<\/div>\s*<div id="modal">)/,
    '$1$2',
  );
  // The homepage default <title>. useSEO ALWAYS overwrites document.title, so on
  // any non-home route the title changing away from this default proves useSEO's
  // effect (which also sets canonical/meta/JSON-LD) has committed — capture only
  // then, otherwise we race and bake the homepage canonical into article pages.
  // NOTE: the title in raw HTML is entity-encoded (e.g. `&amp;`) but
  // document.title is decoded (`&`); decode here or the comparison never matches
  // and every page is captured mid-load (on the spinner).
  const decodeEntities = (s) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&#0?34;/g, '"');
  const homeTitle = decodeEntities(
    (rawShell.match(/<title>([^<]*)<\/title>/) || [])[1] || '',
  );

  let routes = await getRoutesFromSitemap();
  if (MATCH) routes = routes.filter((r) => r.includes(MATCH));
  if (Number.isFinite(LIMIT)) routes = routes.slice(0, LIMIT);
  console.log(`[prerender] ${routes.length} routes, concurrency ${CONCURRENCY}.`);

  const server = createServer(shellHtml);
  await new Promise((resolve) => server.listen(PORT, HOST, resolve));

  let browser;
  let ok = 0;
  let failed = 0;
  let stuck = 0;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const queue = [...routes];

    // Render one route. Returns { html, seoApplied }. seoApplied=false means the
    // per-route head/content didn't finish loading within the timeout (the page
    // was still on the spinner) — the caller retries those once.
    const renderOnce = async (route) => {
      const page = await browser.newPage();
      try {
        await page.setRequestInterception(true);
        page.on('request', (r) => {
          const u = r.url();
          // Block ad/analytics AND the realtime socket.io long-poll. The ad tags
          // stay in <head> (they run at real-user runtime). Blocking socket.io
          // matters: its persistent long-poll keeps the network busy and starves
          // the article data fetch. The app handles a missing socket gracefully.
          if (
            /googlesyndication|doubleclick|googletagmanager|google-analytics|adservice\.google|cookieconsent|\/socket\.io\//.test(
              u,
            )
          ) {
            r.abort();
          } else {
            r.continue();
          }
        });

        await page.goto(`http://${HOST}:${PORT}${route}`, {
          waitUntil: 'networkidle2',
          timeout: NAV_TIMEOUT,
        });

        // Wait until real content is painted (not just the spinner) AND useSEO
        // has applied the per-route head. The title comparison proves useSEO
        // committed (it also sets canonical/meta/JSON-LD in the same effect).
        let seoApplied = true;
        await page
          .waitForFunction(
            (route, defaultTitle) => {
              // Measure the PAGE BODY (#main-content), not the whole #root —
              // otherwise the persistent header/footer chrome satisfies the text
              // threshold while the page itself is still a loading spinner. A
              // page-level <Loader/> has no text, so an empty/spinner body keeps
              // text near 0 and we keep waiting until real content renders.
              const main =
                document.getElementById('main-content') ||
                document.getElementById('root');
              if (!main) return false;
              const txt = (main.innerText || '').trim();
              if (txt.length <= 150) return false;
              const isHome = route === '/' || route === '';
              if (!isHome && document.title === defaultTitle) return false;
              return true;
            },
            { timeout: CONTENT_TIMEOUT },
            route,
            homeTitle,
          )
          .catch(() => {
            seoApplied = false;
          });

        // Settle so canonical/meta/JSON-LD are committed before snapshotting.
        await new Promise((r) => setTimeout(r, 250));
        const html = await page.content();
        return { html, seoApplied };
      } finally {
        await page.close().catch(() => {});
      }
    };

    const worker = async () => {
      while (queue.length) {
        const route = queue.shift();
        try {
          let result = await renderOnce(route);
          // One retry for pages that didn't finish loading (transient slowness
          // under concurrent Strapi load).
          if (!result.seoApplied) {
            const retry = await renderOnce(route);
            if (retry.seoApplied) result = retry;
            else stuck += 1;
          }
          const outPath = outPathFor(route);
          await mkdir(path.dirname(outPath), { recursive: true });
          await writeFile(outPath, result.html, 'utf8');
          ok += 1;
          if (ok % 25 === 0) console.log(`[prerender] ${ok} done…`);
        } catch (err) {
          failed += 1;
          console.warn(`[prerender] FAILED ${route}: ${err.message}`);
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker()),
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
  }

  console.log(
    `[prerender] Complete: ${ok} prerendered, ${failed} failed, ${stuck} captured incomplete (still served as CSR fallback).`,
  );
}

run().catch((err) => {
  // Never fail the build because of prerendering.
  console.warn('[prerender] Non-fatal error:', err?.message || err);
  process.exit(0);
});
