import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import DatePicker from '../../../form/date-picker';
import { JobsAdminFiltersProps } from '@/services/types/JobsAdminTypes';

const JobsAdminFilters: React.FC<JobsAdminFiltersProps> = ({
  filters,
  onFilterChange,
  occupationOptions,
  specialtyOptions,
  stateOptions,
  jobStatusOptions,
  selectedOccupationId,
  hasActiveFilters,
  selectedJobStatuses,
  onJobStatusToggle,
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
            Specialty
          </Label>
          <SearchableSelect
            value={filters.specialtyId?.toString() || ''}
            onChange={(value: string) => onFilterChange('specialtyId', value === '' ? undefined : parseInt(value))}
            options={specialtyOptions}
            disabled={!selectedOccupationId}
            placeholder="Select specialty..."
            searchPlaceholder="Search specialties..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            State
          </Label>
          <SearchableSelect
            value={filters.state || ''}
            onChange={(value: string) => onFilterChange('state', value)}
            options={stateOptions}
            placeholder="Select state..."
            searchPlaceholder="Search states..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Status
          </Label>
          <StatusToggleFilter
            selectedStatuses={selectedJobStatuses}
            onChange={onJobStatusToggle}
            options={jobStatusOptions.map(option => ({
              value: option.value,
              label: option.label
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Posted
          </Label>
          <DatePicker
            key={filters.datePosted || 'date-picker'}
            id="jobs-date-posted-filter"
            placeholder="Select date posted"
            defaultDate={filters.datePosted || undefined}
            onChange={(dates, currentDateString) => {
              onFilterChange('datePosted', currentDateString || '');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsAdminFilters;
