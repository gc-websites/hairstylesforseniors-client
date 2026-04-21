import { useEffect, useMemo, useRef, useState } from 'react';
import { postComment } from '../services/postsAPI';
import './Comments.css';

const MAX_NAME = 40;
const MAX_TEXT = 500;
const PAGE_SIZE = 5;
const STORAGE_KEY = 'hfs_commenter_name';

type CommentItem = {
  username: string;
  text: string;
  createdAt?: string;
  __key?: string;
  __fresh?: boolean;
};

const RELATIVE_FORMATTER =
  typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

const ABS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
});

const SHORT_DATE_WITH_YEAR = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const parseTimestamp = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const t = new Date(trimmed).getTime();
  if (!Number.isFinite(t) || t <= 0) return null;
  // Reject absurd dates (before year 2000 or more than a year in the future)
  const year2000 = 946684800000;
  const yearAhead = Date.now() + 365 * 24 * 60 * 60 * 1000;
  if (t < year2000 || t > yearAhead) return null;
  return t;
};

const formatRelative = (iso: string, now: number) => {
  const t = parseTimestamp(iso);
  if (t === null) return '';
  const diffSec = Math.round((t - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'just now';
  if (abs < 60 * 60) {
    const m = Math.round(diffSec / 60);
    return RELATIVE_FORMATTER
      ? RELATIVE_FORMATTER.format(m, 'minute')
      : `${Math.abs(m)}m ago`;
  }
  if (abs < 60 * 60 * 24) {
    const h = Math.round(diffSec / 3600);
    return RELATIVE_FORMATTER
      ? RELATIVE_FORMATTER.format(h, 'hour')
      : `${Math.abs(h)}h ago`;
  }
  if (abs < 60 * 60 * 24 * 7) {
    const d = Math.round(diffSec / 86400);
    return RELATIVE_FORMATTER
      ? RELATIVE_FORMATTER.format(d, 'day')
      : `${Math.abs(d)}d ago`;
  }
  const d = new Date(t);
  return d.getFullYear() === new Date(now).getFullYear()
    ? SHORT_DATE_FORMATTER.format(d)
    : SHORT_DATE_WITH_YEAR.format(d);
};

const formatAbsolute = (iso: string) => {
  const t = parseTimestamp(iso);
  if (t === null) return '';
  return ABS_FORMATTER.format(new Date(t));
};

const sortByCreatedDesc = (list: CommentItem[]) =>
  [...list].sort((a, b) => {
    const at = parseTimestamp(a.createdAt) ?? 0;
    const bt = parseTimestamp(b.createdAt) ?? 0;
    return bt - at;
  });

const AVATAR_GRADIENTS: Array<[string, string]> = [
  ['#4BC8BE', '#039185'],
  ['#7c3aed', '#4f46e5'],
  ['#f59e0b', '#ef4444'],
  ['#3b82f6', '#0ea5e9'],
  ['#10b981', '#059669'],
  ['#ec4899', '#db2777'],
  ['#6366f1', '#8b5cf6'],
  ['#14b8a6', '#0891b2'],
];

const hashString = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({ name }: { name: string }) => {
  const [c1, c2] = AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length];
  return (
    <div
      className="hfs-comments__avatar"
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
};

type CommentsProps = {
  postId: string;
  initialComments?: CommentItem[];
};

const Comments = ({ postId, initialComments = [] }: CommentsProps) => {
  const [comments, setComments] = useState<CommentItem[]>(() =>
    sortByCreatedDesc(initialComments),
  );
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUsername(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setComments(sortByCreatedDesc(initialComments));
  }, [initialComments]);

  const count = comments.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => comments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [comments, page],
  );

  const rangeFrom = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(page * PAGE_SIZE, count);

  const pageNumbers = useMemo<(number | '…')[]>(() => {
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

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    if (listRef.current) {
      const top =
        listRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const trimmedName = username.trim();
  const trimmedText = text.trim();
  const canSubmit =
    !submitting &&
    trimmedName.length >= 2 &&
    trimmedName.length <= MAX_NAME &&
    trimmedText.length >= 2 &&
    trimmedText.length <= MAX_TEXT;

  const charsLeft = MAX_TEXT - text.length;
  const charsClass = useMemo(() => {
    if (charsLeft < 0)
      return 'hfs-comments__counter hfs-comments__counter--bad';
    if (charsLeft < 40)
      return 'hfs-comments__counter hfs-comments__counter--warn';
    return 'hfs-comments__counter';
  }, [charsLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await postComment({
        postId,
        username: trimmedName,
        text: trimmedText,
      });
      try {
        localStorage.setItem(STORAGE_KEY, trimmedName);
      } catch {
        /* ignore */
      }
      const key = `${Date.now()}-${Math.random()}`;
      const createdAt = new Date().toISOString();
      setComments(prev => [
        {
          username: trimmedName,
          text: trimmedText,
          createdAt,
          __key: key,
          __fresh: true,
        },
        ...prev,
      ]);
      setFreshKey(key);
      setPage(1);
      setText('');
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
      setTimeout(() => setFreshKey(null), 2400);
    } catch (err) {
      const e = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'Could not send your comment. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="hfs-comments container py-8"
      aria-labelledby="hfs-comments-title"
    >
      <div className="hfs-comments__card">
        <header className="hfs-comments__header">
          <div className="hfs-comments__headerLeft">
            <span className="hfs-comments__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3
              id="hfs-comments-title"
              className="hfs-comments__title section__title"
            >
              Comments
            </h3>
            <span className="hfs-comments__count">{count}</span>
          </div>
          {flash && (
            <span className="hfs-comments__flash" role="status">
              ✓ Posted
            </span>
          )}
        </header>

        <form className="hfs-comments__form" onSubmit={handleSubmit} noValidate>
          <div className="hfs-comments__formRow">
            <Avatar name={trimmedName || '?'} />
            <div className="hfs-comments__fields">
              <input
                type="text"
                className="hfs-comments__input"
                placeholder="Your name"
                value={username}
                maxLength={MAX_NAME}
                onChange={e => setUsername(e.target.value)}
                disabled={submitting}
                aria-label="Your name"
              />
              <textarea
                className="hfs-comments__textarea"
                placeholder="Share your thoughts on this article…"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                maxLength={MAX_TEXT + 80}
                disabled={submitting}
                aria-label="Your comment"
              />
              <div className="hfs-comments__formFooter">
                <span className={charsClass}>
                  {Math.max(charsLeft, 0)} characters left
                </span>
                <button
                  type="submit"
                  className="hfs-comments__submit"
                  disabled={!canSubmit}
                >
                  {submitting ? (
                    <>
                      <span
                        className="hfs-comments__spinner"
                        aria-hidden="true"
                      />
                      Posting…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M22 2 11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2 15 22l-4-9-9-4 20-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Post comment
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="hfs-comments__error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </form>

        <div className="hfs-comments__divider" />

        {count === 0 ? (
          <div className="hfs-comments__empty">
            <div className="hfs-comments__emptyIcon" aria-hidden="true">
              💬
            </div>
            <p className="hfs-comments__emptyTitle">No comments yet</p>
            <p className="hfs-comments__emptyText">
              Be the first to share your thoughts on this article.
            </p>
          </div>
        ) : (
          <div ref={listRef}>
            <div className="hfs-comments__rangeLabel">
              Showing <strong>{rangeFrom}</strong>–<strong>{rangeTo}</strong> of{' '}
              <strong>{count}</strong> · newest first
            </div>
            <ul className="hfs-comments__list">
              {pageItems.map((c, idx) => {
                const key = c.__key || `${c.username}-${idx}-p${page}`;
                const isFresh = c.__key && c.__key === freshKey;
                const validTs = parseTimestamp(c.createdAt);
                const relative = validTs
                  ? formatRelative(c.createdAt!, now)
                  : '';
                const absolute = validTs ? formatAbsolute(c.createdAt!) : '';
                return (
                  <li
                    key={key}
                    className={`hfs-comments__item${isFresh ? ' hfs-comments__item--fresh' : ''}`}
                  >
                    <Avatar name={c.username} />
                    <div className="hfs-comments__body">
                      <div className="hfs-comments__meta">
                        <span className="hfs-comments__author">
                          {c.username}
                        </span>
                        {relative && (
                          <>
                            <span
                              className="hfs-comments__metaDot"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                            <time
                              className="hfs-comments__time"
                              dateTime={c.createdAt}
                              title={absolute}
                            >
                              {relative}
                            </time>
                          </>
                        )}
                      </div>
                      <p className="hfs-comments__text">{c.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <nav
                className="hfs-comments__pager"
                aria-label="Comments pagination"
              >
                <button
                  type="button"
                  className="hfs-comments__pagerBtn hfs-comments__pagerBtn--arrow"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hfs-comments__pagerLabel">Prev</span>
                </button>

                {pageNumbers.map((p, i) =>
                  p === '…' ? (
                    <span
                      key={`gap-${i}`}
                      className="hfs-comments__pagerGap"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p as number)}
                      className={`hfs-comments__pagerBtn${
                        p === page ? ' hfs-comments__pagerBtn--active' : ''
                      }`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="hfs-comments__pagerBtn hfs-comments__pagerBtn--arrow"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <span className="hfs-comments__pagerLabel">Next</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Comments;
