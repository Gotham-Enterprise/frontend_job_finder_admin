import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import Label from '../../../form/Label';
import { BlogFiltersProps } from '@/services/types/BlogTypes';

const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  onFilterChange,
  categoryOptions,
  tagOptions,
  statusOptions,
  sortOptions,
  hasActiveFilters,
  clearIndividualFilter,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </Label>
          <SearchableSelect
            value={filters.status || ''}
            onChange={(value: string) => onFilterChange('status', value)}
            options={statusOptions}
            placeholder="Select status..."
            searchPlaceholder="Search status..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </Label>
          <SearchableSelect
            value={filters.category || ''}
            onChange={(value: string) => onFilterChange('category', value)}
            options={categoryOptions}
            placeholder="Select category..."
            searchPlaceholder="Search categories..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tag
          </Label>
          <SearchableSelect
            value={filters.tag || ''}
            onChange={(value: string) => onFilterChange('tag', value)}
            options={tagOptions}
            placeholder="Select tag..."
            searchPlaceholder="Search tags..."
            className="w-full"
          />
        </div>

      
      </div>
    </div>
  );
};

export default BlogFilters;
