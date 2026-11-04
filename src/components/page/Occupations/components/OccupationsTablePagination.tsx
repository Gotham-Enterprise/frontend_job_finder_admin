"use client";
import React from 'react';
import Pagination from '@/components/tables/Pagination';
import Select from '@/components/form/Select';
import { OccupationPaginationMeta } from '@/services/types/occupation';

interface OccupationsTablePaginationProps {
  metaData?: OccupationPaginationMeta;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export const OccupationsTablePagination: React.FC<OccupationsTablePaginationProps> = ({
  metaData,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  if (!metaData || metaData.totalCount === 0) {
    return null;
  }

  const page = metaData.page;
  const totalCount = metaData.totalCount;
  const totalPages = metaData.totalPages;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-200">{startItem}</span> to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">{endItem}</span> of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">{totalCount}</span> results
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Items per page:
            </span>
            <Select
              value={limit.toString()}
              onChange={(value: string) => onLimitChange(parseInt(value, 10))}
              options={LIMIT_OPTIONS}
              className="w-20 text-xs"
            />
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

