const Page404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-mainText px-4 text-center">
      <h1 className="text-8xl font-bold text-main">404</h1>
      <p className="mt-4 text-2xl text-additionalText dark:text-white">
        Unfortunately, the page was not found.
      </p>
      <a
        href="/"
        className="mt-6 px-6 py-3 bg-main text-white rounded-md hover:bg-main3 transition-colors"
      >
        Go Home
      </a>
    </div>
  );
};

export default Page404;
