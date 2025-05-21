import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon, UserIcon } from "@/icons";
import React from "react";

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: {
    value: string;
    isPositive: boolean;
  };
}

export const jobMetricsData: MetricCardProps[] = [
  {
    icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Total number of jobs",
    value: "3,782",
    trend: {
      value: "11.01%",
      isPositive: true,
    },
  },
  {
    icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
    title: "Employers",
    value: "5,359",
    trend: {
      value: "9.05%",
      isPositive: false,
    },
  },  {
    icon: <UserIcon className="text-gray-800 size-6 dark:text-white/90" />,
    title: "Jobseekers",
    value: "12,487",
    trend: {
      value: "15.3%",
      isPositive: true,
    },
  },
];

export const renderTrendIcon = (isPositive: boolean) => {
  return isPositive ? (
    <ArrowUpIcon />
  ) : (
    <ArrowDownIcon className="text-error-500" />
  );
};

export const renderBadgeColor = (isPositive: boolean) => {
  return isPositive ? "success" : "error";
};