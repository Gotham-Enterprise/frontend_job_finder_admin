import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import Input from '../../../ui/input/Input';
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
  clearIndividualFilter,
}) => {
  const [cityInput, setCityInput] = useState(filters.city || '');

  // Radius options
  const radiusOptions = [
    { value: '', label: 'Any Distance' },
    { value: '1', label: '1 mile' },
    { value: '3', label: '3 miles' },
    { value: '5', label: '5 miles' },
    { value: '10', label: '10 miles' },
    { value: '25', label: '25 miles' },
    { value: '50', label: '50 miles' },
    { value: '100', label: '100 miles' },
  ];

  // Debounce city input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange('city', cityInput);
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [cityInput, onFilterChange]);

  // Sync local state when filters change from external source (like clear)
  useEffect(() => {
    setCityInput(filters.city || '');
  }, [filters.city]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Occupation
            </Label>
            {filters.occupationId && (
              <button
                onClick={() => clearIndividualFilter('occupationId')}
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
            placeholder="Select occupation..."
            searchPlaceholder="Search occupations..."
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </Label>
            {filters.city && (
              <button
                onClick={() => clearIndividualFilter('city')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Enter city..."
            className="w-full"
          />
        </div>
     
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
              Radius
            </Label>
            {filters.radius && (
              <button
                onClick={() => clearIndividualFilter('radius')}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <SearchableSelect
            value={filters.radius?.toString() || ''}
            onChange={(value: string) => {
              const numericValue = value === '' ? undefined : parseInt(value, 10);
              onFilterChange('radius', numericValue);
            }}
            options={radiusOptions}
            placeholder="Select radius..."
            searchPlaceholder="Search radius..."
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
