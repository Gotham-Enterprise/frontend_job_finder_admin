import React from 'react';
import Pagination from '../../../tables/Pagination';
import Select from '../../../form/Select';
import { CouponsTablePaginationProps } from '@/services/types/CouponsTypes';

const CouponsTablePagination: React.FC<CouponsTablePaginationProps> = ({
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
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((data.metaData.page - 1) * (filters.limit || 50)) + 1} to{' '}
          {Math.min(data.metaData.page * (filters.limit || 50), data.metaData.totalCount)} of{' '}
          {data.metaData.totalCount} results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Items per page:</span>
            <Select
              value={filters.limit?.toString() || '50'}
              onChange={(value: string) => onFilterChange('limit', parseInt(value))}
              options={itemsPerPageOptions}
              className="w-24"
            />
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

export default CouponsTablePagination;
