import { FC } from 'react'

import { UseIdApprovalLogic } from '@/services/types/idApproval'
import Select from '@/components/form/Select';
import Pagination from '@/components/tables/Pagination';

interface Props {
  data: UseIdApprovalLogic['data'];
  isLoading: UseIdApprovalLogic['isLoading'];
  metaData: UseIdApprovalLogic['metaData'];
  filters: UseIdApprovalLogic['filters'];
  itemsPerPageOptions: UseIdApprovalLogic['itemsPerPageOptions'];
  onFilterChange: UseIdApprovalLogic['onFilterChange'];
}

const IdApprovalTablePagination: FC<Props> = ({ data, isLoading, metaData, filters, itemsPerPageOptions, onFilterChange }) => {
  if (data.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((metaData.page - 1) * (filters.limit || 50)) + 1} to{' '}
          {Math.min(metaData.page * (filters.limit || 50), metaData.totalCount)} of{' '}
          {metaData.totalCount} results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
            <Select
              value={filters.limit?.toString() || '50'}
              onChange={(value: string) => onFilterChange('limit', value)}
              options={itemsPerPageOptions}
              className="w-auto min-w-[120px]"
            />
          </div>
          <Pagination
            currentPage={metaData.page}
            totalPages={metaData.totalPages}
            onPageChange={(page) => onFilterChange('page', page)}
          />
        </div>
      </div>
    </div>
  )
}

export default IdApprovalTablePagination