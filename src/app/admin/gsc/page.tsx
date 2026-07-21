"use client";

import { useState } from "react";
import GscStatusBanner from "@/components/admin/gsc/GscStatusBanner";
import OverviewCards from "@/components/admin/gsc/OverviewCards";
import PerformanceChart from "@/components/admin/gsc/PerformanceChart";
import QueriesTable from "@/components/admin/gsc/QueriesTable";
import PropertiesList from "@/components/admin/gsc/PropertiesList";
import { useGscAnalyticsSummary, useGscProperties, useGscSyncHistory } from "@/services/hooks/useGsc";

export default function GscDashboardPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const now = new Date();
  const startDate = new Date();
  switch (dateRange) {
    case "7d": startDate.setDate(now.getDate() - 7); break;
    case "30d": startDate.setDate(now.getDate() - 30); break;
    case "90d": startDate.setDate(now.getDate() - 90); break;
  }
  const fmtStart = startDate.toISOString().slice(0, 10);
  const fmtEnd = now.toISOString().slice(0, 10);

  const { data: summaryData, isLoading: summaryLoading } = useGscAnalyticsSummary({
    startDate: fmtStart,
    endDate: fmtEnd,
  });
  const { data: propertiesData, isLoading: propertiesLoading } = useGscProperties();
  const { data: syncData, isLoading: syncLoading } = useGscSyncHistory();

  const summary = summaryData?.data;
  const properties = propertiesData?.data || null;
  const syncHistory = syncData?.data || null;
  const disabled = summaryData?.disabled;

  const ranges = [
    { value: "7d" as const, label: "7 Days" },
    { value: "30d" as const, label: "30 Days" },
    { value: "90d" as const, label: "90 Days" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Google Search Console</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search performance data from Google Search Console
          </p>
        </div>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === r.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <GscStatusBanner />

      {disabled ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            GSC integration is currently disabled. Enable it above to view Search Console data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <OverviewCards summary={summary?.summary || null} loading={summaryLoading} />

          <PerformanceChart data={summary?.dailyTrends || null} loading={summaryLoading} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QueriesTable data={summary?.topQueries || null} loading={summaryLoading} label="Top Queries" valueKey="query" />
            <QueriesTable data={summary?.topPages || null} loading={summaryLoading} label="Top Pages" valueKey="page" />
          </div>

          <PropertiesList properties={properties} syncHistory={syncHistory} loading={propertiesLoading || syncLoading} />
        </div>
      )}
    </div>
  );
}
