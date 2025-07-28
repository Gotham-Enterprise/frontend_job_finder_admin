"use client"

import React, { useRef } from 'react';
import Input from '../../../../ui/input/Input';
import FilterDropdown from '../../../../ui/FilterDropdown';
import { SearchIcon } from '../../../../ui/icons';

interface ArchiveHeaderProps {
  totalCount?: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  onRefetch: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterDropdownContent: React.ReactNode;
  selectedPosts: string[];
  onBulkRestore: () => void;
  onClearSelection: () => void;
  isRestoring: boolean;
}

const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
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
  selectedPosts,
  onBulkRestore,
  onClearSelection,
  isRestoring,
}) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const selectedCount = selectedPosts.length;

  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Archived Blog Posts
          </h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount || 0} archived blog posts
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
              flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-sm border transition-colors
              ${isFilterOpen 
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M17.8571 2.87669C18.107 3.41157 18.0246 4.04275 17.6457 4.49555L12.4892 10.6589V15.3856C12.4892 16.0185 12.097 16.5852 11.5048 16.8082L9.56669 17.5381C9.09976 17.7139 8.57627 17.6494 8.16598 17.3655C7.75569 17.0816 7.51084 16.6144 7.51084 16.1155V10.6589L2.35425 4.49555C1.97542 4.04275 1.89302 3.41157 2.14291 2.87669C2.39279 2.34182 2.92977 2 3.52013 2H16.4799C17.0702 2 17.6072 2.34182 17.8571 2.87669ZM16.4799 3.52012H3.52013L8.91611 9.96964C8.99036 10.0584 9.03096 10.1698 9.03096 10.2848V16.1155L10.969 15.3856V10.2848C10.969 10.1698 11.0096 10.0584 11.0839 9.96964L16.4799 3.52012Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center font-medium">
                •
              </span>
            )}
          </button>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCount} selected
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onBulkRestore}
                  disabled={isRestoring}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRestoring ? 'Restoring...' : 'Restore'}
                </button>
                <button
                  onClick={onClearSelection}
                  className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search archived blog posts by title..."
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

      {filterDropdownContent && (
        <FilterDropdown
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          triggerRef={filterButtonRef}
          onClearAll={onClearFilters}
          hasActiveFilters={hasActiveFilters}
        >
          {filterDropdownContent}
        </FilterDropdown>
      )}
    </div>
  );
};

export default ArchiveHeader;
