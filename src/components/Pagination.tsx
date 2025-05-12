const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const maxPageNumbers = 5;
  const halfPageNumbers = Math.floor(maxPageNumbers / 2);

  let startPage = Math.max(currentPage - halfPageNumbers, 1);
  let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

  if (endPage - startPage < maxPageNumbers - 1) {
    startPage = Math.max(endPage - maxPageNumbers + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-inter px-3 py-1 border rounded disabled:opacity-50 transition-colors"
      >
        &larr; <span className="hidden md:inline-block">Prev</span>
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`font-inter px-3 py-1 border rounded transition-colors ${
            number === currentPage ? 'bg-main2 text-white' : ''
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-inter px-3 py-1 border rounded disabled:opacity-50 transition-colors"
      >
        <span className="hidden md:inline-block">Next</span> &rarr;
      </button>
    </div>
  );
};

export default Pagination;
