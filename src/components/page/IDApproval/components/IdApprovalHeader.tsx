import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FC, ReactNode, useEffect, useState } from 'react';

import { SearchIcon } from '@/components/ui/icons';
import Input from '@/components/ui/input/Input';
import { UseIdApprovalLogic } from '@/services/types/idApproval';

interface Props {
  isLoading: UseIdApprovalLogic['isLoading'];
  totalCount: UseIdApprovalLogic['totalCount'];
  filters: UseIdApprovalLogic['filters'];
  onFilterChange: UseIdApprovalLogic['onFilterChange'];
}

const CustomTabTrigger: FC<{ value: string, children: ReactNode }> = ({ value, children,}) => {
  return (
    <TabsTrigger value={value} activeClassName="text-green-700 border-b-3 border-green-700">
      {children}
    </TabsTrigger>
  );
};

const IdApprovalHeader: FC<Props> = ({ totalCount, isLoading, filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange('search', searchInput.trim());
    }, 500)

    return () => clearTimeout(timeoutId);
  }, [searchInput, onFilterChange]);

  const onChangeTab = (value: string) => {
    onFilterChange('status', value);
  };

  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col flex-1 gap-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unlock Request
          </h3>
          <Tabs className="w-full" value={filters.status} onValueChange={onChangeTab}>
            <TabsList className="mb-2">
              <CustomTabTrigger value="pending" >Need to Review</CustomTabTrigger>
              <CustomTabTrigger value="declined">Declined</CustomTabTrigger>
              <CustomTabTrigger value="approved">Approved</CustomTabTrigger>
            </TabsList>
          </Tabs>
          {/*<p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount || 0} total unlock requests
            {isLoading && (
              <span className="ml-2 text-xs text-primary">
                Updating...
              </span>
            )}
          </p>*/}
        </div>
      </div>

      <div className="mt-4 flex flex-row justify-between gap-2">
        <div className="relative min-w-xl md:min-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by name or email"
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