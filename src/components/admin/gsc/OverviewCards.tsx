"use client";

interface OverviewCardsProps {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  } | null;
  loading?: boolean;
}

function StatCard({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
        {suffix && <span className="ml-1 text-lg font-normal text-gray-400">{suffix}</span>}
      </p>
    </div>
  );
}

export default function OverviewCards({ summary, loading }: OverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Clicks" value={summary.totalClicks.toLocaleString()} color="text-blue-600 dark:text-blue-400" />
      <StatCard label="Total Impressions" value={summary.totalImpressions.toLocaleString()} color="text-green-600 dark:text-green-400" />
      <StatCard label="Average CTR" value={(summary.avgCtr * 100).toFixed(2)} suffix="%" color="text-purple-600 dark:text-purple-400" />
      <StatCard label="Avg. Position" value={summary.avgPosition.toFixed(1)} color="text-orange-600 dark:text-orange-400" />
    </div>
  );
}
