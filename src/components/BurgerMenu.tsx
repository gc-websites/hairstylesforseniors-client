import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { close } from '../utils/Icons';

import NavBar from './NavBar';
import Logo from './Logo';
import Socials from './Socials';
import ThemeToggle from './ThemeToggle';

interface Category {
  documentId: number | string;
  name: string;
}

interface BurgerMenuProps {
  isBurgerOpen: boolean;
  setIsBurgerOpen: (isOpen: boolean) => void;
  categories: Category[];
}

const BurgerMenu: FC<BurgerMenuProps> = ({
  isBurgerOpen,
  setIsBurgerOpen,
  categories,
}) => {
  useEffect(() => {
    if (isBurgerOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isBurgerOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsBurgerOpen(false);
    }
  };

  return createPortal(
    <div
      className={`fixed top-0 left-0 w-screen h-screen z-40 bg-[#0000001e] transition-opacity duration-300 ${
        isBurgerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`absolute top-0 left-0 w-[80vw] md:w-[20vw] h-screen bg-[#F0F0F0] dark:bg-mainText grain-effect container max-w-none flex flex-col gap-y-20 py-10 transition-transform duration-300 overflow-y-auto shadow-2xl ${
          isBurgerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsBurgerOpen(false)}
          className="w-10 h-10 absolute right-6 md:h-6 md:w-6"
        >
          <svg
            className="fill-black dark:fill-white"
            viewBox="0,0,256,256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {close}
          </svg>
        </button>
        <Logo className="text-xl w-fit" />
        <ThemeToggle />
        <NavBar
          className="flex flex-col gap-y-5"
          textClassName="text-xl break-words text-additionalText dark:text-white"
          setIsBurgerOpen={setIsBurgerOpen}
          categories={categories}
        />
        <hr className="w-full border-t-2 border-additionalText dark:border-white m-0 opacity-20" />
        <div className="flex flex-col gap-4">
          <h4 className="font-inter text-lg">Follow us:</h4>
          <Socials
            textClassName="text-additionalText dark:text-white"
            IconsClassName="fill-additionalText dark:fill-white"
          />
        </div>
      </div>
    </div>,
    document.querySelector('#modal') as HTMLElement,
  );
};

export default BurgerMenu;
