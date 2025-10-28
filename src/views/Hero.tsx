import { useEffect, useState } from 'react';
import { getPopularPosts } from '../services/postsAPI';
import { Link } from 'react-router-dom';

import dot from '../assets/svg/dot.svg';
import Loader from '../components/Loader';
import Page404 from '../pages/Page404';
import RenderDescription from '../components/RenderDescription';

const Hero = () => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getPopularPosts();
        setPopularPosts(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (popularPosts.length === 0) {
    return <Page404 />;
  }

  return (
    <section className="container section__padding pt-0">
      <h1 className="section__title mb-6 invisible">Nice Advice</h1>
      {popularPosts && popularPosts.length > 0 && (
        <div className="grid md:grid-cols-[70%_30%] gap-6">
          <Link
            to={`/post/${popularPosts[2].documentId}`}
            className="group p-4 hover:shadow-lg rounded-lg h-full bg-white dark:bg-additionalText  flex flex-col"
          >
            <div className="flex items-center py-4 flex-wrap gap-4">
              <img
                src={popularPosts[2].author.avatar.url}
                alt={popularPosts[2].author.name}
                className="rounded-full w-12 h-12"
              />
              <h5 className="section__title text-base font-bold">
                <p className="text-mainText dark:text-white">
                  {popularPosts[2].author.name}
                </p>
              </h5>
              <img src={dot} alt="dot" className="w-2 h-2" />
              <p className="section__description text-additionalText text-sm">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }).format(new Date(popularPosts[2].createdAt))}
              </p>
            </div>
            <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={popularPosts[2].image.url}
                alt={popularPosts[2].title}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="mt-6 flex flex-col gap-4 pb-4">
              <h2 className="section__title text-3xl text-mainText">
                {popularPosts[2].title}
              </h2>
              <RenderDescription
                description={popularPosts[2].description}
                className="section__description text-base"
                truncate={true}
              />
              <p className="section__description text-main dark:text-main">
                Read more
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-6 h-full">
            {popularPosts.slice(1, 3).map(post => (
              <Link
                key={post.documentId}
                to={`/post/${post.documentId}`}
                className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col flex-1"
              >
                <div className="flex items-center pb-2 flex-wrap gap-3">
                  <img
                    src={post.author.avatar.url}
                    alt={post.author.name}
                    className="rounded-full w-9 h-9"
                  />
                  <h5 className="section__title text-sm font-bold">
                    <p className="text-mainText dark:text-white">
                      {post.author.name}
                    </p>
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
                <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <h3 className="section__title text-lg text-mainText">
                    {post.title}
                  </h3>
                  <RenderDescription
                    description={post.description}
                    className="section__description text-sm"
                    truncate={true}
                  />
                  <p className="section__description text-main dark:text-main text-sm">
                    Read more
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
