"use client";
import React from 'react';
import PermissionWrapper from '@/components/common/PermissionWrapper';

interface OccupationsHeaderProps {
  totalCount?: number;
  isPending?: boolean;
  onCreateOccupation: () => void;
}

export const OccupationsHeader: React.FC<OccupationsHeaderProps> = ({
  totalCount = 0,
  isPending = false,
  onCreateOccupation,
}) => {
  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Occupations & Specializations
          </h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount} total occupation{totalCount === 1 ? '' : 's'}
            {isPending && (
              <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                Updating...
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionWrapper module="jobs" action="add">
            <button
              onClick={onCreateOccupation}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="whitespace-nowrap">Add Occupation</span>
            </button>
          </PermissionWrapper>
        </div>
      </div>
    </div>
  );
};

