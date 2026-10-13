import React from "react";
import Label from "../../../form/Label";
import { SuperviseeFiltersProps } from "@/services/types/SuperviseeTypes";
import { EMAIL_VERIFIED_FILTER_OPTIONS } from "@/services/types/emailVerifiedFilter";

const SuperviseeFilters: React.FC<SuperviseeFiltersProps> = ({
  filters,
  onFilterChange,
  clearIndividualFilter,
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <Label>Email Verified</Label>
        <select
          value={filters.emailVerified || ""}
          onChange={(e) => onFilterChange("emailVerified", e.target.value || undefined)}
          className="mt-1 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">All</option>
          {EMAIL_VERIFIED_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filters.emailVerified && (
        <button
          type="button"
          onClick={() => clearIndividualFilter("emailVerified")}
          className="text-xs text-primary hover:underline"
        >
          Clear email verified filter
        </button>
      )}
    </div>
  );
};

export default SuperviseeFilters;
