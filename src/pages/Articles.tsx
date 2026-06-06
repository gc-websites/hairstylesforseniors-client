import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPostsLite } from '../services/postsAPI';
import Loader from '../components/Loader';
import LoadError from '../components/LoadError';
import { SITE, useSEO } from '../utils/useSEO';

interface LitePost {
  documentId: string;
  title: string;
  createdAt?: string;
  category_3?: { documentId: string; name: string } | null;
}

/**
 * Full article archive. Lists EVERY published article as a real internal link,
 * grouped by category. This guarantees the AdSense reviewer and Googlebot can
 * reach 100% of the site's content via internal links (the category pages only
 * link the first page of each category), complementing sitemap.xml.
 */
const Articles = () => {
  const [posts, setPosts] = useState<LitePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useSEO({
    title: 'All Articles',
    description:
      'Complete index of every HairStylesForSeniors article — hair-care routines, senior-friendly hairstyles, gray-coverage and color, hair-loss support and product guides for adults 50+.',
    canonical: '/articles',
    type: 'website',
    keywords:
      'all articles, hair care articles, hairstyles for seniors, hair color, hair loss, article index',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'All Articles — HairStylesForSeniors',
      url: `${SITE.ORIGIN}/articles`,
      description:
        'A complete, browsable index of every article published on HairStylesForSeniors.',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE.NAME,
        url: `${SITE.ORIGIN}/`,
      },
    },
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const all = await getAllPostsLite();
        setPosts(all);
      } catch (error) {
        console.log(error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, LitePost[]> = {};
    for (const p of posts) {
      const cat = p.category_3?.name || 'More articles';
      (groups[cat] ||= []).push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [posts]);

  if (isLoading) return <Loader />;
  if (loadError) return <LoadError />;

  return (
    <div className="container section__padding flex flex-col gap-8">
      <nav aria-label="Breadcrumb" className="pt-2">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-additionalText">
          <li>
            <Link to="/" className="hover:text-main">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-mainText">
            All Articles
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="section__title text-3xl md:text-4xl">All Articles</h1>
        <p className="section__description max-w-3xl">
          Browse every guide we’ve published — {posts.length} articles on hair
          care, hairstyles, color and gray coverage, hair loss, and confidence
          for adults 50 and up. Pick a category below and jump straight to any
          piece.
        </p>
      </header>

      {grouped.length === 0 ? (
        <p className="section__description">No articles published yet.</p>
      ) : (
        grouped.map(([category, items]) => (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="section__title text-2xl text-main">{category}</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 list-disc pl-5">
              {items.map(post => (
                <li key={post.documentId} className="marker:text-main">
                  <Link
                    to={`/post/${post.documentId}`}
                    className="section__description hover:text-main hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export default Articles;
