const HorizontalAdBanner = ({ image, url }) => {
  return (
    <section className="bg-white p-4 dark:bg-additionalText">
      <div className="container">
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={image}
            alt="advertisement"
            className="w-full max-h-36 border-gray-400 border-[1px] object-cover"
          />
        </a>
      </div>
    </section>
  );
};

export default HorizontalAdBanner;
