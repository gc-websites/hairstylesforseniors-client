import { useEffect, useState } from 'react';
import { getPopularPosts } from '../services/postsAPI';
import { Link } from 'react-router-dom';

import dot from '../assets/svg/dot.svg';
import Loader from '../components/Loader';
import RenderDescription from '../components/RenderDescription';

const formattedDate = iso =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));

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

  const [lead, ...rest] = featuredPosts;
  const sidePosts = rest.slice(0, 2);

  return (
    <section className="container section__padding pt-0">
      <h1 className="sr-only">
        HairStylesForSeniors — Hair Care, Styles &amp; Confidence Tips for
        Adults 50+
      </h1>

      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
        <p className="font-poppins text-main font-semibold uppercase tracking-wider text-sm mb-3">
          Fresh from the blog
        </p>
        <h2 className="section__title text-3xl md:text-4xl mb-4">
          Featured Stories
        </h2>
        <p className="section__description text-base">
          Hand-picked hair-care reads for adults 50 and up — start with our
          latest featured story, then keep exploring.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.7fr_1fr] md:gap-8 md:items-stretch">
        {/* Lead featured story */}
        <Link
          to={`/post/${lead.documentId}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-mainText shadow-md transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2"
        >
          <div className="relative w-full aspect-[16/10] overflow-hidden">
            <img
              src={lead.image.url}
              alt={lead.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            />
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-mainText px-3 py-1 font-poppins text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Featured
            </span>
            {lead.category_3?.name && (
              <span className="absolute bottom-4 left-4 inline-flex max-w-[60%] items-center truncate rounded-full bg-main3 px-3 py-1 font-poppins text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                {lead.category_3.name}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
            <h3 className="section__title text-2xl leading-snug transition-colors group-hover:text-main3 dark:group-hover:text-main md:text-3xl">
              {lead.title}
            </h3>
            <RenderDescription
              description={lead.description}
              className="section__description text-base"
              truncate={true}
            />
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
              <img
                src={lead.author_3.avatar.url}
                alt=""
                aria-hidden="true"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-mainText"
              />
              <span className="font-poppins text-sm font-semibold text-mainText dark:text-white">
                {lead.author_3.name}
              </span>
              <img src={dot} alt="" aria-hidden="true" className="h-2 w-2" />
              <time
                dateTime={lead.createdAt}
                className="font-poppins text-sm text-additionalText dark:text-white"
              >
                {formattedDate(lead.createdAt)}
              </time>
            </div>
            <span className="inline-flex items-center gap-1.5 font-poppins text-base font-semibold text-mainText dark:text-white">
              Read more
              <span
                aria-hidden="true"
                className="text-main3 transition-transform duration-300 motion-safe:group-hover:translate-x-1 dark:text-main"
              >
                →
              </span>
            </span>
          </div>
        </Link>

        {/* Two secondary stories */}
        <div className="flex flex-col gap-6 md:gap-8">
          {sidePosts.map(post => (
            <Link
              key={post.documentId}
              to={`/post/${post.documentId}`}
              className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white dark:bg-mainText shadow-md transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                  src={post.image.url}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
                {post.category_3?.name && (
                  <span className="absolute bottom-3 left-3 inline-flex max-w-[70%] items-center truncate rounded-full bg-main3 px-2.5 py-1 font-poppins text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                    {post.category_3.name}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="section__title text-lg leading-snug transition-colors group-hover:text-main3 dark:group-hover:text-main md:text-xl">
                  {post.title}
                </h3>
                <RenderDescription
                  description={post.description}
                  className="section__description text-sm"
                  truncate={true}
                />
                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
                  <img
                    src={post.author_3.avatar.url}
                    alt=""
                    aria-hidden="true"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-mainText"
                  />
                  <span className="font-poppins text-xs font-semibold text-mainText dark:text-white">
                    {post.author_3.name}
                  </span>
                  <img
                    src={dot}
                    alt=""
                    aria-hidden="true"
                    className="h-2 w-2"
                  />
                  <time
                    dateTime={post.createdAt}
                    className="font-poppins text-xs text-additionalText dark:text-white"
                  >
                    {formattedDate(post.createdAt)}
                  </time>
                </div>
                <span className="inline-flex items-center gap-1.5 font-poppins text-sm font-semibold text-mainText dark:text-white">
                  Read more
                  <span
                    aria-hidden="true"
                    className="text-main3 transition-transform duration-300 motion-safe:group-hover:translate-x-1 dark:text-main"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
