import { FC } from 'react';
import { Link } from 'react-router-dom';

interface Category {
  documentId: number | string;
  name: string;
  image: { url: string };
}

interface CategoriesProps {
  categories: Category[];
}

const Categories: FC<CategoriesProps> = ({ categories }) => {
  return (
    <section className="container section__padding">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
        <p className="font-poppins text-main font-semibold uppercase tracking-wider text-sm mb-3">
          Browse by topic
        </p>
        <h2 className="section__title text-3xl md:text-4xl text-mainText mb-4">
          Explore Our Categories
        </h2>
        <p className="section__description text-base">
          Friendly, practical advice for every part of your hair journey — from
          everyday care and gray coverage to special-occasion styles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories?.map(({ name, documentId, image }) => (
          <Link
            key={documentId}
            to={`/category/${documentId}`}
            className="group relative block rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
          >
            <img
              src={image?.url}
              alt={name}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-60 sm:h-64 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end gap-1.5 p-6">
              <h3 className="text-white font-inter text-2xl font-bold leading-tight">
                {name}
              </h3>
              <span className="text-white/90 font-inter text-sm font-semibold inline-flex items-center gap-1.5">
                Explore articles
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
