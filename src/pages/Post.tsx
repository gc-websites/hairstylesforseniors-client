import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getNewPosts, getPost, getRelatedPosts } from '../services/postsAPI';

import dot from '../assets/svg/dot.svg';

import Loader from '../components/Loader';
import Page404 from './Page404';
import Disclaimer from '../views/Disclaimer';
import HorizontalAdBanner from '../views/HorizontalAdBanner';
import RenderDescription from '../components/RenderDescription';
import AdList from '../components/AdList';
import InfinitePost from '../components/InfinitePost';
import Comments from '../components/Comments';
import { io } from 'socket.io-client';
import { SITE, stripHtml, useSEO } from '../utils/useSEO';

const PostSEO = ({ post }) => {
  const description =
    stripHtml(post.description || '', 160) ||
    `${post.title} – article on HairStylesForSeniors.`;

  const articleUrl = `${SITE.ORIGIN}/post/${post.documentId}`;
  const categoryUrl = post.category_3
    ? `${SITE.ORIGIN}/category/${post.category_3.documentId}`
    : null;
  const authorUrl = post.author_3
    ? `${SITE.ORIGIN}/author/${post.author_3.documentId}`
    : null;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    image: post.image?.url ? [post.image.url] : [SITE.DEFAULT_IMAGE],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    author: post.author_3
      ? {
          '@type': 'Person',
          name: post.author_3.name,
          url: authorUrl,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE.NAME,
      logo: {
        '@type': 'ImageObject',
        url: 'https://vivid-triumph-4386b82e17.media.strapiapp.com/tick_b2fcfe5480.svg',
      },
    },
    articleSection: post.category_3?.name,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE.ORIGIN}/`,
      },
      ...(post.category_3
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: post.category_3.name,
              item: categoryUrl,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: post.category_3 ? 3 : 2,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  useSEO({
    title: post.title,
    description,
    canonical: `/post/${post.documentId}`,
    image: post.image?.url,
    type: 'article',
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt || post.createdAt,
    author: post.author_3?.name,
    keywords: post.category_3?.name,
    jsonLd: [articleJsonLd, breadcrumbJsonLd],
  });

  return null;
};

const socket = io('https://vivid-triumph-4386b82e17.strapiapp.com');

const Post = () => {
  const [post, setPost] = useState({});
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const postId = pathname.split('/').pop();
  const [postIds, setPostIds] = useState([]);

  const [activeUsers, setActiveUsers] = useState({});

  useEffect(() => {
    socket.on('updateAllActiveUsers', data => {
      setActiveUsers(data);
    });
    socket.on('updateActiveUsers', ({ postId, count }) => {
      setActiveUsers(prev => ({
        ...prev,
        [postId]: count,
      }));
    });

    return () => {
      socket.off('updateAllActiveUsers');
      socket.off('updateActiveUsers');
    };
  }, [postId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const post = await getPost(postId);
        const related = await getRelatedPosts();
        const ids = await getNewPosts();
        setPostIds(ids.data.map(post => post.documentId));
        setRelatedPosts(related.data);
        setPost(post.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    socket.emit('joinPost', postId);
    socket.on('updateActiveUsers', data => {
      if (data.postId === postId) {
        setActiveUsers(prevActiveUsers => ({
          ...prevActiveUsers,
          [postId]: data.count,
        }));
      }
    });

    return () => {
      socket.emit('leavePost', postId);
      socket.off('updateActiveUsers');
    };
  }, [postId]);

  if (isLoading) {
    return <Loader />;
  }

  if (!post || Object.keys(post).length === 0) {
    return <Page404 />;
  }

  const filteredPostIds = postIds?.filter(id => id !== postId);

  const getReadingCount = postId => activeUsers[postId] || 0;

  return (
    <div className="flex flex-col gap-8">
      <PostSEO post={post} />
      {/* <HorizontalAdBanner
        image={post.firstAdBanner.image.url}
        url={post.firstAdBanner.url}
      /> */}

      <nav aria-label="Breadcrumb" className="container pt-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-additionalText">
          <li>
            <Link to="/" className="hover:text-main">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {post.category_3 && (
            <>
              <li>
                <Link
                  to={`/category/${post.category_3.documentId}`}
                  className="hover:text-main"
                >
                  {post.category_3.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="text-mainText line-clamp-1">
            {post.title}
          </li>
        </ol>
      </nav>

      <article className="container grid md:grid-cols-[70%_30%] gap-6 py-10">
        <div className="group p-4 rounded-lg h-full bg-white dark:bg-additionalText flex flex-col">
          <header className="flex items-center py-4 flex-wrap gap-4">
            <Link
              to={`/author/${post.author_3.documentId}`}
              className="flex items-center flex-wrap gap-4"
              rel="author"
            >
              <img
                src={post.author_3.avatar.url}
                alt={`Avatar of ${post.author_3.name}`}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="rounded-full w-12 h-12"
              />
              <h5 className="section__title underline hover:text-main transition text-base font-bold">
                {post.author_3.name}
              </h5>
            </Link>
            <img src={dot} alt="" aria-hidden="true" className="w-2 h-2" />
            <time
              dateTime={new Date(post.createdAt).toISOString()}
              className="section__description text-additionalText text-sm"
            >
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              }).format(new Date(post.createdAt))}
            </time>
          </header>

          <h1 className="section__title text-4xl text-mainText mb-4">
            {post.title}
          </h1>
          <Link
            to={`/category/${post.category_3.documentId}`}
            className="section__title block text-2xl text-main dark:text-main mb-6 hover:underline"
          >
            {post.category_3.name}
          </Link>

          <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src={post.image.url}
              alt={post.title}
              width={1200}
              height={900}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center transform"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 pb-4">
            <RenderDescription
              description={post.description}
              className="section__description text-base"
              truncate={false}
            />

            {/* <AdList ads={post.ads} /> */}

            <div className="pt-6 flex flex-col gap-4">
              <h3 className="section__title text-2xl text-mainText">
                {post.paragraphs[0].subtitle}
              </h3>

              <RenderDescription
                description={post.paragraphs[0].description}
                className="section__description text-base"
                truncate={false}
              />

              {/* <AdList ads={post.paragraphs[0].ads} /> */}

              <img
                src={post.paragraphs[0].image.url}
                alt={post.paragraphs[0].subtitle}
                loading="lazy"
                decoding="async"
                className="w-full object-cover rounded"
              />
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <h3 className="section__title text-2xl text-mainText">
                {post.paragraphs[1].subtitle}
              </h3>

              <RenderDescription
                description={post.paragraphs[1].description}
                className="section__description text-base"
                truncate={false}
              />

              {/* <AdList ads={post.paragraphs[1].ads} /> */}

              <img
                src={post.paragraphs[1].image.url}
                alt={post.paragraphs[1].subtitle}
                loading="lazy"
                decoding="async"
                className="w-full object-cover rounded"
              />
            </div>
          </div>
        </div>

        <aside
          aria-label="Related articles"
          className="flex flex-col gap-6 h-full"
        >
          {/* <div className="bg-white dark:bg-additionalText p-4 rounded-lg">
            <h3 className="section__title text-xl font-bold mb-4">
              Advertisements
            </h3>
            <a href={post.secondAdBanner.url} target="_blank" rel="noreferrer">
              <img
                src={post.secondAdBanner.image.url}
                alt="advertisement"
                className="w-full border-gray-400 border-[1px] rounded"
              />
            </a>
          </div> */}

          <h2 className="sr-only">Related articles</h2>
          {relatedPosts.slice(0, 4).map(post => (
            <Link
              key={post.documentId}
              to={`/post/${post.documentId}`}
              className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col"
            >
              <div className="flex items-center pb-2 flex-wrap gap-3">
                <img
                  src={post.author_3.avatar.url}
                  alt={`Avatar of ${post.author_3.name}`}
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className="rounded-full w-9 h-9"
                />
                <h5 className="section__title text-sm font-bold">
                  {post.author_3.name}
                </h5>
                <img src={dot} alt="" aria-hidden="true" className="w-2 h-2" />
                <time
                  dateTime={new Date(post.createdAt).toISOString()}
                  className="section__description text-additionalText text-xs"
                >
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(new Date(post.createdAt))}
                </time>
              </div>
              <div className="w-full aspect-[4/3] overflow-hidden rounded-lg mb-3">
                <img
                  src={post.image.url}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <p className="section__description text-sm text-main dark:text-main">
                  {getReadingCount(post.documentId)} reading now
                </p>
                <h3 className="section__title text-lg text-mainText">
                  {post.title}
                </h3>
                <RenderDescription
                  description={post.description}
                  className="section__description text-sm"
                  truncate={true}
                />
                <p className="section__description text-main dark:text-main text-sm mt-auto">
                  Read more
                </p>
              </div>
            </Link>
          ))}
        </aside>
      </article>

      <Comments postId={postId} initialComments={post.comments || []} />

      <Disclaimer />

      <InfinitePost
        postIds={filteredPostIds}
        getReadingCount={getReadingCount}
      />
    </div>
  );
};

export default Post;
