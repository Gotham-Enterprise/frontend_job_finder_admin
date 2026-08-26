"use client";

import React from "react";
import { RotateCw, Search, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { OfficeSpaceAdminHeaderProps } from "@/services/types/officeSpace";

const OfficeSpaceListingsHeader: React.FC<OfficeSpaceAdminHeaderProps> = ({
  totalCount,
  isLoading,
  searchInput,
  setSearchInput,
  isFilterOpen,
  setIsFilterOpen,
  onRefetch,
  clearAllFilters,
  hasActiveFilters,
  filterDropdownContent,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Office Space Listings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading ? "Loading..." : `${totalCount} total listings`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  /* search is handled by parent */
                }
              }}
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white w-64"
            />
          </div>

          <div className="relative">
            <Button
              variant={isFilterOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              startIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
            </Button>
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                {filterDropdownContent}
                {hasActiveFilters && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRefetch()}
            startIcon={<RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfficeSpaceListingsHeader;
