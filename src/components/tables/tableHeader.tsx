import React, { ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { TableHeader, TableRow, TableCell } from "../ui/table";

export interface TableHeaderColumn {
  key: string;
  label: string | ReactNode;
  className?: string;
  /**
   * When set, the column header becomes a sort toggle that calls `onSort`
   * with this key. The value is sent to the backend as `sortBy`.
   */
  sortKey?: string;
}

interface TableHeadingProps {
  columns: TableHeaderColumn[];
  className?: string;
  /** Currently active sort key (matches a column's `sortKey`). */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  /** Called with the column's `sortKey` when a sortable header is clicked. */
  onSort?: (sortKey: string) => void;
}

const TableHeading: React.FC<TableHeadingProps> = ({
  columns,
  className = "",
  sortBy,
  sortOrder,
  onSort,
}) => {
  return (
    <TableHeader className={className}>
      <TableRow className="border-b border-gray-200 dark:border-gray-800">
        {columns.map((column) => {
          const sortable = Boolean(column.sortKey && onSort);
          const isActive = sortable && sortBy === column.sortKey;

          return (
            <TableCell
              key={column.key}
              className={`py-4 px-6 font-semibold text-gray-900 dark:text-white text-sm ${column.className || ""}`}
            >
              {sortable ? (
                <button
                  type="button"
                  onClick={() => onSort!(column.sortKey!)}
                  title={
                    isActive
                      ? `Sorted ${sortOrder === "asc" ? "ascending" : "descending"} — click to toggle`
                      : "Sort"
                  }
                  className="flex items-center gap-1 font-semibold hover:text-brand-500 transition-colors"
                >
                  {column.label}
                  {isActive ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              ) : (
                column.label
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHeader>
  );
};

export default TableHeading;
