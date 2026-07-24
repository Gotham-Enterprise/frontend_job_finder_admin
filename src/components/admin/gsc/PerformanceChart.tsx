"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { GscDailyTrend } from "@/types/gsc";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PerformanceChartProps {
  data: GscDailyTrend[] | null;
  loading?: boolean;
}

export default function PerformanceChart({ data, loading }: PerformanceChartProps) {
  if (loading) {
    return <div className="h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const categories = sorted.map((d) => {
    const dt = new Date(d.date);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  });
  const clicks = sorted.map((d) => d._sum?.clicks || 0);
  const impressions = sorted.map((d) => Math.round((d._sum?.impressions || 0) / 1000));

  const series = [
    { name: "Clicks", data: clicks },
    { name: "Impressions (K)", data: impressions },
  ];

  const options: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#3B82F6", "#10B981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories, labels: { show: true, rotate: -45 }, axisBorder: { show: false } },
    yaxis: [{ title: { text: "Clicks" } }, { opposite: true, title: { text: "Impressions (K)" } }],
    grid: { borderColor: "#f1f5f9", strokeDashArray: 3 },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: { shared: true, intersect: false },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Performance Trends</h3>
      <ApexChart options={options} series={series} type="line" height={320} />
    </div>
  );
}
