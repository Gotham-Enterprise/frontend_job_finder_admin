import { FC, useEffect, useRef, useState } from "react";

import DatePicker from "@/components/form/date-picker";
import Select from "@/components/form/Select";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { FilterIcon, SearchIcon } from "@/components/ui/icons";
import Input from "@/components/ui/input/Input";
import { UseAppointmentsLogic } from "@/services/hooks/useAppointmentsLogic";

interface Props {
  totalCount: number;
  filters: UseAppointmentsLogic["filters"];
  statusOptions: UseAppointmentsLogic["statusOptions"];
  onFilterChange: UseAppointmentsLogic["onFilterChange"];
}

const AppointmentsHeader: FC<Props> = ({ totalCount, filters, statusOptions, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const hasActiveFilters = Boolean(filters.status || filters.dateFrom || filters.dateTo);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange("search", searchInput.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onFilterChange]);

  const onClearFilters = () => {
    onFilterChange("status", "");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");
  };

  return (
    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Appointments</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{totalCount || 0} total appointments</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors
              ${
                isFilterOpen
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              }
            `}
          >
            <FilterIcon />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center font-medium">
                {[filters.status, filters.dateFrom, filters.dateTo].filter(Boolean).length}
              </span>
            )}
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
            placeholder="Search by reference, name, email, or company"
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

      <FilterDropdown
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        triggerRef={filterButtonRef}
        onClearAll={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Select
              value={filters.status || ""}
              onChange={(value: string) => onFilterChange("status", value)}
              options={statusOptions}
              placeholder="All Statuses"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              {filters.dateFrom && (
                <button
                  onClick={() => onFilterChange("dateFrom", "")}
                  className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <DatePicker
              key={filters.dateFrom || "appointments-date-from"}
              id="appointments-date-from-filter"
              placeholder="Select start date"
              defaultDate={filters.dateFrom || undefined}
              onChange={(dates, currentDateString) => {
                onFilterChange("dateFrom", currentDateString || "");
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              {filters.dateTo && (
                <button
                  onClick={() => onFilterChange("dateTo", "")}
                  className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium cursor-pointer hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <DatePicker
              key={filters.dateTo || "appointments-date-to"}
              id="appointments-date-to-filter"
              placeholder="Select end date"
              defaultDate={filters.dateTo || undefined}
              onChange={(dates, currentDateString) => {
                onFilterChange("dateTo", currentDateString || "");
              }}
            />
          </div>
        </div>
      </FilterDropdown>
    </div>
  );
};

export default AppointmentsHeader;
