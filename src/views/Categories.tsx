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
      <h2 className="section__title mb-6 text-mainText">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
        {categories?.map(({ name, documentId, image }) => (
          <Link
            key={documentId}
            to={`/category/${documentId}`}
            className="relative block w-full max-w-sm rounded-lg overflow-hidden shadow-md transition-all duration-300 group hover:shadow-xl"
          >
            <img
              src={image.url}
              alt={name}
              className="object-cover w-full md:h-96 h-72 filter sepia-[.25] transition-all duration-300 group-hover:brightness-75"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end gap-6 transition-all duration-300 group-hover:bg-opacity-50 p-6">
              <span className="text-white font-inter text-3xl font-bold">
                {name}
              </span>
              <span className="text-white font-inter text-xl font-bold relative inline-block after:absolute after:left-0 after:bottom-0 after:w-2/3 after:h-[2px] after:bg-main after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                Explore articles →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
