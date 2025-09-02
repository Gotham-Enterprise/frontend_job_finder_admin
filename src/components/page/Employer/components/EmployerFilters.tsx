import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import Label from '../../../form/Label';
import { EmployerFiltersProps } from '@/services/types/EmployerTypes';

const EmployerFilters: React.FC<EmployerFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  stateOptions,
  statusOptions,
  hasActiveFilters,
  clearIndividualFilter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </Label>
            {filters.location && (
              <button
                onClick={() => clearIndividualFilter('location')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.location || ''}
            onChange={(value: string) => onFilterChange('location', value)}
            options={stateOptions}
            placeholder="Select state..."
            searchPlaceholder="Search states..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </Label>
            {filters.status && (
              <button
                onClick={() => clearIndividualFilter('status')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
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
      </div>
    </div>
  );
};

export default EmployerFilters;
