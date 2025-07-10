import React from 'react';
import StatusToggleFilter from '../../../ui/StatusToggleFilter';
import Label from '../../../form/Label';
import { CouponsFiltersProps } from '@/services/types/CouponsTypes';

const CouponsFilters: React.FC<CouponsFiltersProps> = ({
  isOpen,
  filters,
  onFilterChange,
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

export default CouponsFilters;
