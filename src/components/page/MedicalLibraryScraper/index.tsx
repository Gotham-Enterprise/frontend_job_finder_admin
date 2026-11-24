"use client";

import React, { useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { useActiveScraperRun, useScraperRuns, useTriggerScraperRun } from "@/services/hooks/useMedicalLibraryScraper";
import { IMPORT_SOURCES, ImportSource } from "@/services/api/medicalLibraryScraper";
import Pagination from "@/components/tables/Pagination";
import RunsTable from "./components/RunsTable";

const sourceFilterOptions: { value: ImportSource | ""; label: string }[] = [
  { value: "", label: "All sources" },
  ...IMPORT_SOURCES.map((s) => ({ value: s.value, label: s.label })),
];

const MedicalLibraryImports: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<ImportSource | "">("");
  const limit = 10;

  const { data, isLoading } = useScraperRuns({ page, limit, source: sourceFilter || undefined });
  const triggerMutation = useTriggerScraperRun();

  // Backed by the backend's own /scraper-runs/active endpoint, which runs
  // the exact same check adminTriggerScraperRun's 409 guard does — not
  // inferred from the run-history list's newest row. That was tried and is
  // genuinely unreliable: a bare CLI/scheduled run bypasses the guard
  // entirely, so it can start and finish *after* an earlier run gets stuck,
  // and a startedAt-sorted "check the top row" heuristic then ranks the
  // finished run above the still-stuck one and misses it — exactly what let
  // a zombie "running" row leave this button incorrectly enabled while the
  // backend kept 409ing every click. triggerMutation.isPending alone only
  // covers the ~instant POST itself, not the minutes-long run that follows.
  // One poll per source: the two imports may run at the same time.
  const { data: activeNami } = useActiveScraperRun("nami");
  const { data: activeMedlinePlus } = useActiveScraperRun("medlineplus");
  const activeBySource: Record<ImportSource, boolean> = {
    nami: Boolean(activeNami),
    medlineplus: Boolean(activeMedlinePlus),
  };
  const pendingSource = triggerMutation.isPending ? triggerMutation.variables : undefined;

  const runs = data?.data || [];
  const totalPages = data?.metaData?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Medical Library — Imports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Imported topics land as drafts. Review them under All Topics (filter by Source) and publish in bulk.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {IMPORT_SOURCES.map((source) => {
            const isActive = activeBySource[source.value];
            const isStarting = pendingSource === source.value;
            const disabled = triggerMutation.isPending || isActive;
            const Icon = source.value === "medlineplus" ? Download : RefreshCw;
            return (
              <div key={source.value} className="flex flex-col items-start gap-1">
                <button
                  onClick={() => triggerMutation.mutate(source.value)}
                  disabled={disabled}
                  title={isActive && !isStarting ? `A ${source.label} run is already pending or running` : source.description}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Icon className={`w-4 h-4 ${isStarting || isActive ? "animate-spin" : ""}`} />
                  {isActive && !isStarting ? `${source.label} run in progress…` : `Run ${source.label} import`}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 pl-1">Auto-runs {source.schedule}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="import-source-filter" className="text-xs text-gray-500 dark:text-gray-400">
          Source
        </label>
        <select
          id="import-source-filter"
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value as ImportSource | "");
            setPage(1);
          }}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {sourceFilterOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading runs…</div>
      ) : (
        <RunsTable runs={runs} />
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default MedicalLibraryImports;
