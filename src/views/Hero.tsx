import { useEffect, useState } from 'react';
import { getPopularPosts } from '../services/postsAPI';
import { Link } from 'react-router-dom';

import dot from '../assets/svg/dot.svg';
import Loader from '../components/Loader';
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

  // Only feature posts that actually have a hero image and author avatar.
  // The markup below dereferences image.url and author_3.avatar.url directly,
  // so a post published without an image (image === null) would otherwise
  // throw during render and blank the whole site (no error boundary above us).
  const featuredPosts = popularPosts.filter(
    post => post?.image?.url && post?.author_3?.avatar?.url,
  );

  // The Hero is a homepage enhancement, not the page itself. If there are no
  // featured posts (empty/failed feed), render nothing and let the rest of the
  // homepage (search, categories, about, newsletter) show — never blank the
  // whole homepage with a 404 just because this one feed was empty.
  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="container section__padding pt-0">
      <h1 className="sr-only">
        HairStylesForSeniors — Hair Care, Styles &amp; Confidence Tips for
        Adults 50+
      </h1>
      {featuredPosts.length > 0 && (
        <div className="grid md:grid-cols-[70%_30%] gap-6">
          <Link
            to={`/post/${featuredPosts[0].documentId}`}
            className="group p-4 hover:shadow-lg rounded-lg h-full bg-white dark:bg-additionalText  flex flex-col"
          >
            <div className="flex items-center py-4 flex-wrap gap-4">
              <img
                src={featuredPosts[0].author_3.avatar.url}
                alt={featuredPosts[0].author_3.name}
                className="rounded-full w-12 h-12"
              />
              <h5 className="section__title text-base font-bold">
                <p className="text-mainText dark:text-white">
                  {featuredPosts[0].author_3.name}
                </p>
              </h5>
              <img src={dot} alt="" aria-hidden="true" className="w-2 h-2" />
              <p className="section__description text-additionalText text-sm">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }).format(new Date(featuredPosts[0].createdAt))}
              </p>
            </div>
            <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={featuredPosts[0].image.url}
                alt={featuredPosts[0].title}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="mt-6 flex flex-col gap-4 pb-4">
              <h2 className="section__title text-3xl text-mainText">
                {featuredPosts[0].title}
              </h2>
              <RenderDescription
                description={featuredPosts[0].description}
                className="section__description text-base"
                truncate={true}
              />
              <p className="section__description text-main dark:text-main">
                Read more
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-6 h-full">
            {featuredPosts.slice(1, 3).map(post => (
              <Link
                key={post.documentId}
                to={`/post/${post.documentId}`}
                className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col flex-1"
              >
                <div className="flex items-center pb-2 flex-wrap gap-3">
                  <img
                    src={post.author_3.avatar.url}
                    alt={post.author_3.name}
                    className="rounded-full w-9 h-9"
                  />
                  <h5 className="section__title text-sm font-bold">
                    <p className="text-mainText dark:text-white">
                      {post.author_3.name}
                    </p>
                  </h5>
                  <img
                    src={dot}
                    alt=""
                    aria-hidden="true"
                    className="w-2 h-2"
                  />
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
