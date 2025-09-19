import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC, ReactNode, useEffect, useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import Input from "@/components/ui/input/Input";
import { UseIdApprovalLogic } from "@/services/types/idApproval";
import { StatusApproved, StatusDeclined } from "@/icons";

interface Props {
  filters: UseIdApprovalLogic["filters"];
  checkedItems: UseIdApprovalLogic["checkedItems"];
  isSaving: UseIdApprovalLogic["isSaving"];
  onFilterChange: UseIdApprovalLogic["onFilterChange"];
  onBatchUpdate: UseIdApprovalLogic["onBatchUpdate"];
}

const CustomTabTrigger: FC<{ value: string; children: ReactNode }> = ({ value, children }) => {
  return (
    <TabsTrigger value={value} activeClassName="text-green-700 border-b-3 border-green-700">
      {children}
    </TabsTrigger>
  );
};

const IdApprovalHeader: FC<Props> = ({ filters, checkedItems, onFilterChange, onBatchUpdate }) => {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange("search", searchInput.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onFilterChange]);

  const onChangeTab = (value: string) => {
    onFilterChange("status", value);
  };

  return (
    <div className="flex flex-col gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col flex-1 gap-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Unlock Request</h3>
          <Tabs className="w-full" value={filters.status} onValueChange={onChangeTab}>
            <TabsList className="mb-2">
              <CustomTabTrigger value="pending">For Review</CustomTabTrigger>
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

      <div className="flex flex-row justify-between gap-2">
        <div className="relative min-w-xl md:min-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`w-full pl-10 ${searchInput ? "pr-10" : ""}`}
          />
          {searchInput && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setSearchInput("")}
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
      {checkedItems.length > 0 && (
        <div className="flex flex-row gap-4">
          <button className="text-md text-gray-900 bg-gray-50 p-2 rounded-sm" onClick={() => onBatchUpdate("approved")}>
            <StatusApproved className="inline-block mr-1" width={12} height={12} />
            Approve
          </button>
          <button className="text-md text-gray-900 bg-gray-50 p-2 rounded-sm" onClick={() => onBatchUpdate("declined")}>
            <StatusDeclined className="inline-block mr-1" width={12} height={12} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default IdApprovalHeader;
