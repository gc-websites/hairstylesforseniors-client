import { Link, useLocation } from 'react-router-dom';
import {
  getCategory,
  getPostsByCategory,
  getRelatedPosts,
} from '../services/postsAPI';
import { useEffect, useState } from 'react';

import Loader from '../components/Loader';
import Page404 from './Page404';
import Pagination from '../components/Pagination';
import Disclaimer from '../views/Disclaimer';
import RenderDescription from '../components/RenderDescription';
import { io } from 'socket.io-client';

const socket = io('https://vivid-triumph-4386b82e17.strapiapp.com');

const Category = () => {
  const [category, setCategory] = useState({});
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const categoryId = pathname.split('/').pop();
  const pageSize = 10;

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
  }, [categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const category = await getCategory(categoryId);
        const posts = await getPostsByCategory(
          categoryId,
          currentPage,
          pageSize,
        );
        const related = await getRelatedPosts();
        setCategory(category.data);
        setRelatedPosts(related.data);
        setPosts(posts.data.reverse());
        setPageCount(posts.meta.pagination.pageCount);
        window.scrollTo(0, 0);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [categoryId, currentPage]);

  if (isLoading) {
    return <Loader />;
  }

  if (!category || Object.keys(category).length === 0) {
    return <Page404 />;
  }

  const getReadingCount = postId => activeUsers[postId] || 0;

  return (
    <div>
      <section className="container mx-auto py-8">
        <div>
          <div>
            <div className="relative vignette-container">
              <img
                src={category.image.url}
                alt={category.name}
                className="w-full object-cover object-center rounded max-h-96 mb-6"
              />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-4 z-40 rounded">
                <h2 className="section__title text-white md:text-4xl text-xl font-bold text-left">
                  {category.name}
                </h2>
              </div>
            </div>

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
        </div>
      </section>
      <Disclaimer />
    </div>
  );
};

export default Category;
