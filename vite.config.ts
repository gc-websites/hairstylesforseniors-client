import { defineConfig } from 'vite';
import Sitemap from 'vite-plugin-sitemap';
import react from '@vitejs/plugin-react';

const STRAPI_BASE = 'https://vivid-triumph-4386b82e17.strapiapp.com/api';

const fetchAllDocs = async (
  endpoint: string,
  pageSize = 100,
): Promise<Array<{ documentId: string; updatedAt?: string }>> => {
  const all: Array<{ documentId: string; updatedAt?: string }> = [];
  let page = 1;
  // Hard cap to avoid infinite loops if API misbehaves at build time
  const maxPages = 50;
  while (page <= maxPages) {
    try {
      const res = await fetch(
        `${STRAPI_BASE}/${endpoint}?fields[0]=documentId&fields[1]=updatedAt&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      );
      if (!res.ok) break;
      const json = (await res.json()) as {
        data?: Array<{ documentId: string; updatedAt?: string }>;
        meta?: { pagination?: { pageCount?: number } };
      };
      const items = json.data ?? [];
      all.push(...items);
      const pageCount = json.meta?.pagination?.pageCount ?? 1;
      if (page >= pageCount) break;
      page += 1;
    } catch {
      break;
    }
  }
  return all;
};

const FORUM_CATEGORY_SLUGS = [
  'hair-care',
  'styling-tips',
  'color-and-dye',
  'hair-loss-and-thinning',
  'products-and-tools',
  'lifestyle-and-confidence',
];

const FORUM_CATEGORY_KEYS = [
  'Hair Care',
  'Styling Tips',
  'Color & Dye',
  'Hair Loss & Thinning',
  'Products & Tools',
  'Lifestyle & Confidence',
];

// Returns the path segment used by /forum/t/:segment — prefers slug, falls
// back to documentId. Also whitelists valid categories so legacy junk threads
// (Community / empty category) don't pollute the sitemap.
const fetchForumThreadSegments = async (): Promise<string[]> => {
  const catFilter = FORUM_CATEGORY_KEYS.map(
    (c, i) => `&filters[category][$in][${i}]=${encodeURIComponent(c)}`,
  ).join('');
  const all: string[] = [];
  let page = 1;
  const maxPages = 20;
  while (page <= maxPages) {
    try {
      const res = await fetch(
        `${STRAPI_BASE}/discussion-threads?filters[site][$eq]=hairstyles${catFilter}&fields[0]=slug&fields[1]=documentId&pagination[page]=${page}&pagination[pageSize]=100`,
      );
      if (!res.ok) break;
      const json = (await res.json()) as {
        data?: Array<{ slug?: string | null; documentId?: string }>;
        meta?: { pagination?: { pageCount?: number } };
      };
      const items = json.data ?? [];
      items.forEach(i => {
        const seg = i.slug && i.slug.length > 0 ? i.slug : i.documentId;
        if (seg) all.push(seg);
      });
      const pageCount = json.meta?.pagination?.pageCount ?? 1;
      if (page >= pageCount) break;
      page += 1;
    } catch {
      break;
    }
  }
  return all;
};

const buildDynamicRoutes = async (): Promise<string[]> => {
  try {
    const [posts, categories, authors, forumSegments] = await Promise.all([
      fetchAllDocs('post3s'),
      fetchAllDocs('category3s'),
      fetchAllDocs('author3s'),
      fetchForumThreadSegments(),
    ]);

    return [
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/forum',
      ...FORUM_CATEGORY_SLUGS.map(s => `/forum/c/${s}`),
      ...forumSegments.map(s => `/forum/t/${s}`),
      ...categories.map(c => `/category/${c.documentId}`),
      ...authors.map(a => `/author/${a.documentId}`),
      ...posts.map(p => `/post/${p.documentId}`),
    ];
  } catch {
    return [
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/forum',
      ...FORUM_CATEGORY_SLUGS.map(s => `/forum/c/${s}`),
    ];
  }
};

// Injects <meta name="google-site-verification" ...> if VITE_GSC_TOKEN is set.
// Lets the user enable Search Console verification without editing index.html.
const gscVerificationPlugin = () => ({
  name: 'gsc-verification',
  transformIndexHtml(html: string) {
    const token = process.env.VITE_GSC_TOKEN || '';
    const replacement = token
      ? `<meta name="google-site-verification" content="${token.replace(/"/g, '&quot;')}" />`
      : '';
    return html.replace('<!--%GSC_TOKEN_META%-->', replacement);
  },
});

export default defineConfig(async () => {
  const dynamicRoutes = await buildDynamicRoutes();

  return {
    plugins: [
      react(),
      gscVerificationPlugin(),
      Sitemap({
        hostname: 'https://hairstylesforseniors.com',
        dynamicRoutes,
        exclude: [
          '/generation',
          '/generation/product',
          '/search',
          '/captcha/credit/en',
          '/captcha/credit/fr',
          '/captcha/cars/en',
          '/captcha/video/en',
          '/rtcredit/en',
          '/rtcredit/fr',
          '/worldcars/en',
          '/videomkt/en',
          '/product/*',
          '/forum/new',
        ],
        changefreq: 'weekly',
        priority: 0.7,
        robots: [
          {
            userAgent: '*',
            allow: '/',
            disallow: [
              '/generation',
              '/search',
              '/captcha/',
              '/rtcredit/',
              '/worldcars/',
              '/videomkt/',
              '/product/',
              '/forum/new',
            ],
          },
          { userAgent: 'Mediapartners-Google', allow: '/' },
          { userAgent: 'AdsBot-Google', allow: '/' },
          { userAgent: 'Googlebot-Image', allow: '/' },
        ],
      }),
    ],
  };
});
