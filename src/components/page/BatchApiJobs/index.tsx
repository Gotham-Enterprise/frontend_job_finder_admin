"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Pagination from "../../tables/Pagination";
import { batchApiJobsApi, BatchApiJob, BatchApiJobsResponse } from "@/services/api/batchApiJobs";
import { formatDate } from "@/services/utils/dateUtils";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://gothamenterprisesltd.com";
const LIMIT = 20;

function jobFrontendUrl(job: BatchApiJob): string {
  return `${FRONTEND_URL}/job/all-jobs/${job.id}`;
}

const BatchApiJobs: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [data, setData] = useState<BatchApiJobsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await batchApiJobsApi.getJobs({ page, limit: LIMIT });
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load batch API jobs");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const jobs = data?.data || [];
  const meta = data?.metaData;

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Batch API Jobs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Jobs created by OpenAI Batch API
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-800">
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                AI Title
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Original Title
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Batch ID
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tokens
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </TableCell>
              <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                View
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={7}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={7}>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                    <button
                      onClick={fetchJobs}
                      className="text-sm text-brand-500 hover:text-brand-600 underline"
                    >
                      Retry
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={7}>
                  <p className="text-gray-500 dark:text-gray-400">No batch API jobs found</p>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job: BatchApiJob) => (
                <TableRow
                  key={job.id}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.title}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.originalPost?.title || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(job.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 max-w-[120px] truncate" title={job.batch?.batchId || ""}>
                      {job.batch?.batchId ? `${job.batch.batchId.slice(0, 12)}...` : "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {job.usage ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="tabular-nums">{(job.usage.promptTokens || 0).toLocaleString()}</span> in /{" "}
                        <span className="tabular-nums">{(job.usage.completionTokens || 0).toLocaleString()}</span> out
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="light"
                      color={
                        job.batch?.status === "completed"
                          ? "success"
                          : job.batch?.status === "failed" || job.batch?.status === "expired" || job.batch?.status === "cancelled"
                            ? "error"
                            : job.batch?.status === "in_progress" || job.batch?.status === "validating" || job.batch?.status === "finalizing"
                              ? "warning"
                              : "info"
                      }
                    >
                      {job.batch?.status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <a
                      href={jobFrontendUrl(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={`View on site: ${job.title}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {meta.page} of {meta.totalPages} ({meta.totalCount.toLocaleString()} total)
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default BatchApiJobs;
