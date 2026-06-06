import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FORUM_CATEGORIES,
  getThreads,
  getTrendingThreads,
  ThreadSummary,
} from '../services/forumAPI';
import CategoryCard from '../components/forum/CategoryCard';
import ThreadCard from '../components/forum/ThreadCard';
import { SITE, useSEO } from '../utils/useSEO';
import '../styles/forum.css';

const Forum = () => {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [trending, setTrending] = useState<ThreadSummary[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Community Forum — discussions about hair care for seniors',
    description:
      'Join a friendly community discussing hairstyles, hair care, color, products and confidence for people 50+. No registration needed.',
    canonical: '/forum',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'HairStylesForSeniors Community Forum',
      url: `${SITE.ORIGIN}/forum`,
      description:
        'Community discussions about hairstyles, hair care, color, products and confidence for adults 50+.',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE.NAME,
        url: `${SITE.ORIGIN}/`,
      },
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [latest, trend] = await Promise.all([
          getThreads({ page: 1, pageSize: 10, sort: 'latest' }),
          getTrendingThreads({ pageSize: 4 }),
        ]);
        setThreads(latest.data || []);
        setTrending(trend);

        const counts: Record<string, number> = {};
        await Promise.all(
          FORUM_CATEGORIES.map(async cat => {
            try {
              const r = await getThreads({
                category: cat.key,
                page: 1,
                pageSize: 1,
              });
              counts[cat.key] = r.meta?.pagination?.total ?? 0;
            } catch {
              counts[cat.key] = 0;
            }
          }),
        );
        setCategoryCounts(counts);
      } catch (err) {
        console.error('Forum load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="hfs-forum container">
      <header className="hfs-forum__hero">
        <p className="hfs-forum__heroEyebrow">Community</p>
        <h1 className="hfs-forum__heroTitle">
          A friendly forum about hair, beauty &amp; aging gracefully
        </h1>
        <p className="hfs-forum__heroLead">
          Ask questions, share what works for you, and meet others navigating
          the same changes. No account needed — just pick a name and start a
          conversation.
        </p>
        <div className="hfs-forum__heroActions">
          <Link to="/forum/new" className="hfs-forum__cta">
            ✍️ Start a discussion
          </Link>
          <a href="#latest" className="hfs-forum__ctaGhost">
            See the latest →
          </a>
        </div>
      </header>

      {trending.length > 0 && (
        <>
          <h2 className="hfs-forum__sectionTitle">
            🔥 Trending now
            <span className="hfs-forum__sectionEyebrow">
              most active in the past 2 weeks
            </span>
          </h2>
          <ul className="hfs-forum__threadList" style={{ marginBottom: 36 }}>
            {trending.map(t => (
              <ThreadCard key={t.documentId} thread={t} />
            ))}
          </ul>
        </>
      )}

      <h2 className="hfs-forum__sectionTitle">Browse categories</h2>
      <div className="hfs-forum__catGrid">
        {FORUM_CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.key}
            category={cat}
            threadCount={categoryCounts[cat.key]}
          />
        ))}
      </div>

      <h2 className="hfs-forum__sectionTitle" id="latest">
        Latest discussions
      </h2>

      {loading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="hfs-forum__skeleton" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="hfs-forum__empty">
          <div className="hfs-forum__emptyIcon" aria-hidden="true">
            🌱
          </div>
          <p className="hfs-forum__emptyTitle">No discussions yet</p>
          <p className="hfs-forum__emptyText">
            Be the very first to start a thread — pick a category and share
            what's on your mind.
          </p>
          <Link to="/forum/new" className="hfs-forum__cta">
            Start the first thread
          </Link>
        </div>
      ) : (
        <ul className="hfs-forum__threadList">
          {threads.map(t => (
            <ThreadCard key={t.documentId} thread={t} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Forum;
