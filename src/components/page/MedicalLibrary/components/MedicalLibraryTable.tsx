"use client";

import React from "react";
import { Table, TableBody, TableCell, TableRow, TableHeader } from "../../../ui/table";
import Checkbox from "../../../form/input/Checkbox";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { formatDate } from "@/services/utils/dateUtils";
import { MedicalLibraryTopic, getSourceLabel } from "@/services/api/medicalLibrary";

interface MedicalLibraryTableProps {
  data: any;
  isLoading: boolean;
  tableColumns: { key: string; label: string; className?: string }[];
  onEditTopic: (topic: MedicalLibraryTopic) => void;
  onDeleteTopic: (id: string, title: string) => void;
  selectedIds: string[];
  allOnPageSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAllOnPage: (checked: boolean) => void;
}

// One colour per import so a mixed list reads at a glance: NAMI and
// MedlinePlus rows are machine-maintained (re-imports can re-queue them),
// manual rows are not.
const sourceBadgeClass = (source: string | null | undefined) => {
  switch (source) {
    case "medlineplus":
      return "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200";
    case "nami":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  }
};

const MedicalLibraryTable: React.FC<MedicalLibraryTableProps> = ({
  data,
  isLoading,
  tableColumns,
  onEditTopic,
  onDeleteTopic,
  selectedIds,
  allOnPageSelected,
  onToggleSelect,
  onToggleSelectAllOnPage,
}) => {
  const hasRows = Boolean(data?.data?.length);

  return (
    <div className="relative">
      <div className="min-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-800">
              {tableColumns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`py-4 px-6 font-semibold text-gray-900 dark:text-white ${column.className || ""}`}
                >
                  {column.key === "select" ? (
                    <Checkbox
                      id="medical-library-select-page"
                      checked={allOnPageSelected}
                      disabled={!hasRows}
                      onChange={onToggleSelectAllOnPage}
                    />
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={tableColumns.length}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasRows ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={tableColumns.length}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No medical library topics found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((topic: MedicalLibraryTopic) => {
                const selected = selectedIds.includes(topic.id);
                return (
                  <TableRow
                    key={topic.id}
                    className={`border-b text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selected ? "bg-blue-50/60 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    {/* Select */}
                    <TableCell className="py-4 px-6 pr-0">
                      <Checkbox
                        id={`medical-library-select-${topic.id}`}
                        checked={selected}
                        onChange={() => onToggleSelect(topic.id)}
                      />
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white">{topic.title}</p>
                      {topic.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">
                          {topic.description}
                        </p>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-4 px-6">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md">
                        {topic.category}
                      </span>
                    </TableCell>

                    {/* Source */}
                    <TableCell className="py-4 px-6">
                      <span
                        title={topic.source ? "Imported — re-imports may update this topic" : "Hand-authored in this admin"}
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${sourceBadgeClass(topic.source)}`}
                      >
                        {getSourceLabel(topic.source)}
                      </span>
                    </TableCell>

                    {/* Slug */}
                    <TableCell className="py-4 px-6">
                      <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {topic.slug}
                      </code>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${
                            topic.status === "draft"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                              : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                          }`}
                        >
                          {topic.status === "draft" ? "Draft" : "Published"}
                        </span>
                        {topic.hasPendingChanges && (
                          <span
                            title="A re-import found changes on the source page — open this topic to see old vs new"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                          >
                            Needs Review
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Created At */}
                    <TableCell className="py-4 px-6">
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(topic.createdAt)}</p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditTopic(topic)}
                          title="Edit"
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => onDeleteTopic(topic.id, topic.title)}
                          title="Delete"
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MedicalLibraryTable;
