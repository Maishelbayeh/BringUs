import React from 'react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const ArrowRight = (
    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
  
  const ArrowLeft = (
    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        className="pagination-button px-3 py-1 rounded border bg-white text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        {ArrowLeft}
      </button>
      
      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-1 text-gray-500">...</span>
          ) : (
            <button
              className={`pagination-button px-3 py-1 rounded border transition-colors ${
                currentPage === page 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-primary hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      <button
        className="pagination-button px-3 py-1 rounded border bg-white text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        {ArrowRight}
      </button>
    </div>
  );
};

export default TablePagination; 