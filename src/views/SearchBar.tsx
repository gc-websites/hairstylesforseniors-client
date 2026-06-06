import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '../utils/Icons';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const canSearch = query.trim().length >= 3;

  const handleSearch = () => {
    if (canSearch) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && canSearch) {
      handleSearch();
    }
  };

  return (
    <section className="bg-main2" id="search">
      <div className="container section__padding flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-poppins text-white/80 font-semibold uppercase tracking-wider text-sm mb-2">
            Find what you need
          </p>
          <h2 className="section__title text-white text-3xl md:text-4xl">
            Search HairStylesForSeniors
          </h2>
        </div>

        <div className="relative flex items-center w-full max-w-2xl mx-auto rounded-full bg-white dark:bg-additionalText shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-main2">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 fill-gray-400 w-5 h-5 pointer-events-none"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {search}
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search the site"
            placeholder="Search articles, tips, hairstyles…"
            className="flex-grow bg-transparent pl-14 pr-2 py-4 text-base text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            aria-label="Search"
            className={`shrink-0 m-1.5 px-6 py-3 rounded-full font-poppins font-semibold text-white transition-colors duration-300 whitespace-nowrap ${
              canSearch
                ? 'bg-main2 hover:bg-main3 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
