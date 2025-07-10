import React from 'react';
import Pagination from '../../../tables/Pagination';
import Select from '../../../form/Select';
import { JobsAdminTablePaginationProps } from '@/services/types/JobsAdminTypes';

const JobsAdminTablePagination: React.FC<JobsAdminTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  if (!data?.metaData || data.metaData.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1} to{' '}
        {Math.min((filters.page || 1) * (filters.limit || 50), data.metaData.totalCount)} of{' '}
        {data.metaData.totalCount} jobs
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
          <Select
            value={filters.limit?.toString() || '50'}
            onChange={(value: string) => onFilterChange('limit', parseInt(value))}
            options={itemsPerPageOptions}
            className="w-auto min-w-[120px]"
          />
        </div>
        <Pagination
          currentPage={data.metaData.page}
          totalPages={data.metaData.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default JobsAdminTablePagination;
