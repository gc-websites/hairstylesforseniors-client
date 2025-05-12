import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '../utils/Icons';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.length >= 3) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && query.length >= 3) {
      handleSearch();
    }
  };

  return (
    <section className="bg-main2" id="search">
      <div className="container section__padding flex flex-col gap-10">
        <h2 className="section__title text-white">Search on Nice Advice</h2>
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 fill-white w-5 h-5 pointer-events-none"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {search}
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your search topics"
            className="pl-16 w-full bg-transparent border-0 border-b-2 border-white focus:border-[#C0FAF5] text-white placeholder-[#C0FAF5] focus:outline-none py-6"
          />
          <button
            onClick={handleSearch}
            disabled={query.length < 3}
            className={`section__description text-sm absolute right-3 top-4 px-5 py-2 rounded-md text-white transition-all duration-300 whitespace-nowrap border border-white
          ${
            query.length >= 3
              ? 'bg-main2 hover:bg-main2'
              : 'bg-gray-400 cursor-not-allowed'
          }
        `}
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
