import { useEffect, useState } from 'react';
import { getProtectedPassword } from '../services/postsAPI';
import Loader from './Loader';

const PrivateRouteWithPassword = ({ children }) => {
  const [storedPassword, setStoredPassword] = useState(null);
  const [input, setInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const password = await getProtectedPassword();
        setStoredPassword(password);

        const saved = localStorage.getItem('universal-page-pass');
        if (saved && saved === password) {
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error('cannot load password from Strapi', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPassword();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (input === storedPassword) {
      localStorage.setItem('universal-page-pass', input);
      setIsAuthorized(true);
    } else {
      alert('❌ incorrect password');
    }
  };

  if (loading) return <Loader />;

  if (!isAuthorized) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col gap-4 max-w-2xl w-full px-4">
          <h2 className="text-mainText dark:text-white md:text-4xl text-xl font-bold text-left">
            Enter a Password 🔒
          </h2>
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center justify-center w-full rounded-lg overflow-hidden shadow-md"
          >
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter password"
              className="text-base flex-grow px-4 py-4 text-gray-800 dark:text-white focus:outline-none bg-white dark:bg-additionalText"
            />
            <button
              type="submit"
              className={`absolute right-2 px-3 py-2 rounded-lg bg-main2 text-white hover:bg-main3 transition-all duration-300 ${input.length < 1 ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              ➔
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRouteWithPassword;
