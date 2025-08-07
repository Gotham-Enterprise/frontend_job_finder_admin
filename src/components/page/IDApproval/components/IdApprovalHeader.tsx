import React from 'react'

import { SearchIcon } from '@/components/ui/icons';
import Input from '@/components/ui/input/Input';
import { UseIdApprovalLogic } from '@/services/types/idApproval';


interface Props {
  isLoading: UseIdApprovalLogic['isLoading'];
  totalCount: UseIdApprovalLogic['totalCount'];
}

const IdApprovalHeader: React.FC<Props> = ({ totalCount, isLoading }) => {
  const [searchInput, setSearchInput] = React.useState('');
  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unlock Request
          </h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount || 0} total unlock requests
            {isLoading && (
              <span className="ml-2 text-xs text-primary">
                Updating...
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by email..."
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
  )
}

export default IdApprovalHeader