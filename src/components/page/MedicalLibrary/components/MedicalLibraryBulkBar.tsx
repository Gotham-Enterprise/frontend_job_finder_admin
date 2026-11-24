"use client";

import React from "react";
import Button from "../../../ui/button/Button";
import { MedicalLibraryStatus } from "@/services/api/medicalLibrary";

interface MedicalLibraryBulkBarProps {
  selectedCount: number;
  isBusy: boolean;
  onClearSelection: () => void;
  onBulkStatus: (status: MedicalLibraryStatus) => void;
}

/**
 * Bulk actions for the rows checked on the current page. Publishing a whole
 * import's drafts in one go lives on the Imports page instead.
 */
const MedicalLibraryBulkBar: React.FC<MedicalLibraryBulkBarProps> = ({
  selectedCount,
  isBusy,
  onClearSelection,
  onBulkStatus,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
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
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" disabled={isBusy} onClick={() => onBulkStatus("published")}>
            Publish selected
          </Button>
          <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onBulkStatus("draft")}>
            Set selected to draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicalLibraryBulkBar;
