"use client";
import React from 'react';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';

interface OccupationsFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A to Z)' },
  { value: '_count.jobPost', label: 'Most Job Postings' },
];

export const OccupationsFilters: React.FC<OccupationsFiltersProps> = ({
  searchInput,
  setSearchInput,
  sortBy,
  setSortBy,
  onClear,
  hasActiveFilters,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search occupations or specializations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

          {/* Sort & Clear */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Sort by:
              </span>
              <Select
                value={sortBy}
                onChange={(val: string) => setSortBy(val)}
                options={SORT_OPTIONS}
                className="w-44 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-xs text-primary hover:underline font-medium whitespace-nowrap px-2 py-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
      );
};

