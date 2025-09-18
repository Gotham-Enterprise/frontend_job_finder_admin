import React, { useRef } from 'react';
import Input from '../../../ui/input/Input';
import FilterDropdown from '../../../ui/FilterDropdown';
import { SearchIcon, PlusIcon, FilterIcon } from '../../../ui/icons';
import { EmployerHeaderProps } from '@/services/types/EmployerTypes';
import PermissionWrapper from '@/components/common/PermissionWrapper';

const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  totalCount,
  isPending,
  isLoading,
  searchInput,
  setSearchInput,
  isFilterOpen,
  setIsFilterOpen,
  onRefetch,
  selectedEmployerId,
  onCreateJob,
  isCreatingJob,
  onClearFilters,
  hasActiveFilters,
  filterContent,
}) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Employers
          </h3>
          <p className="text-sm text-gray-500 text-gray-400 mt-1 dark:text-white">
            {totalCount || 0} total employers
            {isPending && (
              <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                Updating...
              </span>
            )}
          </p>
        </div>          
        <div className="flex items-center gap-2">
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors
              ${isFilterOpen 
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <FilterIcon />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center font-medium">
              </span>
            )}
          </button>
          
          <PermissionWrapper module="employers" action="add">
            <button
              onClick={onCreateJob}
              disabled={!selectedEmployerId || isCreatingJob}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                ${!selectedEmployerId || isCreatingJob
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `}
            >
              {!isCreatingJob && (
                <PlusIcon className="flex-shrink-0" width={16} height={16} />
              )}
              <span className="whitespace-nowrap">
                {isCreatingJob ? 'Creating...' : 'Create new job'}
              </span>
            </button>
          </PermissionWrapper>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search employers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`w-full pl-10 ${searchInput ? 'pr-10' : ''}`}
          />
          {searchInput && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {filterContent && (
        <FilterDropdown
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          triggerRef={filterButtonRef}
          onClearAll={onClearFilters}
          hasActiveFilters={hasActiveFilters}
        >
          {filterContent}
        </FilterDropdown>
      )}
    </div>
  );
};

export default EmployerHeader;
