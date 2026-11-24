"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Download, CheckCircle2 } from "lucide-react";
import { useActiveScraperRun, useScraperRuns, useTriggerScraperRun } from "@/services/hooks/useMedicalLibraryScraper";
import {
  medicalLibraryQueryKeys,
  useBulkUpdateMedicalLibraryStatus,
  useMedicalLibraryTopics,
} from "@/services/hooks/useMedicalLibrary";
import { IMPORT_SOURCES, ImportSource } from "@/services/api/medicalLibraryScraper";
import { useConfirmation } from "@/hooks/useConfirmation";
import { showToast } from "@/services/utils/toast";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Pagination from "@/components/tables/Pagination";
import RunsTable from "./components/RunsTable";

const sourceFilterOptions: { value: ImportSource | ""; label: string }[] = [
  { value: "", label: "All sources" },
  ...IMPORT_SOURCES.map((s) => ({ value: s.value, label: s.label })),
];

/**
 * One-click publish for an import's drafts. Counts come from the topics list
 * endpoint (limit 1, we only need totalCount); the publish itself is the
 * same filter-scoped bulk-status call the All Topics page uses, so the two
 * can never disagree about which rows are affected.
 */
const PendingDraftsRow: React.FC<{
  source: ImportSource;
  label: string;
  onPublish: (source: ImportSource, label: string, count: number) => void;
  isPublishing: boolean;
}> = ({ source, label, onPublish, isPublishing }) => {
  const { data } = useMedicalLibraryTopics({ source, status: "draft", limit: 1, page: 1 });
  const count = data?.metaData?.totalCount || 0;
  if (count === 0) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
      <p className="text-sm text-amber-900 dark:text-amber-200">
        <span className="font-semibold">{count.toLocaleString()}</span> {label} topic{count === 1 ? "" : "s"} waiting
        in draft. Spot-check a few, then publish them all.
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/medical-library?source=${source}&status=draft`}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-500/10"
        >
          Review drafts
        </Link>
        <button
          type="button"
          onClick={() => onPublish(source, label, count)}
          disabled={isPublishing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          Publish all {count.toLocaleString()}
        </button>
      </div>
    </div>
  );
};

const MedicalLibraryImports: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<ImportSource | "">("");
  const limit = 10;

  const { data, isLoading } = useScraperRuns({ page, limit, source: sourceFilter || undefined });
  const triggerMutation = useTriggerScraperRun();
  const bulkStatus = useBulkUpdateMedicalLibraryStatus();
  const confirmation = useConfirmation();

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

  // A run that just finished created or re-queued topics. The draft counts
  // above and the All Topics list are separate cached queries that nothing
  // else would refresh, so when a run leaves the pending/running set,
  // invalidate every medical-library query.
  const queryClient = useQueryClient();
  const previousActiveIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const activeIds = new Set(runs.filter((r) => r.status === "pending" || r.status === "running").map((r) => r.id));
    const finished = [...previousActiveIds.current].some((id) => !activeIds.has(id));
    previousActiveIds.current = activeIds;
    if (finished) queryClient.invalidateQueries({ queryKey: medicalLibraryQueryKeys.all });
  }, [runs, queryClient]);

  const handlePublishDrafts = async (source: ImportSource, label: string, count: number) => {
    const confirmed = await confirmation.confirm({
      title: `Publish ${count.toLocaleString()} ${label} draft${count === 1 ? "" : "s"}?`,
      message: `All ${label} topics currently in draft go live on the public Medical Library immediately, and any pending re-import review on them is cleared. Topics you already published or hand-authored are not touched.`,
      confirmText: `Publish ${count.toLocaleString()}`,
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    bulkStatus.mutate(
      { status: "published", filter: { source, status: "draft" } },
      {
        onSuccess: (res) => {
          const n = res?.data?.count ?? count;
          showToast.success("Published", `${n.toLocaleString()} ${label} topic${n === 1 ? "" : "s"} are now live.`);
        },
        onError: (err: any) => {
          showToast.error("Publish failed", err?.message || "Bulk publish failed");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Medical Library — Imports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Imported topics land as drafts. Publish them below, or review them under All Topics first.
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
                  {/* A refresh arrow reads as "spinning"; a download arrow does not, so it pulses instead. */}
                  <Icon
                    className={`w-4 h-4 ${
                      isStarting || isActive ? (Icon === RefreshCw ? "animate-spin" : "animate-pulse") : ""
                    }`}
                  />
                  {isActive && !isStarting ? `${source.label} run in progress…` : `Run ${source.label} import`}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 pl-1">Auto-runs {source.schedule}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {IMPORT_SOURCES.map((source) => (
          <PendingDraftsRow
            key={source.value}
            source={source.value}
            label={source.label}
            onPublish={handlePublishDrafts}
            isPublishing={bulkStatus.isPending}
          />
        ))}
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

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.onClose}
        onConfirm={confirmation.onConfirm}
        onCancel={confirmation.onCancel}
        title={confirmation.config?.title || ""}
        message={confirmation.config?.message || ""}
        confirmText={confirmation.config?.confirmText}
        cancelText={confirmation.config?.cancelText}
        isLoading={bulkStatus.isPending}
      />
    </div>
  );
};

export default MedicalLibraryImports;
