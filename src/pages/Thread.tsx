import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  findCategoryByKey,
  getComments,
  getThreadByDocumentId,
  getThreadBySlug,
  incrementThreadView,
  ThreadComment,
  ThreadSummary,
} from '../services/forumAPI';
import Identicon from '../components/forum/Identicon';
import CommentTree, { CommentSort } from '../components/forum/CommentTree';
import ReplyForm from '../components/forum/ReplyForm';
import Toast from '../components/forum/Toast';
import { linkify } from '../components/forum/linkify';
import { formatAbsolute, formatRelative } from '../components/forum/timeFormat';
import Loader from '../components/Loader';
import Page404 from './Page404';
import { SITE, stripHtml, useSEO } from '../utils/useSEO';
import '../styles/forum.css';

const SORT_LABELS: Record<CommentSort, string> = {
  oldest: 'Oldest first',
  newest: 'Newest first',
  likes: 'Most liked',
};

const estimateReadMinutes = (text: string | undefined): number => {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

const Thread = () => {
  const { slug } = useParams<{ slug: string }>();
  const [thread, setThread] = useState<ThreadSummary | null>(null);
  const [comments, setComments] = useState<ThreadComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replyTo, setReplyTo] = useState<ThreadComment | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [sort, setSort] = useState<CommentSort>('oldest');
  const [toast, setToast] = useState<string>('');
  const viewedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const seoTitle = thread?.title || 'Forum thread';
  const seoDescription = thread
    ? stripHtml(thread.body || '', 160) || `Discussion: ${thread.title}`
    : 'Forum thread';

  // Keep low-value / auto-seeded threads out of the index. Google flags
  // auto-generated and thin, unmoderated UGC as low-value content — exactly the
  // signal we must avoid for AdSense. A thread earns indexing once it has real
  // human substance (a meaningful body or actual replies).
  const commentTotal = thread?.commentCount ?? comments.length;
  const bodyLen = thread?.body
    ? stripHtml(thread.body, 100000).trim().length
    : 0;
  const isLowValueThread =
    !!thread &&
    ((thread.isAutoCreated === true && commentTotal < 2) ||
      (bodyLen < 120 && commentTotal < 1));

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: thread?.slug
      ? `/forum/t/${thread.slug}`
      : thread
        ? `/forum/t/${thread.documentId}`
        : '/forum',
    type: 'article',
    publishedTime: thread?.createdAt,
    modifiedTime: thread?.updatedAt || thread?.createdAt,
    author: thread?.authorName,
    noindex: notFound || isLowValueThread,
    jsonLd: thread
      ? {
          '@context': 'https://schema.org',
          '@type': 'DiscussionForumPosting',
          headline: thread.title,
          articleBody: thread.body,
          datePublished: thread.createdAt,
          dateModified: thread.updatedAt || thread.createdAt,
          author: { '@type': 'Person', name: thread.authorName },
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: thread.commentCount ?? comments.length,
          },
          url: `${SITE.ORIGIN}/forum/t/${thread.slug || thread.documentId}`,
        }
      : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        let t = await getThreadBySlug(slug);
        if (!t) {
          t = await getThreadByDocumentId(slug);
        }
        if (cancelled) return;
        if (!t) {
          setNotFound(true);
          return;
        }
        setThread(t);

        if (!viewedRef.current) {
          viewedRef.current = true;
          incrementThreadView(t.documentId, t.viewCount ?? 0);
        }

        const cRes = await getComments(t.documentId);
        if (cancelled) return;
        setComments(cRes.data || []);
      } catch (err) {
        console.error('Thread load error', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const cat = useMemo(
    () => (thread ? findCategoryByKey(thread.category) : null),
    [thread],
  );

  const handleReplyTo = useCallback((c: ThreadComment) => {
    setReplyTo(c);
  }, []);

  const handleSubmitted = useCallback(
    (newComment: ThreadComment) => {
      setComments(prev => [...prev, newComment]);
      setFreshIds(prev => {
        const next = new Set(prev);
        next.add(newComment.documentId);
        return next;
      });
      setReplyTo(null);
      if (thread) {
        setThread({
          ...thread,
          commentCount: (thread.commentCount ?? 0) + 1,
        });
      }
    },
    [thread],
  );

  const handleCopyLink = useCallback((commentId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#comment-${commentId}`;
    try {
      // history.replaceState avoids the jump that happens with location.hash =
      window.history.replaceState(null, '', `#comment-${commentId}`);
    } catch {
      /* ignore */
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => setToast('Link copied'))
        .catch(() => setToast('Could not copy — long-press the URL'));
    } else {
      setToast('Link copied');
    }
  }, []);

  const handleCopyThreadLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => setToast('Link copied'))
        .catch(() => setToast('Could not copy'));
    } else {
      setToast('Link copied');
    }
  }, []);

  const uniqueParticipants = useMemo(() => {
    if (!thread) return 0;
    const set = new Set<string>();
    set.add(thread.authorName?.trim().toLowerCase() || '');
    comments.forEach(c => set.add(c.authorName?.trim().toLowerCase() || ''));
    set.delete('');
    return set.size;
  }, [comments, thread]);

  const readTime = useMemo(
    () => estimateReadMinutes(thread?.body),
    [thread?.body],
  );

  if (loading && !thread) return <Loader />;
  if (notFound || !thread) return <Page404 />;

  const activity = thread.lastActivityAt || thread.createdAt;

  return (
    <div className="hfs-forum container">
      <nav aria-label="Breadcrumb" className="hfs-forum__crumbs">
        <Link to="/">Home</Link>
        <span className="hfs-forum__crumbSep" aria-hidden="true">
          /
        </span>
        <Link to="/forum">Forum</Link>
        {cat && (
          <>
            <span className="hfs-forum__crumbSep" aria-hidden="true">
              /
            </span>
            <Link to={`/forum/c/${cat.slug}`}>{cat.key}</Link>
          </>
        )}
        <span className="hfs-forum__crumbSep" aria-hidden="true">
          /
        </span>
        <span>{thread.title}</span>
      </nav>

      <article className="hfs-forum__op">
        <header className="hfs-forum__opHeader">
          <Identicon
            name={thread.authorName}
            seed={thread.authorAvatarIdenticon || thread.authorName}
            size={56}
          />
          <div className="hfs-forum__opMeta">
            <div className="hfs-forum__opAuthor">
              <strong>{thread.authorName}</strong>
              {cat && (
                <Link
                  to={`/forum/c/${cat.slug}`}
                  className="hfs-forum__threadCat"
                >
                  {cat.key}
                </Link>
              )}
              {thread.isPinned && (
                <span className="hfs-forum__badge hfs-forum__badge--pinned">
                  📌 Pinned
                </span>
              )}
              {thread.isLocked && (
                <span className="hfs-forum__badge hfs-forum__badge--locked">
                  🔒 Locked
                </span>
              )}
            </div>
            <div className="hfs-forum__opSub">
              <time
                dateTime={thread.createdAt}
                title={formatAbsolute(thread.createdAt)}
              >
                {formatRelative(thread.createdAt, now) ||
                  formatAbsolute(thread.createdAt)}
              </time>
              {' · '}
              <span>
                💬 {comments.length}{' '}
                {comments.length === 1 ? 'reply' : 'replies'}
              </span>
              {uniqueParticipants > 1 && (
                <>
                  {' · '}
                  <span>👥 {uniqueParticipants} in this conversation</span>
                </>
              )}
              {typeof thread.viewCount === 'number' && thread.viewCount > 0 && (
                <>
                  {' · '}
                  <span>👁 {thread.viewCount} views</span>
                </>
              )}
              {readTime > 1 && (
                <>
                  {' · '}
                  <span>📖 {readTime} min read</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyThreadLink}
            className="hfs-forum__shareBtn"
            aria-label="Copy link to this discussion"
            title="Copy link"
          >
            🔗 Share
          </button>
        </header>

        <h1 className="hfs-forum__opTitle">{thread.title}</h1>
        {thread.body && (
          <div className="hfs-forum__opBody">{linkify(thread.body)}</div>
        )}
        {activity && activity !== thread.createdAt && (
          <p className="hfs-forum__opSub" style={{ marginTop: 14 }}>
            Last activity {formatRelative(activity, now)}
          </p>
        )}
      </article>

      <div className="hfs-forum__sortBar" style={{ marginBottom: 12 }}>
        <h2
          className="hfs-forum__sectionTitle"
          style={{ margin: 0, fontSize: '1.1rem' }}
        >
          Replies ({comments.length})
        </h2>
        {comments.length > 1 && (
          <div
            className="hfs-forum__sortTabs"
            role="tablist"
            aria-label="Sort replies"
          >
            {(Object.keys(SORT_LABELS) as CommentSort[]).map(s => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={sort === s}
                className={`hfs-forum__sortTab${
                  sort === s ? ' hfs-forum__sortTab--active' : ''
                }`}
                onClick={() => setSort(s)}
              >
                {SORT_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      <CommentTree
        comments={comments}
        freshIds={freshIds}
        onReplyTo={handleReplyTo}
        isLocked={thread.isLocked}
        opAuthorName={thread.authorName}
        sort={sort}
        onCopyLink={handleCopyLink}
      />

      {thread.isLocked ? (
        <div className="hfs-forum__locked">
          🔒 This discussion has been locked. New replies are disabled.
        </div>
      ) : (
        <ReplyForm
          threadDocumentId={thread.documentId}
          parentComment={replyTo}
          onCancelReplyTo={() => setReplyTo(null)}
          onSubmitted={handleSubmitted}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
};

export default Thread;
