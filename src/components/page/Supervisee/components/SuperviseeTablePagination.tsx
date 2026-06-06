import React from "react";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import { SuperviseeTablePaginationProps } from "@/services/types/SuperviseeTypes";

const SuperviseeTablePagination: React.FC<SuperviseeTablePaginationProps> = ({
  data,
  filters,
  onPageChange,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  if (!data?.success || !data?.data?.length || !data?.metaData) {
    return null;
  }

  const { metaData } = data;
  const limit = filters.limit || 10;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {((metaData.page - 1) * limit) + 1} to{" "}
          {Math.min(metaData.page * limit, metaData.totalCount)} of {metaData.totalCount} results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Items per page:
            </span>
            <Select
              value={limit.toString()}
              onChange={(value: string) => onFilterChange("limit", parseInt(value))}
              options={itemsPerPageOptions}
              className="w-auto min-w-[120px]"
            />
          </div>
          <Pagination
            currentPage={metaData.page}
            totalPages={metaData.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SuperviseeTablePagination;
