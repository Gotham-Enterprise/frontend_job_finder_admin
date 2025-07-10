import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import { JobSeekersFiltersProps } from '@/services/types/JobSeekersTypes';

const JobSeekersFilters: React.FC<JobSeekersFiltersProps> = ({
  filters,
  onFilterChange,
  occupationOptions,
  stateOptions,
  statusOptions,
  selectedStatuses,
  onStatusToggleChange,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Occupation
          </Label>
          <SearchableSelect
            value={filters.occupationId?.toString() || ''}
            onChange={(value: string) => onFilterChange('occupationId', value === '' ? undefined : parseInt(value))}
            options={occupationOptions}
            placeholder="Select occupation..."
            searchPlaceholder="Search occupations..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            State
          </Label>
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
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </Label>
          <StatusToggleFilter
            selectedStatuses={selectedStatuses}
            onChange={onStatusToggleChange}
            options={statusOptions}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default JobSeekersFilters;
