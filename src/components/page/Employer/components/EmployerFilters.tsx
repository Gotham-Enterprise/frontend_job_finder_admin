import React from 'react';
import SearchableSelect from '../../../ui/SearchableSelect';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import { EmployerFiltersProps } from '@/services/types/EmployerTypes';

const EmployerFilters: React.FC<EmployerFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
  stateOptions,
  statusOptions,
  selectedStatuses,
  onStatusToggle,
  hasActiveFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
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

export default EmployerFilters;
