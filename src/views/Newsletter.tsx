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
      <div className="rounded-lg container py-20 bg-main2 text-center">
        <h2 className="section__title text-white text-4xl leading-[56px] mb-6">
          Sign Up for Our Newsletters
        </h2>
        <p className="section__description text-white text-base mb-12">
          Get the latest articles to your inbox
        </p>

        <form
          onSubmit={handleSubmit}
          className="relative flex items-center justify-center max-w-md mx-auto rounded-lg overflow-hidden shadow-md"
        >
          <input
            type="email"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setStatus(null);
            }}
            placeholder="Enter email here"
            className="section__description text-base flex-grow px-4 py-4 text-gray-800 focus:outline-none bg-white dark:bg-additionalText"
          />
          <button
            type="submit"
            disabled={query.length < 3}
            className={`absolute rounded-lg right-2 px-3 py-2 bg-main2 text-white hover:bg-main3 transition-all duration-300 ${
              query.length < 3 ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            ➔
          </button>
        </form>
        {status === 'success' && (
          <p className="section__description text-base text-white mt-4">
            Thank you for subscribing!
          </p>
        )}
        {status === 'error' && (
          <p className="section__description text-base text-red-300 dark:text-red-300 mt-4">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
