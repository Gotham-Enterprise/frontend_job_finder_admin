import React from 'react';
import Pagination from '../../../tables/Pagination';
import Select from '../../../form/Select';
import { DeletedJobSeekersTablePaginationProps } from '@/services/types/deletedJobSeekers';

const DeletedJobSeekersTablePagination: React.FC<DeletedJobSeekersTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  if (!data?.metaData) {
    return null;
  }

  const { metaData } = data;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <Select
            value={filters.limit?.toString() || '10'}
            onChange={(value: string) => onFilterChange('limit', parseInt(value))}
            options={itemsPerPageOptions}
            className="w-32"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
        </div>

        {/* Results summary */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((metaData.page - 1) * metaData.limit) + 1} to{' '}
          {Math.min(metaData.page * metaData.limit, metaData.totalCount)} of{' '}
          {metaData.totalCount} results
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={metaData.page}
          totalPages={metaData.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default DeletedJobSeekersTablePagination;
