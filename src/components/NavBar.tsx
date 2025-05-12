import { FC } from 'react';

interface Category {
  documentId: number | string;
  name: string;
}

interface NavBarProps {
  className?: string;
  textClassName?: string;
  setIsBurgerOpen?: (isOpen: boolean) => void;
  categories: Category[];
}

const NavBar: FC<NavBarProps> = ({
  className = '',
  textClassName = '',
  setIsBurgerOpen,
  categories,
}) => {
  return (
    <nav>
      <ul className={className}>
        {categories?.map(({ name, documentId }) => (
          <li key={documentId}>
            <a
              href={`/category/${documentId}`}
              className={`font-poppins md:text-base lg:text-lg text-sm ${textClassName}`}
              onClick={() => {
                if (setIsBurgerOpen) {
                  setIsBurgerOpen(false);
                }
              }}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
