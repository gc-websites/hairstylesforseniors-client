import { FC } from 'react';

import Hero from '../views/Hero';
import Categories from '../views/Categories';
import About from '../views/About';
import Disclaimer from '../views/Disclaimer';
import SearchBar from '../views/SearchBar';
import Newsletter from '../views/Newsletter';
import { useSEO } from '../utils/useSEO';

interface Category {
  documentId: number | string;
  name: string;
}

interface HomeProps {
  categories: Category[];
}

const Home: FC<HomeProps> = ({ categories }) => {
  useSEO({
    title: 'Practical Health, Family, Nutrition & Lifestyle Tips',
    description:
      'HairStylesForSeniors – well-researched articles and practical tips on health, family, sports, nutrition, body wellness, and everyday lifestyle. Read trusted advice for a healthier life.',
    canonical: '/',
    type: 'website',
    keywords:
      'health tips, family advice, sports, lifestyle, nutrition, wellness, healthy living, daily advice',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'HairStylesForSeniors – Articles & Tips',
      url: 'https://nice-advice.info/',
      description:
        'Editorial articles and practical guides on health, family, sports, nutrition, and lifestyle.',
      hasPart: categories?.slice(0, 10).map(c => ({
        '@type': 'CollectionPage',
        name: c.name,
        url: `https://nice-advice.info/category/${c.documentId}`,
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
