import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon, UserIcon, CalenderIcon, BriefcaseIcon } from "@/icons";
import React from "react";
import { DashboardDetailsData } from "@/services/types/dashboard";

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Create dynamic job metrics data based on API response
export const createJobMetricsData = (data: DashboardDetailsData): MetricCardProps[] => [
  {
    icon: <BriefcaseIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Total Jobs",
    value: formatNumber(data.jobCount),
  },
  {
    icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Employers",
    value: formatNumber(data.employerCount),
    trend: data.employerCountToday > 0 ? {
      value: `+${data.employerCountToday} today`,
      isPositive: true,
    } : undefined,
  },
  {
    icon: <UserIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Job Seekers",
    value: formatNumber(data.jobSeekerCount),
    trend: data.jobseekerCountToday > 0 ? {
      value: `+${data.jobseekerCountToday} today`,
      isPositive: true,
    } : undefined,
  },
  {
    icon: <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Today's Job Seekers",
    value: formatNumber(data.jobseekerCountToday),
  },
  {
    icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Today's Applications",
    value: formatNumber(data.applicationCountToday),
  },
];

// Keep the static data for fallback
export const jobMetricsData: MetricCardProps[] = [
  {
    icon: <BriefcaseIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Total Jobs",
    value: "0",
  },
  {
    icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
    title: "Employers",
    value: "0",
  },
  {
    icon: <UserIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Job Seekers",
    value: "0",
  },
  {
    icon: <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Today's Job Seekers",
    value: "0",
  },
  {
    icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Today's Applications",
    value: "0",
  },
];

export const renderTrendIcon = (isPositive: boolean) => {
  return isPositive ? (
    <ArrowUpIcon />
  ) : (
    <ArrowDownIcon className="text-error-500" />
  );
};

export const renderBadgeColor = (isPositive: boolean): "success" | "error" => {
  return isPositive ? "success" : "error";
};