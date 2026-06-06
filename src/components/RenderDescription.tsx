import { Fragment } from 'react';

// Renders Strapi "blocks" rich text. Supports paragraphs, headings, ordered/
// unordered lists, inline links and bold/italic/underline marks — enough for
// rich, genuinely useful articles (step-by-steps, key takeaways, FAQs) while
// staying resilient to missing/partial data.

const renderInline = children =>
  (children || []).map((child, i) => {
    if (!child) return null;
    if (child.type === 'link') {
      return (
        <a
          key={i}
          href={child.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-main"
        >
          {(child.children || []).map(c => c?.text || '').join('')}
        </a>
      );
    }
    const text = child.text ?? '';
    if (text === '') return null;
    let node = <>{text}</>;
    if (child.bold) node = <strong>{node}</strong>;
    if (child.italic) node = <em>{node}</em>;
    if (child.underline) node = <u>{node}</u>;
    return <Fragment key={i}>{node}</Fragment>;
  });

const RenderDescription = ({
  description,
  className = '',
  truncate = false,
}) => {
  if (!Array.isArray(description) || description.length === 0) {
    return null;
  }

  const renderBlock = (block, index) => {
    if (!block) return null;

    if (block.type === 'heading') {
      const lvl = block.level || 3;
      const Tag = lvl <= 3 ? 'h3' : 'h4';
      const size = lvl <= 3 ? 'text-2xl' : 'text-xl';
      return (
        <Tag
          key={index}
          className={`section__title ${size} text-mainText mt-4`}
        >
          {renderInline(block.children)}
        </Tag>
      );
    }

    if (block.type === 'list') {
      const ordered = block.format === 'ordered';
      const Tag = ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={index}
          className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 flex flex-col gap-2 ${className}`}
        >
          {(block.children || []).map((li, i) => (
            <li key={i} className="marker:text-main">
              {renderInline(li?.children)}
            </li>
          ))}
        </Tag>
      );
    }

    // default: paragraph
    return (
      <p
        key={index}
        className={`${className} ${truncate ? 'line-clamp-3' : ''}`}
      >
        {renderInline(block.children)}
      </p>
    );
  };

  if (truncate) {
    return renderBlock(description[0], 0);
  }

  return <>{description.map(renderBlock)}</>;
};

export default RenderDescription;
