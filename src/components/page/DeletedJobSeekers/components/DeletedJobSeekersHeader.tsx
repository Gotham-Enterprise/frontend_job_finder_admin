import React, { useRef } from 'react';
import { TrashBinIcon, ArrowUpIcon } from '@/icons';
import Input from '../../../ui/input/Input';
import Button from '../../../ui/button/Button';
import FilterDropdown from '../../../ui/FilterDropdown';
import { SearchIcon, FilterIcon } from '../../../ui/icons';
import { DeletedJobSeekersHeaderProps } from '@/services/types/deletedJobSeekers';

interface DeletedJobSeekersHeaderWithDropdownProps extends DeletedJobSeekersHeaderProps {
  filterDropdownContent?: React.ReactNode;
}

const DeletedJobSeekersHeader: React.FC<DeletedJobSeekersHeaderWithDropdownProps> = ({
  totalCount,
  isPending,
  isLoading,
  searchInput,
  setSearchInput,
  isFilterOpen,
  setIsFilterOpen,
  onRefetch,
  onClearFilters,
  hasActiveFilters,
  filterDropdownContent,
}) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrashBinIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Deleted Job Seeker Accounts
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount || 0} deleted accounts
            {isPending && (
              <span className="ml-2 text-xs text-primary">
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
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${hasActiveFilters && !isFilterOpen ? 'ring-2 ring-primary/20' : ''}
            `}
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowUpIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Search by name, email, or admin..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {filterDropdownContent && (
        <FilterDropdown
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          triggerRef={filterButtonRef}
        >
          {filterDropdownContent}
        </FilterDropdown>
      )}
    </div>
  );
};

export default DeletedJobSeekersHeader;
