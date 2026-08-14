import { FC } from "react";

import Select from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import { UseAppointmentsLogic } from "@/services/hooks/useAppointmentsLogic";

interface Props {
  data: UseAppointmentsLogic["data"];
  isLoading: UseAppointmentsLogic["isLoading"];
  pagination: UseAppointmentsLogic["pagination"];
  filters: UseAppointmentsLogic["filters"];
  itemsPerPageOptions: UseAppointmentsLogic["itemsPerPageOptions"];
  onFilterChange: UseAppointmentsLogic["onFilterChange"];
}

const AppointmentsTablePagination: FC<Props> = ({
  data,
  isLoading,
  pagination,
  filters,
  itemsPerPageOptions,
  onFilterChange,
}) => {
  if (data.length === 0 && !isLoading) {
    return null;
  }

  const limit = filters.limit || 50;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {(pagination.page - 1) * limit + 1} to {Math.min(pagination.page * limit, pagination.total)} of{" "}
          {pagination.total} results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
            <Select
              value={filters.limit?.toString() || "50"}
              onChange={(value: string) => onFilterChange("limit", value)}
              options={itemsPerPageOptions}
              className="w-auto min-w-[120px]"
            />
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => onFilterChange("page", page)}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentsTablePagination;
