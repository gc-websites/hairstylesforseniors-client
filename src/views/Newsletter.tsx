import { useState } from 'react';
import { signUpForNewsletter } from '../services/postsAPI';

const Newsletter = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (query.length < 3) return;
    try {
      await signUpForNewsletter(query);
      setStatus('success');
      setQuery('');
    } catch (error) {
      console.error('Newsletter sign-up failed:', error);
      setStatus('error');
    }
  };

  return (
    <section className="section__padding">
      <div className="container">
        <div className="rounded-3xl px-6 py-14 md:py-16 bg-main2 text-center shadow-lg">
          <h2 className="section__title text-white text-3xl md:text-4xl mb-3">
            Sign Up for Our Newsletters
          </h2>
          <p className="section__description text-white/90 text-base mb-8 md:mb-10">
            Get our latest hair-care articles and tips delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative flex items-center max-w-md mx-auto rounded-full overflow-hidden shadow-md bg-white dark:bg-additionalText"
          >
            <input
              type="email"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setStatus(null);
              }}
              placeholder="Enter your email"
              aria-label="Email address"
              className="section__description text-base flex-grow pl-6 pr-2 py-4 text-gray-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={query.length < 3}
              aria-label="Subscribe to the newsletter"
              className={`flex items-center justify-center shrink-0 w-12 h-12 mr-1.5 rounded-full bg-main2 text-white transition-all duration-300 hover:bg-main3 ${
                query.length < 3 ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {status === 'success' && (
            <p
              role="status"
              className="section__description text-base text-white mt-5"
            >
              Thank you for subscribing!
            </p>
          )}
          {status === 'error' && (
            <p
              role="alert"
              className="section__description text-base text-red-200 mt-5"
            >
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
