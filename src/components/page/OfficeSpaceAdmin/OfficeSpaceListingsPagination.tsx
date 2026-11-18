"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button/Button";
import {
  OfficeSpaceAdminListingsResponse,
  OfficeSpaceAdminFilters,
} from "@/services/types/officeSpace";

interface OfficeSpaceListingsPaginationProps {
  data: OfficeSpaceAdminListingsResponse | undefined;
  filters: OfficeSpaceAdminFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof OfficeSpaceAdminFilters, value: any) => void;
}

const OfficeSpaceListingsPagination: React.FC<
  OfficeSpaceListingsPaginationProps
> = ({ data, filters, onPageChange, itemsPerPageOptions, onFilterChange }) => {
  if (!data?.metaData || data.metaData.totalPages <= 1) return null;

  const { page, totalPages, totalCount } = data.metaData;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages} ({totalCount} total)
        </p>
        <select
          value={filters.limit?.toString() || "10"}
          onChange={(e) => onFilterChange("limit", parseInt(e.target.value))}
          className="text-sm border border-gray-300 rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          startIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          endIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default OfficeSpaceListingsPagination;
