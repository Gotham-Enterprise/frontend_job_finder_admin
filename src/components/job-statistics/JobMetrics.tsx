"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { renderBadgeColor, renderTrendIcon } from "./helper";
import { adminAnalyticsService } from "@/services/adminAnalytics";
import type { MetricWithTrend } from "@/types/analytics";
import { BoxIconLine, GroupIcon, UserIcon } from "@/icons";

interface JobMetricsProps {
  refreshKey?: number;
}

export const JobMetrics: React.FC<JobMetricsProps> = ({ refreshKey }) => {
  const [metrics, setMetrics] = useState<MetricWithTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icon mapping for metrics
  const iconMap: Record<string, React.ReactNode> = {
    "Total Jobs": <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    "Total Employers": <BoxIconLine className="text-gray-800 dark:text-white/90" />,
    "Total Jobseekers": <UserIcon className="text-gray-800 size-6 dark:text-white/90" />,
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminAnalyticsService.getOverviewMetrics();
        if (response.success && response.data.metrics) {
          setMetrics(response.data.metrics);
        } else {
          setError("Failed to load metrics");
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Failed to load metrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [refreshKey]);

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
      {isLoading
        ? // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
              <div className="mt-5">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20 mb-2"></div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <div className="h-8 flex-1 min-w-[6rem] max-w-full bg-gray-200 rounded dark:bg-gray-700"></div>
                  <div className="h-6 w-20 shrink-0 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          ))
        : // Actual metrics
          metrics.map((metric, index) => (
            <div
              key={index}
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                {iconMap[metric.title] || <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
              </div>

              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.title}
                </span>
                <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                  <h4 className="min-w-0 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {metric.value}
                  </h4>
                  <Badge
                    className="shrink-0"
                    color={renderBadgeColor(metric.trend.isPositive)}
                  >
                    {renderTrendIcon(metric.trend.isPositive)}
                    {metric.trend.value}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};
