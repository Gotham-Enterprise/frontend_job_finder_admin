"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useScraperRuns, useTriggerScraperRun } from "@/services/hooks/useMedicalLibraryScraper";
import Pagination from "@/components/tables/Pagination";
import RunsTable from "./components/RunsTable";

const MedicalLibraryScraperRuns: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useScraperRuns({ page, limit });
  const triggerMutation = useTriggerScraperRun();

  // Independent of the table's own pagination — the trigger button is
  // always visible regardless of which page of run history is showing, so
  // its disabled state can't depend on `page`. Runs are sorted newest-first,
  // so this newest-row check always sees a pending/running run if one
  // exists, no matter what page the admin has the table scrolled to.
  // triggerMutation.isPending alone only covers the ~instant POST itself,
  // not the ~2min scrape that follows — without this, the button re-enables
  // the moment the request settles, well before the resulting run actually
  // finishes, and a second click fires an entirely separate scrape.
  const { data: latestRunData } = useScraperRuns({ page: 1, limit: 1 });
  const hasActiveRun = latestRunData?.data?.[0]
    ? latestRunData.data[0].status === "pending" || latestRunData.data[0].status === "running"
    : false;
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
