import React from 'react';
import { CloseLineIcon } from '@/icons';
import SearchableSelect from '../../../ui/SearchableSelect';
import Input from '../../../ui/input/Input';
import { DeletedJobSeekersFiltersProps } from '@/services/types/deletedJobSeekers';

// Simple Badge component
const Badge: React.FC<{ 
  variant?: 'primary' | 'secondary'; 
  className?: string; 
  children: React.ReactNode 
}> = ({ variant = 'primary', className = '', children }) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium';
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const DeletedJobSeekersFilters: React.FC<DeletedJobSeekersFiltersProps> = ({
  filters,
  onFilterChange,
  hasActiveFilters,
  clearIndividualFilter,
  adminUsers = [],
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'false', label: 'Deleted (Not Restored)' },
    { value: 'true', label: 'Restored' },
  ];

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.deletedBy) count++;
    if (filters.isRestored !== undefined) count++;
    if (filters.deletedAfter) count++;
    if (filters.deletedBefore) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Status
            </label>
            <div className="relative">
              <SearchableSelect
                value={filters.isRestored !== undefined ? filters.isRestored.toString() : ''}
                onChange={(value: string) => onFilterChange('isRestored', value === '' ? undefined : value === 'true')}
                options={statusOptions}
                placeholder="All Statuses"
                className="w-full"
              />
              {filters.isRestored !== undefined && (
                <button
                  onClick={() => clearIndividualFilter('isRestored')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Deleted By Filter */}
          {adminUsers.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Deleted By
              </label>
              <div className="relative">
                <SearchableSelect
                  value={filters.deletedBy || ''}
                  onChange={(value: string) => onFilterChange('deletedBy', value || undefined)}
                  options={[
                    { value: '', label: 'All Admins' },
                    ...adminUsers
                  ]}
                  placeholder="All Admins"
                  className="w-full"
                />
                {filters.deletedBy && (
                  <button
                    onClick={() => clearIndividualFilter('deletedBy')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <CloseLineIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Deleted After Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Deleted After
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formatDateForInput(filters.deletedAfter)}
                onChange={(e) => onFilterChange('deletedAfter', e.target.value || undefined)}
                className="w-full"
              />
              {filters.deletedAfter && (
                <button
                  onClick={() => clearIndividualFilter('deletedAfter')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Deleted Before Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Deleted Before
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formatDateForInput(filters.deletedBefore)}
                onChange={(e) => onFilterChange('deletedBefore', e.target.value || undefined)}
                className="w-full"
              />
              {filters.deletedBefore && (
                <button
                  onClick={() => clearIndividualFilter('deletedBefore')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 py-1">
              Active filters:
            </span>
            
            {filters.search && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Search: {filters.search}
                <button 
                  onClick={() => clearIndividualFilter('search')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.isRestored !== undefined && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Status: {filters.isRestored ? 'Restored' : 'Deleted'}
                <button 
                  onClick={() => clearIndividualFilter('isRestored')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.deletedBy && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Deleted by: {adminUsers.find(admin => admin.value === filters.deletedBy)?.label || filters.deletedBy}
                <button 
                  onClick={() => clearIndividualFilter('deletedBy')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.deletedAfter && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                After: {new Date(filters.deletedAfter).toLocaleDateString()}
                <button 
                  onClick={() => clearIndividualFilter('deletedAfter')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.deletedBefore && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Before: {new Date(filters.deletedBefore).toLocaleDateString()}
                <button 
                  onClick={() => clearIndividualFilter('deletedBefore')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <CloseLineIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletedJobSeekersFilters;
