import React from 'react';
import Pagination from '../../../tables/Pagination';
import Button from '../../../ui/button/Button';
import { TrashBinIcon } from '@/icons';
import { BlogTablePaginationProps } from '@/services/types/BlogTypes';

interface ExtendedBlogTablePaginationProps extends BlogTablePaginationProps {
  selectedPosts: string[];
  onBulkDelete: () => void;
  isBulkDeleting: boolean;
}

const BlogTablePagination: React.FC<ExtendedBlogTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  selectedPosts,
  onBulkDelete,
  isBulkDeleting,
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
          
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedPosts.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                disabled={isBulkDeleting}
                startIcon={<TrashBinIcon />}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {isBulkDeleting ? 'Deleting...' : `Delete ${selectedPosts.length} post${selectedPosts.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}
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

export default BlogTablePagination;
