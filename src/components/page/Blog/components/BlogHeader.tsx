"use client"

import React, { useRef } from 'react';
import Button from '../../../ui/button/Button';
import Input from '../../../ui/input/Input';
import FilterDropdown from '../../../ui/FilterDropdown';
import { DownloadIcon, FunnelIcon, PlusIcon } from '@/icons';
import { SearchIcon } from '../../../ui/icons';
import { BlogHeaderProps } from '@/services/types/BlogTypes';

const BlogHeader: React.FC<BlogHeaderProps> = ({
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
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            All Blog Posts
          </h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount || 0} total blog posts
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
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <FunnelIcon />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center font-medium">
              </span>
            )}
          </button>
          <Button
            variant="text-primary"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => window.location.href = '/admin/blog/add-new'}
            startIcon={<PlusIcon />}
          >
            Add New
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
            placeholder="Search blog posts by title..."
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

export default BlogHeader;
