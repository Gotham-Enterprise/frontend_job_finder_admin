import React from 'react';
import Button from '../../../../ui/button/Button';
import { MetaData, ApplicantsTablePaginationProps } from '@/services/types/applicant';

const ApplicantsTablePagination: React.FC<ApplicantsTablePaginationProps> = ({
  data,
  filters,
  onPageChange
}) => {
  const { metaData } = data || {};
  
  if (!metaData || metaData.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasPreviousPage, hasNextPage, totalCount } = metaData;

  const onPrevious = () => {
    if (hasPreviousPage) {
      onPageChange(page - 1);
    }
  };

  const onNext = () => {
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing page <span className="font-medium">{page}</span> of
        <span className="font-medium">{totalPages}</span>
        {totalCount && (
          <>
          <span className="font-medium">{totalCount}</span> total applicants
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getVisiblePages().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-3 py-1 text-gray-500">...</span>
              ) : (                <Button
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(Number(pageNum))}
                  className={`min-w-[2.5rem] ${
                    pageNum === page 
                      ? 'bg-brand-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
          className="flex items-center gap-2"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ApplicantsTablePagination;
