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

const buildDynamicRoutes = async (): Promise<string[]> => {
  try {
    const [posts, categories, authors] = await Promise.all([
      fetchAllDocs('post3s'),
      fetchAllDocs('category3s'),
      fetchAllDocs('author3s'),
    ]);

    return [
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      ...categories.map(c => `/category/${c.documentId}`),
      ...authors.map(a => `/author/${a.documentId}`),
      ...posts.map(p => `/post/${p.documentId}`),
    ];
  } catch {
    return ['/about', '/contact', '/privacy', '/terms'];
  }
};

export default defineConfig(async () => {
  const dynamicRoutes = await buildDynamicRoutes();

  return {
    plugins: [
      react(),
      Sitemap({
        hostname: 'https://nice-advice.info',
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
