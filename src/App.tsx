import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getCategories } from './services/postsAPI';

import Layout from './layout/Layout';
import Loader from './components/Loader';
import Page404 from './pages/Page404';
import ScrollToTop from './utils/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Post = lazy(() => import('./pages/Post'));
const Category = lazy(() => import('./pages/Category'));
const Search = lazy(() => import('./pages/Search'));
const Author = lazy(() => import('./pages/Author'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Articles = lazy(() => import('./pages/Articles'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumCategory = lazy(() => import('./pages/ForumCategory'));
const Thread = lazy(() => import('./pages/Thread'));
const NewThread = lazy(() => import('./pages/NewThread'));

const App = () => {
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Google Consent Mode v2: gtag defaults to denied (set in index.html). When
    // the visitor accepts/declines via the cookie banner, update consent so
    // AdSense and Analytics honour the choice (and personalised ads can serve
    // for users who consent, e.g. in the EEA).
    const updateConsent = (granted: boolean) => {
      const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void })
        .gtag;
      if (!gtag) return;
      const v = granted ? 'granted' : 'denied';
      gtag('consent', 'update', {
        ad_storage: v,
        ad_user_data: v,
        ad_personalization: v,
        analytics_storage: v,
      });
    };

    if (window.cookieconsent) {
      window.cookieconsent.initialise({
        palette: {
          popup: { background: '#000' },
          button: { background: '#f1d600', text: '#000' },
        },
        theme: 'classic',
        type: 'opt-in', // opt-in = пользователь должен согласиться
        content: {
          message: 'We use cookies to improve website performance.',
          allow: 'Allow',
          deny: 'Deny',
          link: 'Details',
          href: '/privacy', // твоя страница политики
        },
        onInitialise: function (this: { hasConsented(): boolean }) {
          updateConsent(this.hasConsented());
        },
        onStatusChange: function (this: { hasConsented(): boolean }) {
          updateConsent(this.hasConsented());
        },
        onRevokeChoice: function () {
          updateConsent(false);
        },
      });
    }
  }, []);

  // Categories power the nav menu. They are a NICE-TO-HAVE for the chrome, not a
  // gate for the whole site: if this call fails or is slow, we still render the
  // full layout and route content (the nav just shows fewer links until it
  // resolves). Never blank the site or return a sitewide 404 on this fetch —
  // doing so previously showed crawlers an empty/404 page with the ad script
  // loaded ("ads on screens without publisher content").
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data?.data ?? []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop trigger={location} />
      <Layout categories={categories}>
        <ErrorBoundary>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home categories={categories} />} />
              <Route path="/post/:postId" element={<Post />} />
              <Route path="/category/:categoryId" element={<Category />} />
              <Route
                path="/search"
                element={<Search categories={categories} />}
              />
              <Route path="/author/:authorId" element={<Author />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/new" element={<NewThread />} />
              <Route path="/forum/c/:categoryKey" element={<ForumCategory />} />
              <Route path="/forum/t/:slug" element={<Thread />} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
