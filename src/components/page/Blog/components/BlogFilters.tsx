import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import { BlogFiltersProps } from '@/services/types/BlogTypes';

const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  onFilterChange,
  categoryOptions,
  tagOptions,
  statusOptions,
  sortOptions,
  selectedStatuses,
  onStatusToggle,
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
          <StatusToggleFilter
            selectedStatuses={selectedStatuses || []}
            onChange={onStatusToggle || (() => {})}
            options={statusOptions.filter(option => option.value !== '')}
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </Label>
          <SearchableSelect
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(value: string) => onFilterChange('sortBy', value)}
            options={sortOptions}
            placeholder="Sort posts..."
            searchPlaceholder="Search sort options..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
