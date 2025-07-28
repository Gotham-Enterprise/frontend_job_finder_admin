import React from 'react';
import SearchableSelect from '../../ui/SearchableSelect';
import Label from '../../form/Label';
import { BlogFilters } from '@/services/types/blog';

interface ArchivedBlogFiltersProps {
  filters: BlogFilters;
  onFilterChange: (key: keyof BlogFilters, value: any) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  clearIndividualFilter: (filterKey: string) => void;
}

const ArchivedBlogFilters: React.FC<ArchivedBlogFiltersProps> = ({
  filters,
  onFilterChange,
  categoryOptions,
  tagOptions,
  statusOptions,
  hasActiveFilters,
  clearIndividualFilter,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </Label>
            {filters.status && clearIndividualFilter && (
              <button
                type="button"
                onClick={() => clearIndividualFilter('status')}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </Label>
            {filters.category && clearIndividualFilter && (
              <button
                type="button"
                onClick={() => clearIndividualFilter('category')}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tag
            </Label>
            {filters.tag && clearIndividualFilter && (
              <button
                type="button"
                onClick={() => clearIndividualFilter('tag')}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
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

export default ArchivedBlogFilters;
