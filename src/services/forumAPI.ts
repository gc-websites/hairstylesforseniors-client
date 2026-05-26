import axios from 'axios';

const STRAPI_URL = 'https://vivid-triumph-4386b82e17.strapiapp.com/api';
const PROXY_URL =
  (import.meta as unknown as { env?: { VITE_FORUM_PROXY?: string } }).env
    ?.VITE_FORUM_PROXY || 'https://api.nice-advice.info';

const SITE = 'hairstyles';

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    key: 'Hair Care',
    slug: 'hair-care',
    emoji: '💆',
    blurb: 'Routines, washing, conditioning and scalp tips.',
  },
  {
    key: 'Styling Tips',
    slug: 'styling-tips',
    emoji: '✂️',
    blurb: 'Cuts, blow-drying, and at-home styling techniques.',
  },
  {
    key: 'Color & Dye',
    slug: 'color-and-dye',
    emoji: '🎨',
    blurb: 'Coloring, covering grays, highlights and toning.',
  },
  {
    key: 'Hair Loss & Thinning',
    slug: 'hair-loss-and-thinning',
    emoji: '🌱',
    blurb: 'Volume, regrowth, and gentle approaches.',
  },
  {
    key: 'Products & Tools',
    slug: 'products-and-tools',
    emoji: '🧴',
    blurb: 'Shampoos, brushes, irons and product reviews.',
  },
  {
    key: 'Lifestyle & Confidence',
    slug: 'lifestyle-and-confidence',
    emoji: '🌸',
    blurb: 'Aging gracefully, self-care and feeling great.',
  },
];

export interface ForumCategory {
  key: string;
  slug: string;
  emoji: string;
  blurb: string;
}

