import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import { JobApplicationsFiltersProps } from '@/services/types/JobApplicationsTypes';

const JobApplicationsFilters: React.FC<JobApplicationsFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  stateOptions,
  statusOptions,
  selectedStatuses,
  onStatusToggle,
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
              Location
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
            placeholder="Select location..."
            searchPlaceholder="Search locations..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </Label>
            {selectedStatuses.length > 0 && (
              <button
                onClick={() => clearIndividualFilter('status')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <StatusToggleFilter
            selectedStatuses={selectedStatuses}
            onChange={onStatusToggle}
            options={statusOptions.map(option => ({
              value: option.value,
              label: option.label
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsFilters;
