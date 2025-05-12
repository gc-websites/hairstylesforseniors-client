const RenderDescription = ({
  description,
  className = '',
  truncate = false,
}) => {
  const renderParagraph = (block, index) => {
    return (
      <p
        key={index}
        className={`${className} ${truncate ? 'line-clamp-3' : ''}`}
      >
        {block.children.map((child, childIndex) => {
          if (child.type === 'text') {
            return child.text;
          } else if (child.type === 'link') {
            return (
              <a
                key={childIndex}
                href={child.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-main"
              >
                {child.children.map(linkText => linkText.text)}
              </a>
            );
          }
          return null;
        })}
      </p>
    );
  };

  if (truncate) {
    return renderParagraph(description[0], 0);
  }

  return description.map((block, index) => {
    if (block.type === 'paragraph') {
      return renderParagraph(block, index);
    }
    return null;
  });
};

export default RenderDescription;
