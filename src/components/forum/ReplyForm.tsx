import { FC, useEffect, useMemo, useRef, useState } from 'react';
import Identicon from './Identicon';
import { postReply, ThreadComment } from '../../services/forumAPI';

const STORAGE_KEY = 'hfs_forum_name';
const MAX_NAME = 50;
const MAX_BODY = 5000;
const MIN_BODY = 10;

interface ReplyFormProps {
  threadDocumentId: string;
  parentComment?: ThreadComment | null;
  onCancelReplyTo?: () => void;
  onSubmitted?: (newComment: ThreadComment) => void;
  compact?: boolean;
}

const ReplyForm: FC<ReplyFormProps> = ({
  threadDocumentId,
  parentComment,
  onCancelReplyTo,
  onSubmitted,
  compact,
}) => {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t0Ref = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
    t0Ref.current = Date.now();
  }, []);

  useEffect(() => {
    if (parentComment && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const ta = formRef.current.querySelector('textarea');
      if (ta) (ta as HTMLTextAreaElement).focus();
    }
  }, [parentComment]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  const trimmedName = name.trim();
  const trimmedBody = body.trim();

  const canSubmit =
    !submitting &&
    trimmedName.length >= 2 &&
    trimmedName.length <= MAX_NAME &&
    trimmedBody.length >= MIN_BODY &&
    trimmedBody.length <= MAX_BODY;

  const charsLeft = MAX_BODY - body.length;
  const counterCls = useMemo(() => {
    if (charsLeft < 0) return 'hfs-forum__counter hfs-forum__counter--bad';
    if (charsLeft < 80) return 'hfs-forum__counter hfs-forum__counter--warn';
    return 'hfs-forum__counter';
  }, [charsLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await postReply({
        threadDocumentId,
        parentCommentDocumentId: parentComment?.documentId,
        body: trimmedBody,
        authorName: trimmedName,
        website,
        t0: t0Ref.current,
      });
      try {
        localStorage.setItem(STORAGE_KEY, trimmedName);
      } catch {
        /* ignore */
      }
      const optimistic: ThreadComment = {
        id: -1,
        documentId: res.documentId,
        body: trimmedBody,
        authorName: trimmedName,
        authorAvatarIdenticon: trimmedName,
        parentComment: parentComment
          ? { documentId: parentComment.documentId, id: parentComment.id }
          : null,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      onSubmitted?.(optimistic);
      setBody('');
      setSuccess('Your reply was posted.');
      t0Ref.current = Date.now();
      if (parentComment && onCancelReplyTo) onCancelReplyTo();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const e = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'Could not post your reply. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="hfs-forum__form"
      onSubmit={handleSubmit}
      noValidate
      aria-label={parentComment ? 'Reply to comment' : 'Post a reply'}
      style={compact ? { padding: 16 } : undefined}
    >
      {!compact && (
        <h3 className="hfs-forum__formTitle">
          {parentComment
            ? `Reply to ${parentComment.authorName}`
            : 'Add a reply'}
        </h3>
      )}

      {parentComment && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            background: 'var(--hfs-input-bg)',
            border: '1px solid var(--hfs-card-border)',
            borderRadius: 10,
            fontSize: '0.85rem',
            color: 'var(--hfs-muted)',
          }}
        >
          Replying to <strong>{parentComment.authorName}</strong>
          {onCancelReplyTo && (
            <button
              type="button"
              onClick={onCancelReplyTo}
              style={{
                marginLeft: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--hfs-accent-strong)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              cancel
            </button>
          )}
        </div>
      )}

      <div className="hfs-forum__formRow">
        <Identicon name={trimmedName || '?'} />
        <div className="hfs-forum__formInputs">
          <input
            className="hfs-forum__input"
            type="text"
            placeholder="Your name"
            value={name}
            maxLength={MAX_NAME}
            onChange={e => setName(e.target.value)}
            disabled={submitting}
            aria-label="Your name"
          />
          <textarea
            className="hfs-forum__textarea"
            placeholder={
              parentComment
                ? `Write a thoughtful reply…`
                : 'Share your thoughts, advice, or your own experience…'
            }
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            maxLength={MAX_BODY + 50}
            disabled={submitting}
            aria-label="Your reply"
          />
          <input
            className="hfs-forum__honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            name="website"
            aria-hidden="true"
          />
          <div className="hfs-forum__formFooter">
            <span className={counterCls}>
              {Math.max(charsLeft, 0)} characters left{' '}
              <span className="hfs-forum__kbdHint" aria-hidden="true">
                · <kbd>⌘</kbd>+<kbd>Enter</kbd> to post
              </span>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {parentComment && onCancelReplyTo && (
                <button
                  type="button"
                  className="hfs-forum__cancel"
                  onClick={onCancelReplyTo}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="hfs-forum__submit"
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <span className="hfs-forum__spinner" aria-hidden="true" />
                    Posting…
                  </>
                ) : (
                  <>📨 Post reply</>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="hfs-forum__error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="hfs-forum__success" role="status">
              ✓ {success}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default ReplyForm;
