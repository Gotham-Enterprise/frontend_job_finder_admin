"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useActiveScraperRun, useScraperRuns, useTriggerScraperRun } from "@/services/hooks/useMedicalLibraryScraper";
import Pagination from "@/components/tables/Pagination";
import RunsTable from "./components/RunsTable";

const MedicalLibraryScraperRuns: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useScraperRuns({ page, limit });
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
  // covers the ~instant POST itself, not the ~2min scrape that follows —
  // without the active-run check too, the button re-enables the moment the
  // request settles, well before the resulting run actually finishes.
  const { data: activeRun } = useActiveScraperRun();
  const hasActiveRun = Boolean(activeRun);
  const triggerDisabled = triggerMutation.isPending || hasActiveRun;

  const runs = data?.data || [];
  const totalPages = data?.metaData?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">NAMI Import — Scraper Runs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Runs automatically every Friday at midnight. Trigger a re-scrape manually below.
          </p>
        </div>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerDisabled}
          title={hasActiveRun && !triggerMutation.isPending ? "A scrape is already pending or running" : undefined}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${triggerMutation.isPending ? "animate-spin" : ""}`} />
          {hasActiveRun && !triggerMutation.isPending ? "Scrape In Progress…" : "Trigger Re-scrape"}
        </button>
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

export default MedicalLibraryScraperRuns;
