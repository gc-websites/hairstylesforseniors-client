import { Fragment, ReactNode } from 'react';

const URL_RE =
  /\b((?:https?:\/\/|www\.)[^\s<>()[\]{}'"`]+[^\s<>()[\]{}'"`.,;:!?])/gi;

const normalizeHref = (raw: string): string => {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

const displayUrl = (raw: string): string => {
  const stripped = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  if (stripped.length <= 38) return stripped;
  return `${stripped.slice(0, 35)}…`;
};

export const linkify = (text: string): ReactNode => {
  if (!text) return text;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const matches = Array.from(text.matchAll(URL_RE));

  matches.forEach((match, i) => {
    const url = match[1];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(
        <Fragment key={`t-${i}`}>{text.slice(lastIndex, start)}</Fragment>,
      );
    }
    parts.push(
      <a
        key={`l-${i}`}
        href={normalizeHref(url)}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className="hfs-forum__link"
      >
        {displayUrl(url)}
      </a>,
    );
    lastIndex = start + url.length;
  });

  if (lastIndex < text.length) {
    parts.push(<Fragment key="t-tail">{text.slice(lastIndex)}</Fragment>);
  }
  return parts.length ? parts : text;
};
