import React from 'react';
import Pagination from '../../../tables/Pagination';
import { JobSeekersTablePaginationProps } from '@/services/types/JobSeekersTypes';

const JobSeekersTablePagination: React.FC<JobSeekersTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
}) => {
  if (!data?.success || !data?.data?.length || !data?.metaData) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((data.metaData.page - 1) * (filters.limit || 10)) + 1} to{' '}
          {Math.min(data.metaData.page * (filters.limit || 10), data.metaData.totalCount)} of{' '}
          {data.metaData.totalCount} results
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

export default JobSeekersTablePagination;
