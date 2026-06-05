// Cross-domain funnel tracking for the hairstyles captcha prelander.
//
// The TikTok funnel is: ad → hairstylesforseniors.com/captcha/... → nice-advice /v/ → /o/.
// This posts each captcha step to the SAME backend as nice-advice
// (api.nice-advice.info/track-click) using a session_id + start timestamp that
// are forwarded to nice-advice (na_sid / na_t0), so the whole journey across both
// domains is one continuous path in Strapi.

const TRACKING_API = 'https://api.nice-advice.info/track-click';

function ss(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/** Session id — created here (the funnel entry) and forwarded to nice-advice. */
export function getSessionId(): string {
  const store = ss();
  try {
    let sid = store?.getItem('na_session_id') || '';
    if (!sid) {
      sid =
        (typeof crypto !== 'undefined' &&
          crypto.randomUUID &&
          crypto.randomUUID()) ||
        Math.random().toString(36).slice(2);
      store?.setItem('na_session_id', sid);
    }
    return sid;
  } catch {
    return 'hs-fallback';
  }
}

/** Session start (ms) — forwarded as na_t0 so ms_since_start stays continuous. */
export function getSessionStart(): number {
  const store = ss();
  try {
    let t = parseInt(store?.getItem('na_session_start') || '0', 10);
    if (!t) {
      t = Date.now();
      store?.setItem('na_session_start', String(t));
    }
    return t;
  } catch {
    return Date.now();
  }
}

function nextSequence(): number {
  const store = ss();
  try {
    const n = parseInt(store?.getItem('na_seq') || '0', 10) + 1;
    store?.setItem('na_seq', String(n));
    return n;
  } catch {
    return 0;
  }
}

function getTrackingParams(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof window === 'undefined') return out;
  const p = new URLSearchParams(window.location.search);
  [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'platform',
    'gclid',
    'fbclid',
    'ttclid',
  ].forEach(k => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  return out;
}

/** Record one funnel step on the hairstyles side (e.g. captcha_shown / captcha_passed). */
export function trackStep(
  eventType: string,
  meta?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  const data: Record<string, unknown> = {
    session_id: getSessionId(),
    event_type: eventType,
    prelend_slug: 'digital-marketing',
    locale: 'en',
    source_url: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || undefined,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    sequence: nextSequence(),
    ms_since_start: Date.now() - getSessionStart(),
    clicked_at: new Date().toISOString(),
    ...getTrackingParams(),
  };
  if (meta) data.meta = meta;

  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_API, blob);
    } else {
      fetch(TRACKING_API, {
        method: 'POST',
        body: blob,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* never break UX */
  }
}
