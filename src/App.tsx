import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getCategories } from './services/postsAPI';

import Layout from './layout/Layout';
import Loader from './components/Loader';
import Page404 from './pages/Page404';
import ScrollToTop from './utils/ScrollToTop';
import PrivateRouteWithPassword from './components/PrivateRouteWithPassword';

const Home = lazy(() => import('./pages/Home'));
const Post = lazy(() => import('./pages/Post'));
const Category = lazy(() => import('./pages/Category'));
const Search = lazy(() => import('./pages/Search'));
const Author = lazy(() => import('./pages/Author'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Generation = lazy(() => import('./pages/Generation'));
const Product = lazy(() => import('./pages/Product'));
const ProductGeneration = lazy(() => import('./pages/ProductGeneration'));

const App = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCategories();
        setCategories(data.data);
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

  if (categories.length === 0) {
    return <Page404 />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Layout categories={categories}>
        <ScrollToTop trigger={location} />
        <Routes>
          <Route path="/" element={<Home categories={categories} />} />
          <Route path="/post/:postId" element={<Post />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/search" element={<Search categories={categories} />} />
          <Route path="/author/:authorId" element={<Author />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/generation"
            element={
              <PrivateRouteWithPassword>
                <Generation />
              </PrivateRouteWithPassword>
            }
          />
          <Route path="*" element={<Page404 />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route
            path="/generation/product"
            element={
              <PrivateRouteWithPassword>
                <ProductGeneration />
              </PrivateRouteWithPassword>
            }
          />
        </Routes>
      </Layout>
    </Suspense>
  );
};

export default App;
