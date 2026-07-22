"use client";

import type { GscQueryRow } from "@/types/gsc";

interface QueriesTableProps {
  data: GscQueryRow[] | null;
  loading?: boolean;
  label?: string;
  valueKey?: "query" | "page";
}

export default function QueriesTable({ data, loading, label = "Top Queries", valueKey = "query" }: QueriesTableProps) {
  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => (b._sum?.clicks || 0) - (a._sum?.clicks || 0));

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{valueKey === "query" ? "Query" : "Page"}</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Clicks</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Impressions</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">CTR</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.slice(0, 50).map((row, i) => {
              const val = row[valueKey];
              return (
                <tr key={val || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="max-w-xs truncate px-6 py-3 font-medium text-gray-900 dark:text-white" title={val || ""}>
                    {val || "-"}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{row._sum?.clicks || 0}</td>
                  <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{row._sum?.impressions?.toLocaleString() || 0}</td>
                  <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">
                    {((row._avg?.ctr || 0) * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">
                    {(row._avg?.position || 0).toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
