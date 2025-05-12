import { FC } from 'react';
import Logo from '../components/Logo';
import Socials from '../components/Socials';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

interface Category {
  documentId: number | string;
  name: string;
}

interface FooterProps {
  categories: Category[];
}

const Footer: FC<FooterProps> = ({ categories }) => {
  return (
    <footer className="bg-main2">
      <div className="container pt-14 flex flex-col gap-16 text-white">
        <Logo
          className="lg:text-5xl md:text-4xl text-3xl text-white w-fit"
          spanClassName="text-white"
          isLink
        />
        <div className="flex flex-col md:flex-row gap-x-48 gap-y-8">
          <div className="flex flex-col gap-8">
            <h4 className="section__description text-white font-merriweather font-semibold">
              Categories
            </h4>
            <NavBar
              categories={categories}
              className="flex flex-col gap-y-5"
              textClassName="lg:text-2xl md:text-2xl text-xl break-words text-white font-light"
            />
          </div>
          <div className="flex flex-col gap-8">
            <h4 className="section__description text-white font-merriweather font-semibold">
              About
            </h4>
            <div className="flex flex-col gap-5">
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
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <h4 className="section__description text-white font-merriweather font-semibold">
              Follow us:
            </h4>
            <Socials
              textClassName="text-white font-light"
              IconsClassName="fill-white"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <hr className="w-full border-t-2 border-white m-0 opacity-50" />
          <p className="section__description text-skin text-white py-12 font-light">
            @2025 Nice Advice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
