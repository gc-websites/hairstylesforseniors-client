import { FC } from 'react';

import Hero from '../views/Hero';
import Categories from '../views/Categories';
import About from '../views/About';
import Disclaimer from '../views/Disclaimer';
import SearchBar from '../views/SearchBar';
import Newsletter from '../views/Newsletter';
import { SITE, useSEO } from '../utils/useSEO';

interface Category {
  documentId: number | string;
  name: string;
}

interface HomeProps {
  categories: Category[];
}

const Home: FC<HomeProps> = ({ categories }) => {
  useSEO({
    title: 'Hair Care, Styles & Confidence Tips for Adults 50+',
    description:
      'HairStylesForSeniors — friendly, practical hair-care advice for people 50 and up. Senior-friendly hairstyles, color and gray-coverage tips, hair-loss support, product reviews, and a warm community forum.',
    canonical: '/',
    type: 'website',
    keywords:
      'hairstyles for seniors, hair care for older women, gray hair, hair thinning over 50, senior hairstyles, hair color for seniors, short hair women over 60',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'HairStylesForSeniors – Articles & Tips',
      url: `${SITE.ORIGIN}/`,
      description:
        'Editorial articles and practical guides on hair care, hairstyles, color, and hair loss for adults 50 and up.',
      hasPart: categories?.slice(0, 10).map(c => ({
        '@type': 'CollectionPage',
        name: c.name,
        url: `${SITE.ORIGIN}/category/${c.documentId}`,
      })),
    },
  });

  return (
    <div>
      <Hero />
      <SearchBar />
      <Categories categories={categories} />
      <About />
      <Newsletter />
      <Disclaimer />
    </div>
  );
};

export default Home;
