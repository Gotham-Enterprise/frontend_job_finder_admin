import React from 'react';
import Pagination from '../../../tables/Pagination';
import { BlogTablePaginationProps } from '@/services/types/BlogTypes';

const BlogTablePagination: React.FC<BlogTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  if (!data?.success || !data?.data?.length || !data?.metaData) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((data.metaData.page - 1) * (filters.limit || 10)) + 1} to{' '}
            {Math.min(data.metaData.page * (filters.limit || 10), data.metaData.totalCount)} of{' '}
            {data.metaData.totalCount} results
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Items per page dropdown */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-gray-500 dark:text-gray-400">Items per page</span>
            <select
              value={filters.limit?.toString() || '10'}
              onChange={(e) => onFilterChange && onFilterChange('limit', parseInt(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px]"
            >
              {itemsPerPageOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <Pagination
            currentPage={data.metaData.page}
            totalPages={data.metaData.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogTablePagination;
