import React from 'react';
import Button from '../../../../ui/button/Button';
import { ApplicantsHeaderProps } from '@/services/types/applicant';

const ApplicantsHeader: React.FC<ApplicantsHeaderProps> = ({
  totalCount,
  isPending = false,
  isLoading = false,
  searchInput,
  setSearchInput,
  onRefetch,
  isCollapsed = false,
  onToggleCollapse,
}) => {  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isCollapsed ? "Expand applicants section" : "Collapse applicants section"}
            >
              <svg 
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  isCollapsed ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Applicants
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isPending || isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-500"></div>
                  Loading...
                </span>
              ) : (
                `${totalCount} total applicants`
              )}
            </p>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {onRefetch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefetch}
              disabled={isPending || isLoading}
              className="flex items-center gap-2"
            >
              <svg 
                className={`w-4 h-4 ${isPending || isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantsHeader;
