"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useOfficeSpaceListingsLogic } from "@/services/hooks/useOfficeSpaceListingsLogic";
import OfficeSpaceListingsHeader from "./OfficeSpaceListingsHeader";
import OfficeSpaceListingsTable from "./OfficeSpaceListingsTable";
import OfficeSpaceListingsPagination from "./OfficeSpaceListingsPagination";
import ErrorState from "@/components/common/ErrorState";
import { Building2 } from "lucide-react";

const OfficeSpaceListings: React.FC = () => {
  const {
    filters,
    searchInput,
    setSearchInput,
    isFilterOpen,
    setIsFilterOpen,
    isPending,
    data,
    isLoading,
    error,
    refetch,
    tableColumns,
    statusOptions,
    itemsPerPageOptions,
    filterChange,
    handleSearch,
    handleSearchKeyDown,
    initPageChange,
    getStatusBadge,
    viewDetails,
    handleStatusChange,
    clearAllFilters,
    clearIndividualFilter,
    hasActiveFilters,
  } = useOfficeSpaceListingsLogic();

  if (error && !isPending) {
    return (
      <ErrorState
        message={`Error loading office spaces: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <OfficeSpaceListingsHeader
        totalCount={data?.metaData?.totalCount || 0}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        onRefetch={refetch}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        filterDropdownContent={
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status || "all"}
                onChange={(e) =>
                  filterChange(
                    "status",
                    e.target.value === "all" ? undefined : e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <OfficeSpaceListingsTable
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        getStatusBadge={getStatusBadge}
        onViewDetails={viewDetails}
        onStatusChange={handleStatusChange}
      />

      <OfficeSpaceListingsPagination
        data={data}
        filters={filters}
        onPageChange={initPageChange}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={filterChange}
      />
    </div>
  );
};

export default OfficeSpaceListings;
