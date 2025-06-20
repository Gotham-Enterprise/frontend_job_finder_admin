import React from 'react';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import { TrashBinIcon, FunnelIcon } from '@/icons';
import { SearchIcon, PlusIcon } from '../../../ui/icons';
import { EmployerHeaderProps } from '@/services/types/EmployerTypes';

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
}) => {
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="dark:text-white"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            startIcon={<FunnelIcon className="dark:text-white" />}
          >
            Filters
          </Button>
          <Button
            variant="text-primary"
            size="sm"
            onClick={onClearFilters}
            startIcon={<TrashBinIcon />}
            disabled={!hasActiveFilters || isLoading}
          >
            Clear
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={onCreateJob}
            disabled={!selectedEmployerId || isCreatingJob}
            className={`whitespace-nowrap flex items-center gap-2 ${
              !selectedEmployerId || isCreatingJob
                ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500 border-gray-300' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
            }`}
          >{!isCreatingJob && (
              <PlusIcon className="flex-shrink-0" width={20} height={20} />
            )}
            {isCreatingJob ? 'Creating...' : 'Create new job'}
          </Button>
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
    </div>
  );
};

export default EmployerHeader;
