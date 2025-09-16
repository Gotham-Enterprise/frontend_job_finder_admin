"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { jobMetricsData, createJobMetricsData, renderBadgeColor, renderTrendIcon } from "./helper";
import { useDashboardDetails } from "@/services/hooks/useDashboardDetails";

export const JobMetrics = () => {
  const { data, loading, error } = useDashboardDetails();
  
  // Use dynamic data if available, otherwise fall back to static data
  const metricsData = data ? createJobMetricsData(data) : jobMetricsData;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded dark:bg-gray-600"></div>
            </div>
            <div className="flex items-end justify-between mt-5">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/10 md:p-6">
        <div className="text-red-600 dark:text-red-400">
          <h4 className="font-semibold">Error loading dashboard data</h4>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
      {metricsData.map((metric, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {metric.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value}
              </h4>
              {metric.trend && (
                <div className="flex items-center mt-2">
                  <Badge
                    color={renderBadgeColor(metric.trend.isPositive)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {renderTrendIcon(metric.trend.isPositive)}
                    {metric.trend.value}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
