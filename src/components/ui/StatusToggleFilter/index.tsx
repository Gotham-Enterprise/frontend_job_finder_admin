import React from 'react';
import ToggleSwitch from '../ToggleSwitch';

interface StatusToggleOption {
  value: string;
  label: string;
  count?: number;
}

interface StatusToggleFilterProps {
  selectedStatuses: string[];
  onChange: (statuses: string[]) => void;
  options: StatusToggleOption[];
  className?: string;
}

const StatusToggleFilter: React.FC<StatusToggleFilterProps> = ({
  selectedStatuses,
  onChange,
  options,
  className = '',
}) => {
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const statusOptions = options.filter(option => option.value !== '');

  return (
    <div className={`space-y-3 ${className}`}>
      {statusOptions.map((option) => (
        <ToggleSwitch
          key={option.value}
          id={`status-${option.value}`}
          checked={selectedStatuses.includes(option.value)}
          onChange={() => toggleStatus(option.value)}
          label={option.label}
          size="sm"
        />
      ))}
    </div>
  );
};

export default StatusToggleFilter;
