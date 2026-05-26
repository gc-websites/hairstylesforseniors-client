import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ForumCategory } from '../../services/forumAPI';

interface CategoryCardProps {
  category: ForumCategory;
  threadCount?: number;
}

const CategoryCard: FC<CategoryCardProps> = ({ category, threadCount }) => {
  return (
    <Link to={`/forum/c/${category.slug}`} className="hfs-forum__catCard">
      <span className="hfs-forum__catEmoji" aria-hidden="true">
        {category.emoji}
      </span>
      <div className="hfs-forum__catBody">
        <h3 className="hfs-forum__catName">{category.key}</h3>
        <p className="hfs-forum__catBlurb">{category.blurb}</p>
        {typeof threadCount === 'number' && (
          <p
            className="hfs-forum__catBlurb"
            style={{ marginTop: 6, fontSize: '0.8rem' }}
          >
            <strong>{threadCount}</strong>{' '}
            {threadCount === 1 ? 'discussion' : 'discussions'}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
