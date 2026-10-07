"use client";

import React from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import Button from "@/components/ui/button/Button";
import ErrorState from "@/components/common/ErrorState";
import { useIngestBatches } from "@/services/hooks/useOfficeSpaceIngest";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const IngestHistory: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const limit = 20;
  const { data, isLoading, error, refetch } = useIngestBatches(page, limit);

  if (error) {
    return (
      <ErrorState
        message={`Error loading import history: ${(error as Error).message}`}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  const batches = data?.data ?? [];

  if (!batches.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          No imports yet
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Each upload or paste is recorded here.
        </p>
      </div>
    );
  }

  const metaData = data?.metaData;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {[
                "When",
                "Source",
                "File",
                "Rows",
                "New",
                "Updated",
                "Duplicate",
                "Rejected",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr
                key={batch.id}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800/60"
              >
                <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(batch.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {batch.source}
                </td>
                <td className="max-w-xs px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{batch.fileName || "—"}</span>
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {batch.totalRows}
                </td>
                <td className="px-6 py-3 text-sm text-green-600 dark:text-green-400">
                  {batch.createdCount}
                </td>
                <td className="px-6 py-3 text-sm text-blue-600 dark:text-blue-400">
                  {batch.updatedCount}
                </td>
                <td className="px-6 py-3 text-sm text-amber-600 dark:text-amber-400">
                  {batch.skippedCount}
                </td>
                <td className="px-6 py-3 text-sm">
                  {batch.failedCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {batch.failedCount}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metaData && metaData.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {metaData.page} of {metaData.totalPages} ({metaData.totalCount} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!metaData.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!metaData.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngestHistory;