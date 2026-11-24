"use client";

import React from "react";
import Button from "../../../ui/button/Button";
import { MedicalLibraryStatus } from "@/services/api/medicalLibrary";
import type { BulkStatusScope } from "@/services/hooks/useMedicalLibraryLogic";

interface MedicalLibraryBulkBarProps {
  selectedCount: number;
  /** Total rows matching the active filter (the list's totalCount). */
  matchingCount: number;
  /** Human description of the active filter, empty when none is set. */
  activeFilterDescription: string;
  isBusy: boolean;
  onClearSelection: () => void;
  onBulkStatus: (status: MedicalLibraryStatus, scope: BulkStatusScope) => void;
}

/**
 * Two bulk scopes, shown together when both apply:
 *   - "selected": the checked rows on this page
 *   - "filter":   every row matching the current Source / Status / Category /
 *                 search filter, across all pages — the way ~700 imported
 *                 MedlinePlus drafts get published after a sample review
 *                 without paging through them.
 * Nothing renders when there is neither a selection nor an active filter.
 */
const MedicalLibraryBulkBar: React.FC<MedicalLibraryBulkBarProps> = ({
  selectedCount,
  matchingCount,
  activeFilterDescription,
  isBusy,
  onClearSelection,
  onBulkStatus,
}) => {
  const hasSelection = selectedCount > 0;
  const hasFilter = Boolean(activeFilterDescription) && matchingCount > 0;

  if (!hasSelection && !hasFilter) return null;

  return (
    <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {hasSelection ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedCount} topic{selectedCount === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sm text-gray-600 underline hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Clear selection
            </button>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={isBusy} onClick={() => onBulkStatus("published", "selected")}>
                Publish selected
              </Button>
              <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onBulkStatus("draft", "selected")}>
                Set selected to draft
              </Button>
            </div>
          </div>
        ) : (
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Showing {matchingCount} topic{matchingCount === 1 ? "" : "s"} matching {activeFilterDescription}
          </span>
        )}

        {hasFilter && (
          <div
            className="flex flex-wrap items-center gap-2 md:justify-end"
            title={`Applies to every topic matching ${activeFilterDescription}, across all pages`}
          >
            <Button
              size="sm"
              variant={hasSelection ? "outline" : "default"}
              disabled={isBusy}
              onClick={() => onBulkStatus("published", "filter")}
            >
              Publish all {matchingCount} matching
            </Button>
            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onBulkStatus("draft", "filter")}>
              Set all {matchingCount} to draft
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalLibraryBulkBar;
