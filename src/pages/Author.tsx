import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuthor, getPostsByAuthor } from '../services/postsAPI';

import Loader from '../components/Loader';
import Page404 from './Page404';
import RenderDescription from '../components/RenderDescription';
import Pagination from '../components/Pagination';

const Author = () => {
  const { pathname } = useLocation();
  const authorId = pathname.split('/').pop();
  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState({});
  const [posts, setPosts] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const author = await getAuthor(authorId);
        const posts = await getPostsByAuthor(authorId, currentPage, pageSize);
        setAuthor(author.data);
        setPosts(posts.data);
        setPageCount(posts.meta.pagination.pageCount);
        window.scrollTo(0, 0);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authorId]);

  if (isLoading) {
    return <Loader />;
  }

  if (!author || Object.keys(author).length === 0) {
    return <Page404 />;
  }

  return (
    <div>
      <section>
        <div className="bg-main pt-16 md:pt-36 pb-10">
          <div className="relative container">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <p className="section__title pb-8 text-white text-3xl font-normal">
                  Writer
                </p>
                <h4 className="section__title text-white text-4xl md:text-6xl">
                  {author.name}
                </h4>
              </div>
              <img
                src={author.avatar.url}
                alt={author.name}
                className="absolute md:top-8 -top-12 right-12 sm:right-0 rounded-full max-w-28 max-h-28 sm:max-w-32 sm:max-h-32 md:max-w-64 md:max-h-64"
              />
            </div>
          </div>
        </div>
        <div className="container mt-8">
          <div className="max-w-full md:max-w-[70%]">
            <RenderDescription
              description={author.description}
              className="section__description"
            />
          </div>
        </div>
        <div className="container section__padding">
          <h4 className="section__title pb-4 text-2xl md:text-3xl">
            Latest from {author.name}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 h-full">
            {posts?.map(post => (
              <Link
                key={post.documentId}
                to={`/post/${post.documentId}`}
                className="group p-4 hover:shadow-lg rounded-lg bg-white dark:bg-additionalText transition duration-300 flex flex-col"
              >
                <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="mt-3 flex flex-col gap-4">
                  <h3 className="section__title text-2xl md:text-3xl text-mainText">
                    {post.title}
                  </h3>
                  <RenderDescription
                    description={post.description}
                    className="section__description text-base"
                    truncate={true}
                  />
                  <p className="section__description text-main dark:text-main text-base">
                    Read more
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  );
};

export default Author;
