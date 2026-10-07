"use client";

import React from "react";
import { CheckSquare, ExternalLink, Pencil, Square, Trash2, UserCheck } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { IngestRecord, IngestRecordsResponse } from "@/services/types/officeSpaceIngest";

interface IngestRecordsTableProps {
  data: IngestRecordsResponse | undefined;
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onView: (id: string) => void;
  onEdit: (record: IngestRecord) => void;
  onDelete: (record: IngestRecord) => void;
  onAssign: (ids: string[]) => void;
}

const formatSqft = (value: number | null) =>
  value === null ? "—" : `${value.toLocaleString()} SF`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const IngestRecordsTable: React.FC<IngestRecordsTableProps> = ({
  data,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
  onAssign,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  const records = data?.data ?? [];

  if (!records.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          No ingest records yet
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload or paste scraped listing data to get started.
        </p>
      </div>
    );
  }

  const allSelected = records.every((r) => selectedIds.includes(r.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="w-10 px-4 py-3">
              <button
                type="button"
                onClick={onToggleSelectAll}
                aria-label={allSelected ? "Deselect all" : "Select all"}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
            </th>
            {["Address", "Size", "Price", "Year", "Type", "Landlord", "Last seen"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {heading}
                </th>
              )
            )}
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const selected = selectedIds.includes(record.id);
            return (
              <tr
                key={record.id}
                className={`border-b border-gray-100 last:border-0 dark:border-gray-800/60 ${
                  selected ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(record.id)}
                    aria-label={selected ? "Deselect record" : "Select record"}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {selected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {record.address1 || "—"}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {record.address2 || "No location"}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatSqft(record.squareFeet)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {record.priceText || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {record.yearBuilt ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {record.propertyTypeHint || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {record.landlord?.businessName ? (
                    <span className="text-gray-700 dark:text-gray-300">
                      {record.landlord.businessName}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Unassigned</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(record.lastSeenAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(record.id)}
                      aria-label="View record"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(record)}
                      aria-label="Edit record"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAssign([record.id])}
                      aria-label="Assign landlord"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(record)}
                      aria-label="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IngestRecordsTable;