import React from 'react';
import Select from '../../../form/Select';
import Label from '../../../form/Label';
import { CouponsFiltersProps } from '@/services/types/CouponsTypes';

const CouponsFilters: React.FC<CouponsFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  statusOptions,
  sortByOptions,
  sortOrderOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">       
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </Label>
          <Select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(value: string) => onFilterChange('isActive', value)}
            options={statusOptions}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </Label>
          <Select
            value={filters.sortBy || 'createdAt'}
            onChange={(value: string) => onFilterChange('sortBy', value)}
            options={sortByOptions}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort Order
          </Label>
          <Select
            value={filters.sortOrder || 'desc'}
            onChange={(value: string) => onFilterChange('sortOrder', value)}
            options={sortOrderOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponsFilters;
