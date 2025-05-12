import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSearchedPosts } from '../services/postsAPI';

import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Categories from '../views/Categories';
import RenderDescription from '../components/RenderDescription';

const Search = ({ categories }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 10;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query');

  useEffect(() => {
    if (!query || query.length < 3) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const posts = await getSearchedPosts(query, currentPage, pageSize);
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
  }, [query, currentPage]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <section className="container pt-12">
        <h2 className="section__title mb-6 text-mainText break-words">
          Search results for: "{query}"
        </h2>
        {posts.length > 0 ? (
          <div>
            <div>
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
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          !isLoading && <p className="section__description">Nothing found 😕</p>
        )}
      </section>
      <Categories categories={categories} />
    </div>
  );
};

export default Search;
