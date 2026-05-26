import { FC, useEffect, useState } from 'react';
import { postLike } from '../../services/forumAPI';

const STORAGE_KEY = 'hfs_forum_liked';

const loadLiked = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const saveLiked = (set: Set<string>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
};

interface LikeButtonProps {
  commentDocumentId: string;
  initialLikes?: number;
}

const LikeButton: FC<LikeButtonProps> = ({
  commentDocumentId,
  initialLikes = 0,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(loadLiked().has(commentDocumentId));
  }, [commentDocumentId]);

  const handleClick = async () => {
    if (busy || liked) return;
    setBusy(true);
    setLiked(true);
    setLikes(prev => prev + 1);
    const set = loadLiked();
    set.add(commentDocumentId);
    saveLiked(set);
    try {
      const res = await postLike(commentDocumentId);
      if (typeof res?.likes === 'number') {
        setLikes(res.likes);
      }
    } catch {
      // Best-effort: roll back the optimistic update on failure
      setLiked(false);
      setLikes(prev => Math.max(0, prev - 1));
      const next = loadLiked();
      next.delete(commentDocumentId);
      saveLiked(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`hfs-forum__replyAction${liked ? ' hfs-forum__replyAction--liked' : ''}`}
      onClick={handleClick}
      disabled={busy || liked}
      aria-pressed={liked}
      aria-label={liked ? `Liked (${likes})` : `Like this reply (${likes})`}
    >
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;
