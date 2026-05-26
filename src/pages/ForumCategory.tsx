import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  findCategoryBySlug,
  getThreads,
  ThreadSort,
  ThreadSummary,
} from '../services/forumAPI';
import ThreadCard from '../components/forum/ThreadCard';
import Page404 from './Page404';
import { useSEO } from '../utils/useSEO';
import '../styles/forum.css';

const PAGE_SIZE = 20;

const SORT_LABELS: Record<ThreadSort, string> = {
  latest: 'Latest',
  active: 'Most active',
  top: 'Top',
};

const ForumCategory = () => {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const category = categoryKey ? findCategoryBySlug(categoryKey) : null;

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ThreadSort>('latest');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useSEO({
    title: category ? `${category.key} — Community Forum` : 'Forum category',
    description: category
      ? `Discussions in the ${category.key} category. ${category.blurb}`
      : 'Forum category not found',
    canonical: category ? `/forum/c/${category.slug}` : '/forum',
    noindex: !category,
  });

  useEffect(() => {
    if (!category) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getThreads({
          category: category.key,
          page,
          pageSize: PAGE_SIZE,
          sort,
          q: searchQuery,
        });
        setThreads(res.data || []);
        setTotal(res.meta?.pagination?.total ?? 0);
      } catch (err) {
        console.error('Category load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, page, sort, searchQuery]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const pageNumbers: (number | '…')[] = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const out: (number | '…')[] = [1];
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) out.push('…');
    for (let i = left; i <= right; i += 1) out.push(i);
    if (right < totalPages - 1) out.push('…');
    out.push(totalPages);
    return out;
  }, [page, totalPages]);

  if (!category) return <Page404 />;

  return (
    <div className="hfs-forum container">
      <nav aria-label="Breadcrumb" className="hfs-forum__crumbs">
        <Link to="/">Home</Link>
        <span className="hfs-forum__crumbSep" aria-hidden="true">
          /
        </span>
        <Link to="/forum">Forum</Link>
        <span className="hfs-forum__crumbSep" aria-hidden="true">
          /
        </span>
        <span>{category.key}</span>
      </nav>

      <header className="hfs-forum__hero">
        <p className="hfs-forum__heroEyebrow">{category.emoji} Category</p>
        <h1 className="hfs-forum__heroTitle">{category.key}</h1>
        <p className="hfs-forum__heroLead">{category.blurb}</p>
        <div className="hfs-forum__heroActions">
          <Link to="/forum/new" className="hfs-forum__cta">
            ✍️ Start a discussion
          </Link>
          <Link to="/forum" className="hfs-forum__ctaGhost">
            ← All categories
          </Link>
        </div>
      </header>

      <div className="hfs-forum__sortBar">
        <div
          className="hfs-forum__sortTabs"
          role="tablist"
          aria-label="Sort threads"
        >
          {(Object.keys(SORT_LABELS) as ThreadSort[]).map(s => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={sort === s}
              className={`hfs-forum__sortTab${
                sort === s ? ' hfs-forum__sortTab--active' : ''
              }`}
              onClick={() => {
                setSort(s);
                setPage(1);
              }}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="hfs-forum__searchWrap">
          <span className="hfs-forum__searchIcon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            className="hfs-forum__search"
            placeholder={`Search in ${category.key}…`}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search threads"
          />
          {searchInput && (
            <button
              type="button"
              className="hfs-forum__searchClear"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <span className="hfs-forum__sortLabel">
          <strong>{total}</strong> {total === 1 ? 'discussion' : 'discussions'}
          {searchQuery && (
            <>
              {' '}
              for <em>“{searchQuery}”</em>
            </>
          )}
        </span>
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="hfs-forum__skeleton" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="hfs-forum__empty">
          <div className="hfs-forum__emptyIcon" aria-hidden="true">
            🌱
          </div>
          <p className="hfs-forum__emptyTitle">No discussions yet here</p>
          <p className="hfs-forum__emptyText">
            Be the first to start a thread in <strong>{category.key}</strong>.
          </p>
          <Link to="/forum/new" className="hfs-forum__cta">
            Start the first thread
          </Link>
        </div>
      ) : (
        <>
          <ul className="hfs-forum__threadList">
            {threads.map(t => (
              <ThreadCard key={t.documentId} thread={t} />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="hfs-forum__pager" aria-label="Forum pagination">
              <button
                type="button"
                className="hfs-forum__pagerBtn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹ Prev
              </button>
              {pageNumbers.map((p, i) =>
                p === '…' ? (
                  <span
                    key={`gap-${i}`}
                    className="hfs-forum__pagerBtn"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`hfs-forum__pagerBtn${
                      p === page ? ' hfs-forum__pagerBtn--active' : ''
                    }`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                className="hfs-forum__pagerBtn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next ›
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ForumCategory;
