import React, { useCallback, useMemo } from "react";
import Label from "../../../form/Label";
import DatePicker from "@/components/form/date-picker";
import { SupervisorFiltersProps } from "@/services/types/SupervisorTypes";
import { SubscriptionDateFilterKey } from "@/services/types/supervisor";

const SUBSCRIPTION_DATE_RANGES: Array<{
  label: string;
  from: SubscriptionDateFilterKey;
  to: SubscriptionDateFilterKey;
}> = [
  { label: "Subscription Start", from: "subscriptionStartFrom", to: "subscriptionStartTo" },
  { label: "Subscription End", from: "subscriptionEndFrom", to: "subscriptionEndTo" },
];

interface SubscriptionDateRangeFieldProps {
  from: SubscriptionDateFilterKey;
  to: SubscriptionDateFilterKey;
  fromValue?: string;
  toValue?: string;
  onFilterChange: SupervisorFiltersProps["onFilterChange"];
}

/**
 * One flatpickr range input driving two filter keys. Filters update only once
 * both ends are picked (or the range is cleared); callbacks and defaultDate are
 * memoized because the shared DatePicker re-initializes when they change,
 * which would drop a half-picked range.
 */
const SubscriptionDateRangeField: React.FC<SubscriptionDateRangeFieldProps> = ({
  from,
  to,
  fromValue,
  toValue,
  onFilterChange,
}) => {
  const defaultDate = useMemo(
    () => [fromValue, toValue].filter((d): d is string => !!d),
    [fromValue, toValue]
  );

  const handleChange = useCallback(
    (selectedDates: Date[], _dateStr: string, instance: { formatDate: (d: Date, f: string) => string }) => {
      if (selectedDates.length === 1) return;
      const [start, end] = selectedDates.map((d) => instance.formatDate(d, "Y-m-d"));
      onFilterChange(from, start);
      onFilterChange(to, end);
    },
    [from, to, onFilterChange]
  );

  return (
    <DatePicker
      id={`supervisor-filter-${from}`}
      mode="range"
      placeholder="Select date range"
      defaultDate={defaultDate}
      onChange={handleChange}
    />
  );
};

const SupervisorFilters: React.FC<SupervisorFiltersProps> = ({
  filters,
  onFilterChange,
  statusOptions,
  typeOptions,
  subscriptionOptions,
  clearIndividualFilter,
}) => {
  const hasSubscriptionDateFilter = SUBSCRIPTION_DATE_RANGES.some(
    ({ from, to }) => filters[from] || filters[to]
  );

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

      <div>
        <Label>Supervisor Type</Label>
        <select
          value={filters.supervisorType || ""}
          onChange={(e) => onFilterChange("supervisorType", e.target.value || undefined)}
          className="mt-1 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">All Types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filters.supervisorType && (
        <button
          type="button"
          onClick={() => clearIndividualFilter("supervisorType")}
          className="text-xs text-primary hover:underline"
        >
          Clear type filter
        </button>
      )}

      <div>
        <Label>Subscription</Label>
        <select
          value={filters.subscriptionType || ""}
          onChange={(e) => onFilterChange("subscriptionType", e.target.value || undefined)}
          className="mt-1 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">All Subscriptions</option>
          {subscriptionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filters.subscriptionType && (
        <button
          type="button"
          onClick={() => clearIndividualFilter("subscriptionType")}
          className="text-xs text-primary hover:underline"
        >
          Clear subscription filter
        </button>
      )}

      {SUBSCRIPTION_DATE_RANGES.map(({ label, from, to }) => (
        <div key={label}>
          <Label>{label}</Label>
          <div className="mt-1">
            {/* Keyed by value so the uncontrolled flatpickr input resets on Clear */}
            <SubscriptionDateRangeField
              key={`${from}-${filters[from] || ""}-${filters[to] || ""}`}
              from={from}
              to={to}
              fromValue={filters[from]}
              toValue={filters[to]}
              onFilterChange={onFilterChange}
            />
          </div>
        </div>
      ))}

      {hasSubscriptionDateFilter && (
        <button
          type="button"
          onClick={() => clearIndividualFilter("subscriptionDates")}
          className="text-xs text-primary hover:underline"
        >
          Clear subscription dates
        </button>
      )}
    </div>
  );
};

export default SupervisorFilters;
