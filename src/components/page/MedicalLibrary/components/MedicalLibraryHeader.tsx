"use client";

import React from "react";
import Input from "../../../ui/input/Input";
import { SearchIcon } from "../../../ui/icons";

interface MedicalLibraryHeaderProps {
  totalCount: number;
  isPending: boolean;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (val: string) => void;
  onRefetch: () => void;
  onAddNew: () => void;
}

const MedicalLibraryHeader: React.FC<MedicalLibraryHeaderProps> = ({
  totalCount,
  isPending,
  isLoading,
  searchInput,
  setSearchInput,
  onRefetch,
  onAddNew,
}) => {
  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Medical Library</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {totalCount || 0} total topics
            {isPending && <span className="ml-2 text-xs text-primary">Updating...</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-sm border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="whitespace-nowrap">Add New</span>
          </button>

          <button
            onClick={onRefetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-sm border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search topics by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`w-full pl-10 ${searchInput ? "pr-10" : ""}`}
          />
          {searchInput && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

export default MedicalLibraryHeader;
