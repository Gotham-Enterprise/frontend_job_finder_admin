"use client";

import Badge from "@/components/ui/badge/Badge";
import type { QualityIssueRow } from "@/types/seo-health";

interface QualityIssuesTableProps {
  issues: QualityIssueRow[];
}

const severityBadge: Record<string, { color: "error" | "warning" | "info" }> =
  {
    critical: { color: "error" },
    warning: { color: "warning" },
    info: { color: "info" },
  };

export default function QualityIssuesTable({
  issues,
}: QualityIssuesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="px-6 py-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Quality Issues Breakdown
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Issue
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Count
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                % of Total
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                Severity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {issues.map((row) => {
              const badge = severityBadge[row.severity];
              const pct =
                row.total > 0
                  ? ((row.count / row.total) * 100).toFixed(2) + "%"
                  : "0%";
              return (
                <tr
                  key={row.issue}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {row.issue}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {pct}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="light" color={badge.color}>
                      {row.severity.charAt(0).toUpperCase() +
                        row.severity.slice(1)}
                    </Badge>
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
