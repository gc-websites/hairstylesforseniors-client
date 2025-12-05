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
  const post = await apiData.get(
    `/post3s/${documentId}?populate[paragraphs][populate]=*&populate[category_3][populate]=*&populate[image][populate]=*&populate[ads][populate]=*&populate[firstAdBanner][populate]=*&populate[secondAdBanner][populate]=*&populate[author_3][populate]=*`,
  );
  return post.data;
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
  const posts = await apiData.get(
    `/post3s?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const signUpForNewsletter = async email => {
  const response = await apiData.post('/newsletters', {
    data: {
      email: email,
    },
  });
  return response.data;
};
