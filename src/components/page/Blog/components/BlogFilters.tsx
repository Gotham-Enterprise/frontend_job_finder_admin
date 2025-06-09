import React from 'react';
import Select from '../../../form/Select';
import { BlogFiltersProps } from '@/services/types/BlogTypes';

const BlogFilters: React.FC<BlogFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  categoryOptions,
  tagOptions,
  statusOptions,
  sortOptions,
  itemsPerPageOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>          <Select
            options={statusOptions}
            defaultValue={filters.status || ''}
            onChange={(value:any) => onFilterChange('status', value)}
            placeholder="All Statuses"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>          <Select
            options={categoryOptions}
            defaultValue={filters.category || ''}
            onChange={(value:any) => onFilterChange('category', value)}
            placeholder="All Categories"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag
          </label>          <Select
            options={tagOptions}
            defaultValue={filters.tag || ''}
            onChange={(value) => onFilterChange('tag', value)}
            placeholder="All Tags"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>          <Select
            options={sortOptions}
            defaultValue={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(value) => onFilterChange('sortBy', value)}
            placeholder="Sort Posts"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Items per page
          </label>          <Select
            options={itemsPerPageOptions}
            defaultValue={filters.limit?.toString() || '10'}
            onChange={(value) => onFilterChange('limit', parseInt(value))}
            placeholder="Items per page"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onFilterChange('status', '');
              onFilterChange('category', '');
              onFilterChange('tag', '');
              onFilterChange('sortBy', 'createdAt-desc');
              onFilterChange('limit', 10);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
