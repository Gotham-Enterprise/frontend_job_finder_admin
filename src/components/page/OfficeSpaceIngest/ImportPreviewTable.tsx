"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, CopyMinus, MinusCircle, PlusCircle, RefreshCw } from "lucide-react";
import { IngestImportResult } from "@/services/types/officeSpaceIngest";

interface ImportPreviewTableProps {
  result: IngestImportResult;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}> = ({ label, value, icon, tone }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
    <span className={tone}>{icon}</span>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

/**
 * Shown for both the dry-run preview and the committed result — the payload is
 * the same shape, so one component covers both.
 */
const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ result }) => {
  return (
    <div className="space-y-5">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          result.dryRun
            ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
            : "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
        }`}
      >
        {result.dryRun ? (
          <RefreshCw className="h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        )}
        <span>
          {result.dryRun
            ? "Preview only — nothing has been saved yet."
            : "Import complete."}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total rows"
          value={result.totalRows}
          icon={<MinusCircle className="h-5 w-5" />}
          tone="text-gray-400"
        />
        <StatCard
          label="New"
          value={result.created}
          icon={<PlusCircle className="h-5 w-5" />}
          tone="text-green-500"
        />
        <StatCard
          label="Updated"
          value={result.updated}
          icon={<RefreshCw className="h-5 w-5" />}
          tone="text-blue-500"
        />
        <StatCard
          label="Duplicate"
          value={result.skipped}
          icon={<CopyMinus className="h-5 w-5" />}
          tone={result.skipped > 0 ? "text-amber-500" : "text-gray-400"}
        />
        <StatCard
          label="Rejected"
          value={result.failed}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={result.failed > 0 ? "text-red-500" : "text-gray-400"}
        />
      </div>

      {result.skipped > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {result.skipped.toLocaleString()} row
          {result.skipped === 1 ? " was" : "s were"} a repeat of a listing already in
          this file. The last version of each was kept.
        </p>
      )}

      {result.errors.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Rejected rows ({result.errors.length})
          </h3>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-white/[0.06]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Row
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Field
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((error, i) => (
                  <tr
                    key={`${error.row}-${i}`}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800/60"
                  >
                    <td className="px-4 py-2 align-top font-mono text-xs text-gray-600 dark:text-gray-400">
                      {error.row}
                    </td>
                    <td className="px-4 py-2 align-top font-mono text-xs text-gray-600 dark:text-gray-400">
                      {error.field || "—"}
                    </td>
                    <td className="px-4 py-2 align-top text-red-600 dark:text-red-400">
                      {error.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPreviewTable;