import { useState } from 'react';

const Generation = () => {
  // const [query, setQuery] = useState('');
  // const [query1, setQuery1] = useState('');
  // const [query2, setQuery2] = useState('');
  // const [query3, setQuery3] = useState('');
  // const [query4, setQuery4] = useState('');
  // const [query5, setQuery5] = useState('');
  // const [query6, setQuery6] = useState('');
  // const [query7, setQuery7] = useState('');
  // const [query8, setQuery8] = useState('');
  // const [query9, setQuery9] = useState('');
  // const [query10, setQuery10] = useState('');
  // const [status, setStatus] = useState<React.ReactNode>(null);
  // const [multiStatus, setMultiStatus] = useState(null);
  // const [isMulti, setIsMulti] = useState(false);

  // const handleSetMulti = () => {
  //   setStatus(null);
  //   setIsMulti(true);
  // };
  // const handleSetSingle = () => setIsMulti(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (query.length < 3) return;
  //   setStatus('Creating post...');
  //   const articleRes = await fetch(
  //     'https://dev.nice-advice.info/generate-post',
  //     {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ query }),
  //     },
  //   );
  //   if (articleRes) {
  //     setStatus('Post created successfully');
  //   } else {
  //     setStatus('Post creating ERROR');
  //   }
  // };

  // const handleSubmitMulti = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (query1.length < 3) return;
  //   const multiQuery = [
  //     query1,
  //     query2,
  //     query3,
  //     query4,
  //     query5,
  //     query6,
  //     query7,
  //     query8,
  //     query9,
  //     query10,
  //   ];
  //   const multiQueryFiltered = multiQuery.filter(str => str.trim() !== '');
  //   setMultiStatus('Creating posts...');
  //   const articlesRes = await fetch(
  //     'https://dev.nice-advice.info/generate-posts',
  //     {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ topics: multiQueryFiltered }),
  //     },
  //   );
  //   if (articlesRes) {
  //     setMultiStatus('Posts created successfully');
  //   } else {
  //     setMultiStatus('Posts creating ERROR');
  //   }
  // };

  return (
    <div className="h-screen flex justify-center items-center">
      {/* <div className="flex flex-col gap-4 max-w-2xl w-full px-4">
        <div className="flex justify-around">
          <button
            className="text-xl border rounded-full p-2"
            onClick={handleSetSingle}
          >
            Single
          </button>
          <button
            className="text-xl border rounded-full p-2"
            onClick={handleSetMulti}
          >
            Multi
          </button>
        </div>
        {!isMulti && (
          <div>
            <h2 className="text-mainText dark:text-white md:text-4xl text-xl font-bold text-left">
              Enter a topic for your article
            </h2>
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center justify-center w-full rounded-lg overflow-hidden shadow-md"
            >
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setStatus(null);
                }}
                placeholder="Enter topic"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <button
                type="submit"
                disabled={query.length < 3}
                className={`absolute right-2 px-3 py-2 rounded-lg bg-main2 text-white hover:bg-main3 transition-all duration-300 ${
                  query.length < 3 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                ➔
              </button>
            </form>
          </div>
        )}
        {status && (
          <p className="text-sm text-gray-700 dark:text-white mt-2">{status}</p>
        )}
        {isMulti && (
          <div>
            <h2 className="text-mainText dark:text-white md:text-4xl text-xl font-bold text-left">
              Enter a topics for your articles:
            </h2>
            <form
              onSubmit={handleSubmitMulti}
              className="relative flex flex-col justify-center w-full rounded-lg overflow-hidden shadow-md"
            >
              <input
                type="text"
                value={query1}
                onChange={e => {
                  setQuery1(e.target.value);
                }}
                placeholder="Enter topic 1"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query2}
                onChange={e => {
                  setQuery2(e.target.value);
                }}
                placeholder="Enter topic 2"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query3}
                onChange={e => {
                  setQuery3(e.target.value);
                }}
                placeholder="Enter topic 3"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query4}
                onChange={e => {
                  setQuery4(e.target.value);
                }}
                placeholder="Enter topic 4"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query5}
                onChange={e => {
                  setQuery5(e.target.value);
                }}
                placeholder="Enter topic 5"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query6}
                onChange={e => {
                  setQuery6(e.target.value);
                }}
                placeholder="Enter topic 6"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query7}
                onChange={e => {
                  setQuery7(e.target.value);
                }}
                placeholder="Enter topic 7"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query8}
                onChange={e => {
                  setQuery8(e.target.value);
                }}
                placeholder="Enter topic 8"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query9}
                onChange={e => {
                  setQuery9(e.target.value);
                }}
                placeholder="Enter topic 9"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <input
                type="text"
                value={query10}
                onChange={e => {
                  setQuery10(e.target.value);
                }}
                placeholder="Enter topic 10"
                className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
              />
              <button
                type="submit"
                disabled={query1.length < 3}
                className={`absolute right-2 px-3 py-2 rounded-lg bg-main2 text-white hover:bg-main3 transition-all duration-300 ${
                  query1.length < 3 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                ➔
              </button>
              {multiStatus && (
                <p className="text-sm text-gray-700 dark:text-white mt-2">
                  {multiStatus}
                </p>
              )}
            </form>
          </div>
        )}
      </div> */}
      <h1>Automatic generation ON</h1>
    </div>
  );
};

export default Generation;
