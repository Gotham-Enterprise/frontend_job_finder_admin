import React from 'react';
import Pagination from '../../../tables/Pagination';
import { JobsAdminTablePaginationProps } from '@/services/types/JobsAdminTypes';

const JobsAdminTablePagination: React.FC<JobsAdminTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
}) => {
  if (!data?.metaData || data.metaData.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
        {Math.min((filters.page || 1) * (filters.limit || 10), data.metaData.totalCount)} of{' '}
        {data.metaData.totalCount} jobs
      </div>
      <Pagination
        currentPage={data.metaData.page}
        totalPages={data.metaData.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default JobsAdminTablePagination;
