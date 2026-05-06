import { useEffect } from 'react';

const SITE_NAME = 'HairStylesForSeniors';
const SITE_ORIGIN = 'https://nice-advice.info';
const DEFAULT_IMAGE =
  'https://vivid-triumph-4386b82e17.media.strapiapp.com/preview_2_bc7b8d12af.png';

export interface SEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string;
}

const setMeta = (
  selector: string,
  attr: 'name' | 'property',
  key: string,
  value: string,
) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const setName = (key: string, value: string) =>
  setMeta(`meta[name="${key}"]`, 'name', key, value);

const setProperty = (key: string, value: string) =>
  setMeta(`meta[property="${key}"]`, 'property', key, value);

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

const removeManagedJsonLd = () => {
  document.head
    .querySelectorAll('script[data-managed-seo="true"]')
    .forEach(node => node.remove());
};

const addJsonLd = (
  data: Record<string, unknown> | Array<Record<string, unknown>>,
) => {
  const list = Array.isArray(data) ? data : [data];
  list.forEach(item => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.managedSeo = 'true';
    script.text = JSON.stringify(item);
    document.head.appendChild(script);
  });
};

export const buildAbsoluteUrl = (path?: string): string => {
  if (!path) return `${SITE_ORIGIN}${window.location.pathname}`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

export const useSEO = (options: SEOOptions) => {
  const {
    title,
    description,
    canonical,
    image,
    type = 'website',
    noindex,
    jsonLd,
    publishedTime,
    modifiedTime,
    author,
    keywords,
  } = options;

  useEffect(() => {
    const fullTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Practical Health, Family, Nutrition & Lifestyle Tips`;

    document.title = fullTitle;

    if (description) {
      setName('description', description);
      setProperty('og:description', description);
      setName('twitter:description', description);
    }

    if (keywords) setName('keywords', keywords);

    const canonicalHref = buildAbsoluteUrl(canonical);
    setCanonical(canonicalHref);
    setProperty('og:url', canonicalHref);

    setProperty('og:title', title ? `${title} | ${SITE_NAME}` : fullTitle);
    setName('twitter:title', title ? `${title} | ${SITE_NAME}` : fullTitle);
    setProperty('og:type', type);
    setProperty('og:site_name', SITE_NAME);

    const imageUrl = image || DEFAULT_IMAGE;
    setProperty('og:image', imageUrl);
    setName('twitter:image', imageUrl);
    setName('twitter:card', 'summary_large_image');

    setName(
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );

    if (type === 'article') {
      if (publishedTime) setProperty('article:published_time', publishedTime);
      if (modifiedTime) setProperty('article:modified_time', modifiedTime);
      if (author) setProperty('article:author', author);
    }

    removeManagedJsonLd();
    if (jsonLd) addJsonLd(jsonLd);

    return () => {
      removeManagedJsonLd();
    };
  }, [
    title,
    description,
    canonical,
    image,
    type,
    noindex,
    publishedTime,
    modifiedTime,
    author,
    keywords,
    JSON.stringify(jsonLd ?? null),
  ]);
};

type RichTextChild = {
  type?: string;
  text?: string;
  children?: RichTextChild[];
};
type RichTextBlock = { type?: string; children?: RichTextChild[] };

const extractTextFromNode = (node: unknown): string => {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(' ');
  if (typeof node === 'object') {
    const obj = node as RichTextBlock & RichTextChild;
    if (typeof obj.text === 'string') return obj.text;
    if (Array.isArray(obj.children)) return extractTextFromNode(obj.children);
  }
  return '';
};

export const stripHtml = (input: unknown, max = 160): string => {
  if (input == null) return '';
  const raw = typeof input === 'string' ? input : extractTextFromNode(input);
  if (!raw) return '';
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
};

export const SITE = { NAME: SITE_NAME, ORIGIN: SITE_ORIGIN, DEFAULT_IMAGE };
