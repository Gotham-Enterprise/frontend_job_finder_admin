"use client";

import React from "react";
import Input from "@/components/ui/input/Input";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

interface NewsletterSubscribersFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  occupationId: number | undefined;
  onOccupationChange: (v: number | undefined) => void;
  city: string;
  onCityChange: (v: string) => void;
  state: string;
  onStateChange: (v: string) => void;
  status: "active" | "unsubscribed" | undefined;
  onStatusChange: (v: "active" | "unsubscribed" | undefined) => void;
  onClear: () => void;
}

const NewsletterSubscribersFilters: React.FC<NewsletterSubscribersFiltersProps> = ({
  search,
  onSearchChange,
  occupationId,
  onOccupationChange,
  city,
  onCityChange,
  state,
  onStateChange,
  status,
  onStatusChange,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-60">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="w-44">
        <Select
          options={[
            { value: "", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "unsubscribed", label: "Unsubscribed" },
          ]}
          value={status || ""}
          onChange={(val) => onStatusChange((val || undefined) as "active" | "unsubscribed" | undefined)}
        />
      </div>

      <div className="w-40">
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="w-40">
        <Input
          placeholder="State"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Occupation filter: typed via occupationId, kept simple as a numeric input */}
      <div className="w-40">
        <Input
          type="number"
          min={1}
          placeholder="Occupation ID"
          value={occupationId ? String(occupationId) : ""}
          onChange={(e) =>
            onOccupationChange(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="w-full"
        />
      </div>

      <Button variant="outline" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
};

export default NewsletterSubscribersFilters;
