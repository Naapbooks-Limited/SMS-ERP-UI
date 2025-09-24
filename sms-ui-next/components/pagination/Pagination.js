import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === currentPage || page === '...'}
          className={`px-4 py-2 rounded ${page === currentPage
              ? 'bg-[#846cf9] dark:bg-[#846cf9] text-white dark:text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white'
            } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {page}    
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
