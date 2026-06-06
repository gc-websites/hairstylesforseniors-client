import { FC, useState } from 'react';
import Logo from '../components/Logo';
import Socials from '../components/Socials';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';
import EmailForm from '../components/EmailForm';

interface Category {
  documentId: number | string;
  name: string;
}

interface FooterProps {
  categories: Category[];
}

const Footer: FC<FooterProps> = ({ categories }) => {
  const [openForm, setOpenForm] = useState(false);

  const handleFormOpen = () => setOpenForm(true);
  const handleFormClose = () => setOpenForm(false);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-main2" role="contentinfo">
      <div className="container pt-14 flex flex-col gap-16 text-white">
        <Logo
          className="lg:text-5xl md:text-4xl text-3xl text-white w-fit"
          spanClassName="text-white"
          isLink
        />
        <div className="flex flex-col md:flex-row gap-x-48 gap-y-8">
          <nav aria-label="Footer categories" className="flex flex-col gap-8">
            <h2 className="section__description text-white font-merriweather font-semibold">
              Categories
            </h2>
            <NavBar
              categories={categories}
              className="flex flex-col gap-y-5"
              textClassName="lg:text-2xl md:text-2xl text-xl break-words text-white font-light"
            />
          </nav>
          <nav aria-label="Footer about" className="flex flex-col gap-8">
            <h2 className="section__description text-white font-merriweather font-semibold">
              About
            </h2>
            <div className="flex flex-col gap-5">
              <Link
                to="/articles"
                className="section__description text-white font-light"
              >
                All Articles
              </Link>
              <Link
                to="/forum"
                className="section__description text-white font-light"
              >
                Community Forum
              </Link>
              <Link
                to="/about"
                className="section__description text-white font-light"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="section__description text-white font-light"
              >
                Contact
              </Link>
              <Link
                to="/privacy"
                className="section__description text-white font-light"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="section__description text-white font-light"
              >
                Terms
              </Link>
              <button
                type="button"
                aria-label="Open contact form"
                className="mt-1 inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-white/70 px-5 py-2.5 font-poppins text-base font-semibold text-white transition-colors hover:bg-white hover:text-main2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-main2"
                onClick={handleFormOpen}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                Contact us
              </button>
            </div>
          </nav>
          <div className="flex flex-col gap-8">
            <h2 className="section__description text-white font-merriweather font-semibold">
              Follow us
            </h2>
            <Socials
              textClassName="text-white font-light"
              IconsClassName="fill-white"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <hr className="w-full border-t-2 border-white m-0 opacity-50" />
          <p className="section__description text-skin text-white py-12 font-light">
            © {year} HairStylesForSeniors. All rights reserved.
          </p>
        </div>
      </div>
      {openForm && <EmailForm handleFormClose={handleFormClose} />}
    </footer>
  );
};

export default Footer;
