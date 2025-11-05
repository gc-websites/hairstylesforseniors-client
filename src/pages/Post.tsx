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
import { io } from 'socket.io-client';

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
      {/* <HorizontalAdBanner
        image={post.firstAdBanner.image.url}
        url={post.firstAdBanner.url}
      /> */}

      <section className="container grid md:grid-cols-[70%_30%] gap-6 py-10">
        <div className="group p-4 rounded-lg h-full bg-white dark:bg-additionalText flex flex-col">
          <div className="flex items-center py-4 flex-wrap gap-4">
            <Link
              to={`/author/${post.author_3.documentId}`}
              className="flex items-center flex-wrap gap-4"
            >
              <img
                src={post.author_3.avatar.url}
                alt={post.author_3.name}
                className="rounded-full w-12 h-12"
              />
              <h5 className="section__title underline hover:text-main transition text-base font-bold">
                {post.author_3.name}
              </h5>
            </Link>
            <img src={dot} alt="dot" className="w-2 h-2" />
            <p className="section__description text-additionalText text-sm">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              }).format(new Date(post.createdAt))}
            </p>
          </div>

          <h2 className="section__title text-4xl text-mainText mb-4">
            {post.title}
          </h2>
          <span className="section__title block text-2xl text-main dark:text-main mb-6">
            {post.category_3.name}
          </span>

          <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src={post.image.url}
              alt={post.title}
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

            {post.paragraphs.map(
              ({ id, subtitle, description, image, ads }) => (
                <div key={id} className="pt-6 flex flex-col gap-4">
                  <h3 className="section__title text-2xl text-mainText">
                    {subtitle}
                  </h3>
                  <RenderDescription
                    description={description}
                    className="section__description text-base"
                    truncate={false}
                  />
                  {/* <AdList ads={ads} /> */}
                  <img
                    src={image.url}
                    alt={subtitle}
                    className="w-full object-cover rounded"
                  />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full">
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

          {relatedPosts.slice(0, 4).map(post => (
            <Link
              key={post.documentId}
              to={`/post/${post.documentId}`}
              className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col"
            >
              <div className="flex items-center pb-2 flex-wrap gap-3">
                <img
                  src={post.author_3.avatar.url}
                  alt={post.author_3.name}
                  className="rounded-full w-9 h-9"
                />
                <h5 className="section__title text-sm font-bold">
                  {post.author_3.name}
                </h5>
                <img src={dot} alt="dot" className="w-2 h-2" />
                <p className="section__description text-additionalText text-xs">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(new Date(post.createdAt))}
                </p>
              </div>
              <div className="w-full aspect-[4/3] overflow-hidden rounded-lg mb-3">
                <img
                  src={post.image.url}
                  alt={post.title}
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
        </div>
      </section>

      <Disclaimer />

      <InfinitePost
        postIds={filteredPostIds}
        getReadingCount={getReadingCount}
      />
    </div>
  );
};

export default Post;
