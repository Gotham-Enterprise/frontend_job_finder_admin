"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Pagination from "../../tables/Pagination";
import { indexingLogsApi, IndexingLog, IndexingLogsResponse, IndexingLogSummary } from "@/services/api/indexingLogs";
import { formatDate } from "@/services/utils/dateUtils";

const LIMIT = 25;

const SOURCE_LABELS: Record<string, string> = {
  google_indexing_api: "Google Indexing API",
  indexnow: "IndexNow",
  revalidation: "Sitemap Revalidation",
};

const STATUS_BADGE_COLORS: Record<string, "success" | "warning" | "error" | "info"> = {
  success: "success",
  partial: "warning",
  failed: "error",
  quota_exhausted: "warning",
  skipped: "info",
};

function SummaryCard({ title, data }: { title: string; data: { submitted?: number; succeeded?: number; failed?: number; count?: number } }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      {"count" in data && data.count !== undefined ? (
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.count}</div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Submitted</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.submitted || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">Succeeded</span>
            <span className="font-medium text-green-600 dark:text-green-400">{data.succeeded || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-600 dark:text-red-400">Failed</span>
            <span className="font-medium text-red-600 dark:text-red-400">{data.failed || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const IndexingLogs: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [data, setData] = useState<IndexingLogsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: Record<string, any> = { page, limit: LIMIT };
      if (sourceFilter) filters.source = sourceFilter;
      if (statusFilter) filters.status = statusFilter;
      const res = await indexingLogsApi.getLogs(filters);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load indexing logs");
    } finally {
      setIsLoading(false);
    }
  }, [page, sourceFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logs = data?.data?.logs || [];
  const summary = data?.data?.summary;
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Indexing Logs</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor search engine indexing activity across Google Indexing API, IndexNow, and sitemap revalidation
        </p>
      </div>

      {summary && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Summary</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard title="Google Indexing API" data={summary.today.googleIndexingApi} />
            <SummaryCard title="IndexNow" data={summary.today.indexnow} />
            <SummaryCard title="Sitemap Revalidation" data={{ count: summary.today.revalidation.count }} />
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              All-time totals
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard title="Google Indexing API (All Time)" data={summary.totalAllTime.googleIndexingApi} />
              <SummaryCard title="IndexNow (All Time)" data={summary.totalAllTime.indexnow} />
              <SummaryCard title="Sitemap Revalidation (All Time)" data={{ count: summary.totalAllTime.revalidation.count }} />
            </div>
          </details>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Sources</option>
          <option value="google_indexing_api">Google Indexing API</option>
          <option value="indexnow">IndexNow</option>
          <option value="revalidation">Sitemap Revalidation</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="partial">Partial</option>
          <option value="failed">Failed</option>
          <option value="quota_exhausted">Quota Exhausted</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Date/Time</TableCell>
              <TableCell isHeader>Source</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Total URLs</TableCell>
              <TableCell isHeader>Succeeded</TableCell>
              <TableCell isHeader>Failed</TableCell>
              <TableCell isHeader>Errors</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No indexing logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: IndexingLog) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {SOURCE_LABELS[log.source] || log.source}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={STATUS_BADGE_COLORS[log.status] || "info"}
                      size="sm"
                    >
                      {log.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                    {log.urlsTotal}
                  </TableCell>
                  <TableCell className="text-sm text-green-600 dark:text-green-400">
                    {log.urlsSucceeded}
                  </TableCell>
                  <TableCell className="text-sm text-red-600 dark:text-red-400">
                    {log.urlsFailed}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {log.errors && log.errors.length > 0
                      ? Array.isArray(log.errors)
                        ? log.errors.slice(0, 2).join("; ")
                        : String(log.errors).slice(0, 100)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default IndexingLogs;
