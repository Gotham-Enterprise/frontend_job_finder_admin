import React from 'react';
import Select from '../../../form/Select';
import Label from '../../../form/Label';
import { JobApplicationsFiltersProps } from '@/services/types/JobApplicationsTypes';

const JobApplicationsFilters: React.FC<JobApplicationsFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  stateOptions,
  statusOptions,
  itemsPerPageOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">       
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </Label>
          <Select
            value={filters.location || ''}
            onChange={(value: string) => onFilterChange('location', value)}
            options={stateOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </Label>
          <Select
            value={filters.status || ''}
            onChange={(value: string) => onFilterChange('status', value)}
            options={statusOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items per page
          </Label>
          <Select
            value={filters.limit?.toString() || '10'}
            onChange={(value: string) => onFilterChange('limit', parseInt(value))}
            options={itemsPerPageOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsFilters;
