import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import DatePicker from '../../../form/date-picker';
import { JobsAdminFiltersProps } from '@/services/types/JobsAdminTypes';

const JobsAdminFilters: React.FC<JobsAdminFiltersProps> = ({
  filters,
  onFilterChange,
  onClearIndividualFilter,
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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Posted
            </Label>
         
            {filters.datePosted && (
              <button
                onClick={() => onClearIndividualFilter('datePosted')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Occupation
            </Label>
          
            {filters.occupationId && (
              <button
                onClick={() => onClearIndividualFilter('occupationId')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.occupationId?.toString() || ''}
            onChange={(value: string) => onFilterChange('occupationId', value === '' ? undefined : parseInt(value))}
            options={occupationOptions}
            placeholder="Select Occupation..."
            searchPlaceholder="Search occupations..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Specialty
            </Label>
          
            {filters.specialtyId && (
              <button
                onClick={() => onClearIndividualFilter('specialtyId')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.specialtyId?.toString() || ''}
            onChange={(value: string) => onFilterChange('specialtyId', value === '' ? undefined : parseInt(value))}
            options={specialtyOptions}
            disabled={!selectedOccupationId}
            placeholder="Select Specialty..."
            searchPlaceholder="Search specialties..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </Label>
           
            {filters.state && (
              <button
                onClick={() => onClearIndividualFilter('state')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Status
            </Label>
           
            {selectedJobStatuses.length > 0 && (
              <button
                onClick={() => onClearIndividualFilter('jobStatus')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <StatusToggleFilter
            selectedStatuses={selectedJobStatuses}
            onChange={onJobStatusToggle}
            options={jobStatusOptions.map(option => ({
              value: option.value,
              label: option.label
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsAdminFilters;
