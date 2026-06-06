import axios from 'axios';

const BASE_URL = 'https://vivid-triumph-4386b82e17.strapiapp.com/api';
// const BASE_URL = 'http://localhost:1337/api';

const apiData = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const getProtectedPassword = async () => {
  const res = await apiData.get('/protected-page');
  return res.data?.data?.password || null;
};

export const getCategories = async () => {
  const categories = await apiData.get(
    '/category3s?populate[image][populate]=*',
  );
  return categories.data;
};

export const getPopularPosts = async () => {
  const res = await apiData.get(
    '/post3s?populate[category_3][populate]=*&populate[author_3][populate]=*&populate[image][populate]=*&sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=5',
  );

  return res.data; // возвращаем объект целиком
};

export const getPost = async documentId => {
  // Only populate what the article actually renders. The ads / firstAdBanner /
  // secondAdBanner relations were removed from the UI, so populating them just
  // bloated the payload (and slowed prerendering) for no reason.
  const post = await apiData.get(
    `/post3s/${documentId}?populate[paragraphs][populate]=*&populate[category_3][populate]=*&populate[image][populate]=*&populate[author_3][populate]=*&populate[comments]=true`,
  );
  return post.data;
};

// Comment submission backend. Override with VITE_COMMENT_API in
// .env.production to point at your own neutral host instead of the default.
const COMMENT_API =
  (import.meta as unknown as { env?: { VITE_COMMENT_API?: string } }).env
    ?.VITE_COMMENT_API || 'https://api.nice-advice.info/comment';

export const postComment = async ({ postId, username, text }) => {
  const res = await axios.post(
    COMMENT_API,
    { postId, username, text, site: 'hairstyles' },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return res.data;
};

export const getRelatedPosts = async () => {
  const relatedPosts = await apiData.get(
    '/post3s?populate[category_3][populate]=*&populate[author_3][populate]=*&populate[image][populate]=*&filters[isPopular][$eq]=true&pagination[page]=1&pagination[pageSize]=4',
  );
  return relatedPosts.data;
};

export const getCategory = async documentId => {
  const category = await apiData.get(
    `/category3s/${documentId}?populate[image][populate]=*`,
  );
  return category.data;
};

export const getPostsByCategory = async (
  categoryDocumentId,
  page = 1,
  pageSize = 10,
) => {
  const posts = await apiData.get(
    `/post3s?filters[category_3][documentId][$eq]=${categoryDocumentId}&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getAuthor = async authorDocumentId => {
  const author = await apiData.get(
    `/author3s/${authorDocumentId}?populate[avatar][populate]=*`,
  );
  return author.data;
};

export const getPostsByAuthor = async (
  authorDocumentId,
  page = 1,
  pageSize = 10,
) => {
  const posts = await apiData.get(
    `/post3s?filters[author_3][documentId][$eq]=${authorDocumentId}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getSearchedPosts = async (query, page = 1, pageSize = 10) => {
  const posts = await apiData.get(
    `/post3s?filters[title][$containsi]=${query}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getNewPosts = async (page = 1, pageSize = 10) => {
  // Callers only use the documentId of each result (to drive the "keep reading"
  // infinite feed), so fetch ONLY that field — `populate=*` here pulled every
  // relation of 10 full posts (megabytes) just to read their ids.
  const posts = await apiData.get(
    `/post3s?fields[0]=documentId&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
  );
  return posts.data;
};

// Lightweight list of EVERY published article (id + title + category only) for
// the /articles archive page. Paginated so all posts are returned, but with a
// minimal field set so the payload stays small even with hundreds of articles.
export const getAllPostsLite = async () => {
  const pageSize = 100;
  const maxPages = 50; // hard cap against accidental infinite loops
  const all = [];
  let page = 1;
  while (page <= maxPages) {
    const res = await apiData.get(
      `/post3s?fields[0]=documentId&fields[1]=title&fields[2]=createdAt&populate[category_3][fields][0]=name&populate[category_3][fields][1]=documentId&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    );
    const data = res.data?.data ?? [];
    all.push(...data);
    const pageCount = res.data?.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page += 1;
  }
  return all;
};

export const signUpForNewsletter = async email => {
  const response = await apiData.post('/newsletters', {
    data: {
      email: email,
    },
  });
  return response.data;
};
