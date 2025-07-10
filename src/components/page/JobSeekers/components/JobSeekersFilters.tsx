import React from 'react';
import Select from '../../../form/Select';
import Label from '../../../form/Label';
import { JobSeekersFiltersProps } from '@/services/types/JobSeekersTypes';

const JobSeekersFilters: React.FC<JobSeekersFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  occupationOptions,
  stateOptions,
  statusOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">       
         <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Occupation
          </Label>
          <Select
            value={filters.occupationId?.toString() || ''}
            onChange={(value: string) => onFilterChange('occupationId', value === '' ? undefined : parseInt(value))}
            options={occupationOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
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
      </div>
    </div>
  );
};

export default JobSeekersFilters;
