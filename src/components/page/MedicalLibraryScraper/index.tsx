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
          disabled={triggerMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${triggerMutation.isPending ? "animate-spin" : ""}`} />
          Trigger Re-scrape
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
