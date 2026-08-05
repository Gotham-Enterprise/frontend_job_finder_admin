"use client";

import { useState } from "react";
import { useCrawlFunnel } from "@/services/hooks/useSeoHealth";

const PERIODS = [
  { value: 7, label: "Last 7 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 90, label: "Last 90 Days" },
];

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return null;
  const isUp = trend > 0;
  const isDown = trend < 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
      isUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
      isDown ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
    }`}>
      {isUp ? "+" : ""}{trend}%
    </span>
  );
}

function FunnelBar({ label, count, pct, trend, maxCount }: { label: string; count: number; pct: number; trend: number | null; maxCount: number }) {
  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const color = pct >= 50 ? "bg-emerald-500" : pct >= 20 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 text-right text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="flex-1">
        <div className="relative h-8 w-full rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-500 ${color}`} style={{ width: `${barWidth}%` }} />
          <div className="absolute inset-0 flex items-center px-3 text-sm font-medium text-gray-900 dark:text-white">
            {count.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="w-16 text-right text-xs text-gray-500 dark:text-gray-400">{pct}% retained</div>
      <div className="w-20 text-right"><TrendBadge trend={trend} /></div>
    </div>
  );
}

export default function CrawlFunnelPanel() {
  const [period, setPeriod] = useState(7);
  const { data, isLoading } = useCrawlFunnel({ period });

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Loading crawl funnel data...</div>;
  }

  const stages = data?.data?.stages || [];
  const crawledByType = data?.data?.crawledByType || [];
  const maxCount = stages.length > 0 ? stages[0].count : 1;

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Period:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crawl Funnel</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Shows the drop-off from total available URLs to pages that actually receive clicks from search results.
        </p>
        {stages.map((stage) => (
          <FunnelBar
            key={stage.label}
            label={stage.label}
            count={stage.count}
            pct={stage.pctOfPrevious}
            trend={stage.trend}
            maxCount={maxCount}
          />
        ))}
      </div>

      {/* Crawled URLs by page type */}
      {crawledByType.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Crawled URLs by Page Type</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Page Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Crawled</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">% of Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">vs Prev Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {crawledByType.map((pt) => (
                  <tr key={pt.pageType} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {pt.pageType.replace(/_/g, " ")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {pt.count.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {pt.pctOfTotal}%
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <TrendBadge trend={pt.prevCount > 0 ? Math.round(((pt.count - pt.prevCount) / pt.prevCount) * 100) : null} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
