import React from "react";
import Label from "../../../form/Label";
import { SupervisorFiltersProps } from "@/services/types/SupervisorTypes";

const SupervisorFilters: React.FC<SupervisorFiltersProps> = ({
  filters,
  onFilterChange,
  statusOptions,
  clearIndividualFilter,
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <Label>Verification Status</Label>
        {/* Using a plain native select to avoid the shared Select component's
            disabled-placeholder conflicting with our empty "All Statuses" value */}
        <select
          value={filters.verificationStatus || ""}
          onChange={(e) => onFilterChange("verificationStatus", e.target.value || undefined)}
          className="mt-1 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filters.verificationStatus && (
        <button
          type="button"
          onClick={() => clearIndividualFilter("verificationStatus")}
          className="text-xs text-primary hover:underline"
        >
          Clear status filter
        </button>
      )}
    </div>
  );
};

export default SupervisorFilters;
