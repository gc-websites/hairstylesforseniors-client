import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FORUM_CATEGORIES,
  postThread,
  findCategoryBySlug,
} from '../services/forumAPI';
import Identicon from '../components/forum/Identicon';
import { useSEO } from '../utils/useSEO';
import '../styles/forum.css';

const STORAGE_KEY = 'hfs_forum_name';
const MAX_NAME = 50;
const MIN_NAME = 2;
const MAX_TITLE = 200;
const MIN_TITLE = 5;
const MAX_BODY = 5000;
const MIN_BODY = 10;

const NewThread = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefilledCat = params.get('category');

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(() => {
    if (prefilledCat) {
      const found = findCategoryBySlug(prefilledCat);
      if (found) return found.key;
    }
    return FORUM_CATEGORIES[0].key;
  });
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const t0Ref = useRef<number>(Date.now());

  useSEO({
    title: 'Start a new discussion — Forum',
    description:
      'Start a new thread on the HairStylesForSeniors community forum. No registration needed.',
    canonical: '/forum/new',
    noindex: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
    t0Ref.current = Date.now();
  }, []);

  const trimmedName = name.trim();
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  const canSubmit =
    !submitting &&
    trimmedName.length >= MIN_NAME &&
    trimmedName.length <= MAX_NAME &&
    trimmedTitle.length >= MIN_TITLE &&
    trimmedTitle.length <= MAX_TITLE &&
    trimmedBody.length >= MIN_BODY &&
    trimmedBody.length <= MAX_BODY;

  const titleCharsLeft = MAX_TITLE - title.length;
  const bodyCharsLeft = MAX_BODY - body.length;

  const titleCounterCls = useMemo(() => {
    if (titleCharsLeft < 0) return 'hfs-forum__counter hfs-forum__counter--bad';
    if (titleCharsLeft < 20)
      return 'hfs-forum__counter hfs-forum__counter--warn';
    return 'hfs-forum__counter';
  }, [titleCharsLeft]);

  const bodyCounterCls = useMemo(() => {
    if (bodyCharsLeft < 0) return 'hfs-forum__counter hfs-forum__counter--bad';
    if (bodyCharsLeft < 100)
      return 'hfs-forum__counter hfs-forum__counter--warn';
    return 'hfs-forum__counter';
  }, [bodyCharsLeft]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await postThread({
        category,
        title: trimmedTitle,
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
      const dest = res.slug
        ? `/forum/t/${encodeURIComponent(res.slug)}`
        : `/forum/t/${encodeURIComponent(res.documentId)}`;
      navigate(dest);
    } catch (err) {
      const e = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'Could not create your thread. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        <span>New discussion</span>
      </nav>

      <header className="hfs-forum__hero" style={{ marginBottom: 20 }}>
        <p className="hfs-forum__heroEyebrow">New thread</p>
        <h1 className="hfs-forum__heroTitle">Start a discussion</h1>
        <p className="hfs-forum__heroLead">
          Share something on your mind — a question, a tip, a story. Keep it
          kind and on-topic. No account needed; we'll remember your name on this
          device.
        </p>
      </header>

      <form
        className="hfs-forum__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Start a new discussion"
      >
        <div className="hfs-forum__formFields">
          <div>
            <label className="hfs-forum__label" htmlFor="thread-category">
              Category
            </label>
            <select
              id="thread-category"
              className="hfs-forum__select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={submitting}
            >
              {FORUM_CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.key}
                </option>
              ))}
            </select>
          </div>

          <div className="hfs-forum__formRow">
            <Identicon name={trimmedName || '?'} />
            <div className="hfs-forum__formInputs">
              <div>
                <label className="hfs-forum__label" htmlFor="thread-name">
                  Your name
                </label>
                <input
                  id="thread-name"
                  className="hfs-forum__input"
                  type="text"
                  placeholder="What should we call you?"
                  value={name}
                  maxLength={MAX_NAME}
                  onChange={e => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="hfs-forum__label" htmlFor="thread-title">
                  Title
                </label>
                <input
                  id="thread-title"
                  className="hfs-forum__input"
                  type="text"
                  placeholder="Make it sound like a real question or story…"
                  value={title}
                  maxLength={MAX_TITLE + 20}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                />
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span className={titleCounterCls}>
                    {Math.max(titleCharsLeft, 0)} characters left
                  </span>
                </div>
              </div>

              <div>
                <label className="hfs-forum__label" htmlFor="thread-body">
                  Your message
                </label>
                <textarea
                  id="thread-body"
                  className="hfs-forum__textarea"
                  placeholder="Share details, ask questions, tell us what you've tried…"
                  value={body}
                  rows={8}
                  maxLength={MAX_BODY + 100}
                  onChange={e => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                />
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span className={bodyCounterCls}>
                    {Math.max(bodyCharsLeft, 0)} characters left
                  </span>
                </div>
              </div>

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
                <span
                  style={{ fontSize: '0.82rem', color: 'var(--hfs-muted)' }}
                >
                  By posting, you agree to our community guidelines: be kind,
                  stay on topic, no spam.
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to="/forum" className="hfs-forum__cancel">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="hfs-forum__submit"
                    disabled={!canSubmit}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="hfs-forum__spinner"
                          aria-hidden="true"
                        />
                        Posting…
                      </>
                    ) : (
                      <>✨ Start discussion</>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="hfs-forum__error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewThread;
