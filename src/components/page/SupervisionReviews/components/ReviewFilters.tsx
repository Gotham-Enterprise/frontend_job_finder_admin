"use client";
import React from "react";
import Select from "../../../form/Select";
import { SupervisionReviewFilters } from "@/services/types/supervisionReview";

interface ReviewFiltersProps {
  filters: SupervisionReviewFilters;
  onFilterChange: (key: keyof SupervisionReviewFilters, value: unknown) => void;
  ratingOptions: { value: string; label: string }[];
  hasActiveFilters: boolean;
  clearIndividualFilter: (key: keyof SupervisionReviewFilters) => void;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFilterChange,
  ratingOptions,
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Min Rating
        </label>
        <Select
          value={filters.minRating?.toString() || ""}
          onChange={(value: string) =>
            onFilterChange("minRating", value ? parseInt(value, 10) : undefined)
          }
          options={[{ value: "", label: "Any" }, ...ratingOptions]}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Rating
        </label>
        <Select
          value={filters.maxRating?.toString() || ""}
          onChange={(value: string) =>
            onFilterChange("maxRating", value ? parseInt(value, 10) : undefined)
          }
          options={[{ value: "", label: "Any" }, ...ratingOptions]}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ReviewFilters;
