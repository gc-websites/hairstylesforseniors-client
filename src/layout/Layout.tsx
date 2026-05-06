import { ReactNode, FC } from 'react';
import Footer from './Footer';
import Header from './Header';

interface Category {
  documentId: number | string;
  name: string;
}

interface LayoutProps {
  children: ReactNode;
  categories: Category[];
}

const Layout: FC<LayoutProps> = ({ children, categories }) => {
  return (
    <div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-main focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <Header categories={categories} />
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <Footer categories={categories} />
    </div>
  );
};

export default Layout;
