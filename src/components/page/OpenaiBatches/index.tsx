"use client";
import React, { useState } from "react";
import { useOpenaiBatches } from "@/services/hooks/useOpenaiBatch";
import type { OpenAiBatchJob } from "@/services/api/openaiBatch";
import { BoltIcon } from "@/icons";
import ErrorState from "../../common/ErrorState";

const STATUS_BADGES: Record<string, string> = {
  validating: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  finalizing: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  expired: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400",
  cancelled: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
};

const OpenaiBatchesData: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useOpenaiBatches(
    { page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) },
    { refetchInterval: 30000 }
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (error) {
    return (
      <ErrorState
        message={`Error loading AI batches: ${error.message}`}
        onRetry={() => refetch()}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            AI Batch Monitoring
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            OpenAI batch jobs and Google Indexing API submissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
          >
            <option value="">All statuses</option>
            <option value="validating">Validating</option>
            <option value="in_progress">In Progress</option>
            <option value="finalizing">Finalizing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            <BoltIcon className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-y border-gray-100 dark:border-gray-800">
            <tr className="text-xs font-medium text-gray-500 dark:text-gray-400">
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Batch ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Records</th>
              <th className="px-4 py-3 text-right">Indexed</th>
              <th className="px-4 py-3 text-right">Failed</th>
              <th className="px-4 py-3 text-center">Quota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                  No batches found
                </td>
              </tr>
            ) : (
              data?.data?.map((batch: OpenAiBatchJob) => {
                const idx = batch.indexingMetadata;
                const isExpanded = expandedId === batch.id;
                return (
                  <React.Fragment key={batch.id}>
                    <tr
                      onClick={() => toggleExpand(batch.id)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {isExpanded ? "−" : "+"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                        {new Date(batch.createdAt).toLocaleDateString()}{" "}
                        <span className="text-gray-400">
                          {new Date(batch.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                        {batch.batchId.slice(0, 18)}…
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            STATUS_BADGES[batch.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-800 dark:text-white/90">
                        {batch.recordCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-800 dark:text-white/90">
                        {idx ? idx.succeeded : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        {idx && idx.failed > 0 ? (
                          <span className="text-red-600 dark:text-red-400">{idx.failed}</span>
                        ) : idx ? (
                          <span className="text-gray-600 dark:text-gray-400">0</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {idx?.quotaExceeded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
                            ⚠ Exceeded
                          </span>
                        ) : idx ? (
                          <span className="text-xs text-green-600 dark:text-green-400">OK</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-white/[0.02]">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">OpenAI Batch ID:</span>
                              <span className="ml-2 font-mono text-gray-800 dark:text-white/90">{batch.batchId}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Status:</span>
                              <span className="ml-2 capitalize text-gray-800 dark:text-white/90">{batch.status}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                              <span className="ml-2 text-gray-800 dark:text-white/90">
                                {new Date(batch.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Completed:</span>
                              <span className="ml-2 text-gray-800 dark:text-white/90">
                                {batch.completedAt ? new Date(batch.completedAt).toLocaleString() : "—"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Records:</span>
                              <span className="ml-2 text-gray-800 dark:text-white/90">{batch.recordCount}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Error:</span>
                              <span className="ml-2 text-gray-800 dark:text-white/90">
                                {batch.errorMessage || "None"}
                              </span>
                            </div>

                            {idx && (
                              <>
                                <div className="col-span-2 mt-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                                  <span className="font-semibold text-gray-800 dark:text-white/90">
                                    Google Indexing
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500 dark:text-gray-400">Submitted:</span>
                                  <span className="ml-2 text-gray-800 dark:text-white/90">{idx.submitted}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500 dark:text-gray-400">Succeeded:</span>
                                  <span className="ml-2 text-green-600 dark:text-green-400">{idx.succeeded}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500 dark:text-gray-400">Failed:</span>
                                  <span className="ml-2 text-red-600 dark:text-red-400">
                                    {idx.failed}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500 dark:text-gray-400">Quota Exceeded:</span>
                                  <span className="ml-2 text-gray-800 dark:text-white/90">
                                    {idx.quotaExceeded ? "Yes" : "No"}
                                  </span>
                                </div>
                                {idx.errors?.length > 0 && (
                                  <div className="col-span-2 mt-2">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">Errors:</span>
                                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-red-600 dark:text-red-400">
                                      {idx.errors.map((err, i) => (
                                        <li key={i} className="break-all font-mono">{err}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              disabled={page >= (data.pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenaiBatchesData;
