import React from 'react';
import Select from '../../../form/Select';
import Label from '../../../form/Label';
import Input from '../../../ui/input/Input';
import { JobsAdminFiltersProps } from '@/services/types/JobsAdminTypes';

const JobsAdminFilters: React.FC<JobsAdminFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  occupationOptions,
  specialtyOptions,
  stateOptions,
  jobStatusOptions,
  itemsPerPageOptions,
  selectedOccupationId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Occupation
          </Label>
          <Select
            defaultValue={filters.occupationId?.toString() || ''}
            onChange={(value: string) => onFilterChange('occupationId', value === '' ? undefined : parseInt(value))}
            options={occupationOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialty
          </Label>
          <Select
            defaultValue={filters.specialtyId?.toString() || ''}
            onChange={(value: string) => onFilterChange('specialtyId', value === '' ? undefined : parseInt(value))}
            options={specialtyOptions}
            disabled={!selectedOccupationId}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </Label>
          <Select
            defaultValue={filters.state || ''}
            onChange={(value: string) => onFilterChange('state', value)}
            options={stateOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Status
          </Label>
          <Select
            defaultValue={filters.jobStatus || ''}
            onChange={(value: string) => onFilterChange('jobStatus', value)}
            options={jobStatusOptions}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Posted
          </Label>
          <Input
            type="text"
            placeholder="May 15, 2025"
            value={filters.datePosted || ''}
            onChange={(e) => onFilterChange('datePosted', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items per page
          </Label>
          <Select
            defaultValue={filters.limit?.toString() || '10'}
            onChange={(value: string) => onFilterChange('limit', parseInt(value))}
            options={itemsPerPageOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsAdminFilters;
