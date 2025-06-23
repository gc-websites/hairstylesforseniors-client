import axios from 'axios';

const BASE_URL = 'https://vivid-triumph-4386b82e17.strapiapp.com/api';
// const BASE_URL = 'http://localhost:1337/api';

const apiData = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const getCategories = async () => {
  const categories = await apiData.get(
    '/categories?populate[image][populate]=*',
  );
  return categories.data;
};

export const getPopularPosts = async () => {
  const popularPosts = await apiData.get(
    '/posts?populate[category][populate]=*&populate[author][populate]=*&populate[image][populate]=*&filters[isPopular][$eq]=true&pagination[page]=1&pagination[pageSize]=3',
  );
  return popularPosts.data;
};

export const getPost = async documentId => {
  const post = await apiData.get(
    `/posts/${documentId}?populate[paragraphs][populate]=*&populate[category][populate]=*&populate[image][populate]=*&populate[ads][populate]=*&populate[firstAdBanner][populate]=*&populate[secondAdBanner][populate]=*&populate[author][populate]=*`,
  );
  return post.data;
};

export const getRelatedPosts = async () => {
  const relatedPosts = await apiData.get(
    '/posts?populate[category][populate]=*&populate[author][populate]=*&populate[image][populate]=*&filters[isPopular][$eq]=true&pagination[page]=1&pagination[pageSize]=4',
  );
  return relatedPosts.data;
};

export const getCategory = async documentId => {
  const category = await apiData.get(
    `/categories/${documentId}?populate[image][populate]=*`,
  );
  return category.data;
};

export const getPostsByCategory = async (
  categoryDocumentId,
  page = 1,
  pageSize = 10,
) => {
  const posts = await apiData.get(
    `/posts?filters[category][documentId][$eq]=${categoryDocumentId}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getAuthor = async authorDocumentId => {
  const author = await apiData.get(
    `/authors/${authorDocumentId}?populate[avatar][populate]=*`,
  );
  return author.data;
};

export const getPostsByAuthor = async (
  authorDocumentId,
  page = 1,
  pageSize = 10,
) => {
  const posts = await apiData.get(
    `/posts?filters[author][documentId][$eq]=${authorDocumentId}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getSearchedPosts = async (query, page = 1, pageSize = 10) => {
  const posts = await apiData.get(
    `/posts?filters[title][$containsi]=${query}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
  );
  return posts.data;
};

export const getNewPosts = async (page = 1, pageSize = 10) => {
  const posts = await apiData.get(
    `/posts?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
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
