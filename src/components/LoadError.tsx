import { FC } from 'react';

interface LoadErrorProps {
  /** Optional retry handler; when omitted a full reload is offered. */
  onRetry?: () => void;
  message?: string;
}

/**
 * Shown when a data fetch FAILS (network/API error) — as opposed to a resource
 * genuinely not existing. Critically it does NOT set `noindex`, so a transient
 * Strapi outage during a crawl can never de-index a real article/category URL
 * (the old behaviour returned the noindex Page404 on any fetch error). It also
 * always renders real, navigable content rather than a blank page.
 */
const LoadError: FC<LoadErrorProps> = ({ onRetry, message }) => {
  const handleRetry = () => {
    if (onRetry) onRetry();
    else if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <div className="container section__padding flex flex-col items-center gap-6 text-center">
      <h1 className="section__title text-3xl md:text-4xl">
        We couldn’t load this right now
      </h1>
      <p className="section__description max-w-xl">
        {message ||
          'This page is temporarily unavailable — it’s a connection hiccup on our side, not a missing page. Please try again in a moment, or explore more of our hair-care articles and tips for adults 50+.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleRetry}
          className="px-6 py-3 bg-main text-white rounded-md hover:bg-main3 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-6 py-3 border border-main text-main rounded-md hover:bg-main hover:text-white transition-colors"
        >
          Browse the homepage
        </a>
      </div>
    </div>
  );
};

export default LoadError;
