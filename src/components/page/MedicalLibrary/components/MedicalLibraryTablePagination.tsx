"use client";

import React from "react";
import { MedicalLibraryFilters } from "@/services/api/medicalLibrary";

interface MedicalLibraryTablePaginationProps {
  data: any;
  filters: MedicalLibraryFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: { value: string; label: string }[];
  onFilterChange: (key: keyof MedicalLibraryFilters, value: any) => void;
}

const MedicalLibraryTablePagination: React.FC<MedicalLibraryTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  const totalPages = data?.metaData?.totalPages || 1;
  const currentPage = filters.page || 1;
  const totalCount = data?.metaData?.totalCount || 0;
  const limit = filters.limit || 10;
  const start = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  if (totalCount === 0) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-800 dark:text-white">
            {start}–{end}
          </span>{" "}
          of <span className="font-medium text-gray-800 dark:text-white">{totalCount}</span> topics
        </p>
        <select
          value={limit}
          onChange={(e) => onFilterChange("limit", parseInt(e.target.value))}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((item, i) =>
            item === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  item === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {item}
              </button>
            )
          )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MedicalLibraryTablePagination;