export interface ThreadSummary {
  id: number;
  documentId: string;
  title: string;
  slug?: string;
  body?: string;
  authorName: string;
  authorAvatarIdenticon?: string;
  category: string;
  site?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isAutoCreated?: boolean;
  viewCount?: number;
  commentCount?: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ThreadComment {
  id: number;
  documentId: string;
  body: string;
  authorName: string;
  authorAvatarIdenticon?: string;
  parentComment?: { documentId: string; id: number } | null;
  likes?: number;
  isHidden?: boolean;
  isFlagged?: boolean;
  createdAt: string;
  editedAt?: string;
}

export type ThreadSort = 'latest' | 'active' | 'top';

const forumStrapi = axios.create({
  baseURL: STRAPI_URL,
});

// Strapi has some legacy threads from other automations with site=hairstyles
// but no category (and author "Community"). Whitelist by valid category so
// the forum stays focused.
const CATEGORY_FILTER = FORUM_CATEGORIES.map(
  (c, i) => `&filters[category][$in][${i}]=${encodeURIComponent(c.key)}`,
).join('');

const forumProxy = axios.create({
  baseURL: PROXY_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const findCategoryByKey = (key: string): ForumCategory | undefined =>
  FORUM_CATEGORIES.find(c => c.key === key);

export const findCategoryBySlug = (slug: string): ForumCategory | undefined =>
  FORUM_CATEGORIES.find(c => c.slug === slug);

const buildSort = (sort: ThreadSort): string => {
  switch (sort) {
    case 'active':
      return 'sort=commentCount:desc&sort=lastActivityAt:desc';
    case 'top':
      return 'sort=viewCount:desc&sort=lastActivityAt:desc';
    case 'latest':
    default:
      return 'sort=lastActivityAt:desc&sort=createdAt:desc';
  }
};

export const getThreads = async ({
  category,
  page = 1,
  pageSize = 20,
  sort = 'latest',
  site = SITE,
  q,
}: {
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: ThreadSort;
  site?: string;
  q?: string;
} = {}): Promise<{
  data: ThreadSummary[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}> => {
  const sortStr = buildSort(sort);
  const catFilter = category
    ? `&filters[category][$eq]=${encodeURIComponent(category)}`
    : CATEGORY_FILTER;
  const qFilter =
    q && q.trim().length >= 2
      ? `&filters[title][$containsi]=${encodeURIComponent(q.trim())}`
      : '';
  const url = `/discussion-threads?filters[site][$eq]=${encodeURIComponent(site)}${catFilter}${qFilter}&${sortStr}&sort=isPinned:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  const res = await forumStrapi.get(url);
  return res.data;
};

/**
 * Trending threads: highest commentCount in the recent window.
 * Strapi can't natively filter by "created in last N days" cheaply with an
 * activity score, so we fetch by lastActivityAt within the window then
 * client-side sort by commentCount.
 */
export const getTrendingThreads = async ({
  site = SITE,
  pageSize = 5,
  windowDays = 14,
}: { site?: string; pageSize?: number; windowDays?: number } = {}): Promise<
  ThreadSummary[]
> => {
  const since = new Date(Date.now() - windowDays * 86400_000).toISOString();
  const url =
    `/discussion-threads?filters[site][$eq]=${encodeURIComponent(site)}` +
    `&filters[lastActivityAt][$gte]=${encodeURIComponent(since)}` +
    CATEGORY_FILTER +
    `&sort=commentCount:desc&sort=lastActivityAt:desc` +
    `&pagination[pageSize]=${pageSize}`;
  try {
    const res = await forumStrapi.get(url);
    const list = (res.data?.data ?? []) as ThreadSummary[];
    // Only show threads with actual activity
    return list.filter(t => (t.commentCount ?? 0) >= 1).slice(0, pageSize);
  } catch {
    return [];
  }
};

export const getThreadBySlug = async (
  slug: string,
  site: string = SITE,
): Promise<ThreadSummary | null> => {
  const url = `/discussion-threads?filters[slug][$eq]=${encodeURIComponent(slug)}&filters[site][$eq]=${encodeURIComponent(site)}&pagination[pageSize]=1`;
  const res = await forumStrapi.get(url);
  const list = (res.data?.data ?? []) as ThreadSummary[];
  return list[0] ?? null;
};

export const getThreadByDocumentId = async (
  documentId: string,
): Promise<ThreadSummary | null> => {
  try {
    const res = await forumStrapi.get(`/discussion-threads/${documentId}`);
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

export const getComments = async (
  threadDocumentId: string,
  { page = 1, pageSize = 100 }: { page?: number; pageSize?: number } = {},
): Promise<{
  data: ThreadComment[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}> => {
  const url =
    `/forum-comments?filters[thread][documentId][$eq]=${encodeURIComponent(threadDocumentId)}` +
    `&sort=createdAt:asc&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&populate[parentComment]=true`;
  const res = await forumStrapi.get(url);
  return res.data;
};

export const incrementThreadView = async (
  documentId: string,
  currentCount: number,
): Promise<void> => {
  try {
    await forumProxy.post('/forum/view', {
      threadDocumentId: documentId,
      currentCount: currentCount || 0,
    });
  } catch {
    // Non-fatal: view increment is best-effort
  }
};

export interface PostThreadInput {
  category: string;
  title: string;
  body: string;
  authorName: string;
  website?: string;
  t0: number;
}

export interface PostThreadResult {
  documentId: string;
  slug?: string;
}

export const postThread = async (
  input: PostThreadInput,
): Promise<PostThreadResult> => {
  const res = await forumProxy.post('/forum/thread', {
    site: SITE,
    ...input,
  });
  return res.data;
};

export interface PostReplyInput {
  threadDocumentId: string;
  parentCommentDocumentId?: string | null;
  body: string;
  authorName: string;
  website?: string;
  t0: number;
}

export interface PostReplyResult {
  documentId: string;
}

export const postReply = async (
  input: PostReplyInput,
): Promise<PostReplyResult> => {
  const res = await forumProxy.post('/forum/reply', {
    site: SITE,
    ...input,
  });
  return res.data;
};

export const postLike = async (
  commentDocumentId: string,
): Promise<{ likes: number }> => {
  const res = await forumProxy.post('/forum/like', { commentDocumentId });
  return res.data;
};
