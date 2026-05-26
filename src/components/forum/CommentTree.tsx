import { FC, useEffect, useMemo, useRef, useState } from 'react';
import Identicon from './Identicon';
import LikeButton from './LikeButton';
import { ThreadComment } from '../../services/forumAPI';
import { formatRelative, formatAbsolute } from './timeFormat';
import { linkify } from './linkify';

export type CommentSort = 'oldest' | 'newest' | 'likes';

interface CommentTreeProps {
  comments: ThreadComment[];
  freshIds?: Set<string>;
  onReplyTo?: (comment: ThreadComment) => void;
  isLocked?: boolean;
  opAuthorName?: string;
  sort?: CommentSort;
  onCopyLink?: (commentId: string) => void;
}

interface CommentNode extends ThreadComment {
  children: CommentNode[];
}

const buildTree = (
  comments: ThreadComment[],
  sort: CommentSort,
): CommentNode[] => {
  const map = new Map<string, CommentNode>();
  comments.forEach(c => {
    map.set(c.documentId, { ...c, children: [] });
  });
  const roots: CommentNode[] = [];
  comments.forEach(c => {
    const node = map.get(c.documentId)!;
    const parentId = c.parentComment?.documentId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortFn = (a: CommentNode, b: CommentNode) => {
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === 'likes') {
      const la = a.likes ?? 0;
      const lb = b.likes ?? 0;
      if (lb !== la) return lb - la;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  };

  const sortDeep = (nodes: CommentNode[]): CommentNode[] => {
    nodes.sort(sortFn);
    nodes.forEach(n => sortDeep(n.children));
    return nodes;
  };

  return sortDeep(roots);
};

interface CommentNodeViewProps {
  comment: CommentNode;
  depth: number;
  freshIds: Set<string>;
  parentLookup: Map<string, ThreadComment>;
  onReplyTo?: (comment: ThreadComment) => void;
  isLocked?: boolean;
  now: number;
  opAuthorName?: string;
  highlightId?: string | null;
  onCopyLink?: (commentId: string) => void;
}

const CommentNodeView: FC<CommentNodeViewProps> = ({
  comment,
  depth,
  freshIds,
  parentLookup,
  onReplyTo,
  isLocked,
  now,
  opAuthorName,
  highlightId,
  onCopyLink,
}) => {
  const isFresh = freshIds.has(comment.documentId);
  const isHighlighted = highlightId === comment.documentId;
  const relative = formatRelative(comment.createdAt, now);
  const absolute = formatAbsolute(comment.createdAt);
  const parent = comment.parentComment?.documentId
    ? parentLookup.get(comment.parentComment.documentId)
    : null;
  const isOP =
    opAuthorName &&
    comment.authorName.trim().toLowerCase() ===
      opAuthorName.trim().toLowerCase();

  return (
    <>
      <li
        id={`comment-${comment.documentId}`}
        className={`hfs-forum__reply${depth > 0 ? ' hfs-forum__reply--child' : ''}${
          isFresh ? ' hfs-forum__reply--fresh' : ''
        }${isHighlighted ? ' hfs-forum__reply--highlight' : ''}`}
      >
        <Identicon
          name={comment.authorName}
          seed={comment.authorAvatarIdenticon || comment.authorName}
          size={depth > 0 ? 36 : 44}
        />
        <div className="hfs-forum__replyBody">
          <div className="hfs-forum__replyMeta">
            <span className="hfs-forum__replyAuthor">{comment.authorName}</span>
            {isOP && (
              <span className="hfs-forum__opBadge" title="Original poster">
                OP
              </span>
            )}
            {relative && (
              <>
                <span aria-hidden="true" style={{ color: 'var(--hfs-muted)' }}>
                  ·
                </span>
                <time
                  className="hfs-forum__replyTime"
                  dateTime={comment.createdAt}
                  title={absolute}
                >
                  {relative}
                </time>
              </>
            )}
          </div>
          {parent && depth > 0 && (
            <p className="hfs-forum__replyParent">
              ↩ Replying to <strong>{parent.authorName}</strong>:{' '}
              {parent.body.length > 80
                ? `${parent.body.slice(0, 80)}…`
                : parent.body}
            </p>
          )}
          <p className="hfs-forum__replyText">{linkify(comment.body)}</p>
          <div className="hfs-forum__replyActions">
            <LikeButton
              commentDocumentId={comment.documentId}
              initialLikes={comment.likes ?? 0}
            />
            {!isLocked && onReplyTo && (
              <button
                type="button"
                className="hfs-forum__replyAction"
                onClick={() => onReplyTo(comment)}
                aria-label={`Reply to ${comment.authorName}`}
              >
                <span aria-hidden="true">↩</span>
                <span>Reply</span>
              </button>
            )}
            {onCopyLink && (
              <button
                type="button"
                className="hfs-forum__replyAction"
                onClick={() => onCopyLink(comment.documentId)}
                aria-label="Copy link to this comment"
                title="Copy link"
              >
                <span aria-hidden="true">🔗</span>
                <span>Link</span>
              </button>
            )}
          </div>
        </div>
      </li>
      {comment.children.map(child => (
        <CommentNodeView
          key={child.documentId}
          comment={child}
          depth={depth + 1}
          freshIds={freshIds}
          parentLookup={parentLookup}
          onReplyTo={onReplyTo}
          isLocked={isLocked}
          now={now}
          opAuthorName={opAuthorName}
          highlightId={highlightId}
          onCopyLink={onCopyLink}
        />
      ))}
    </>
  );
};

const CommentTree: FC<CommentTreeProps> = ({
  comments,
  freshIds = new Set(),
  onReplyTo,
  isLocked,
  opAuthorName,
  sort = 'oldest',
  onCopyLink,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Scroll to and highlight a #comment-X anchor on first load
  useEffect(() => {
    if (initialScrollDone.current || !comments.length) return;
    const hash = window.location.hash;
    if (!hash.startsWith('#comment-')) return;
    const id = hash.slice('#comment-'.length);
    if (!comments.find(c => c.documentId === id)) return;
    initialScrollDone.current = true;
    setHighlightId(id);
    setTimeout(() => {
      const el = document.getElementById(`comment-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    setTimeout(() => setHighlightId(null), 3500);
  }, [comments]);

  const tree = useMemo(() => buildTree(comments, sort), [comments, sort]);
  const parentLookup = useMemo(() => {
    const map = new Map<string, ThreadComment>();
    comments.forEach(c => map.set(c.documentId, c));
    return map;
  }, [comments]);

  if (!comments.length) {
    return (
      <div className="hfs-forum__empty">
        <div className="hfs-forum__emptyIcon" aria-hidden="true">
          💬
        </div>
        <p className="hfs-forum__emptyTitle">No replies yet</p>
        <p className="hfs-forum__emptyText">
          Be the first to share your thoughts on this discussion.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="hfs-forum__replies"
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {tree.map(node => (
        <CommentNodeView
          key={node.documentId}
          comment={node}
          depth={0}
          freshIds={freshIds}
          parentLookup={parentLookup}
          onReplyTo={onReplyTo}
          isLocked={isLocked}
          now={now}
          opAuthorName={opAuthorName}
          highlightId={highlightId}
          onCopyLink={onCopyLink}
        />
      ))}
    </ul>
  );
};

export default CommentTree;
