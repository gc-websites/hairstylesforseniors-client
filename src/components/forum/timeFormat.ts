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

export const parseTimestamp = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const t = new Date(trimmed).getTime();
  if (!Number.isFinite(t) || t <= 0) return null;
  const year2000 = 946684800000;
  const yearAhead = Date.now() + 365 * 24 * 60 * 60 * 1000;
  if (t < year2000 || t > yearAhead) return null;
  return t;
};

export const formatRelative = (
  iso: string | undefined,
  now: number,
): string => {
  if (!iso) return '';
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

export const formatAbsolute = (iso: string | undefined): string => {
  if (!iso) return '';
  const t = parseTimestamp(iso);
  if (t === null) return '';
  return ABS_FORMATTER.format(new Date(t));
};
