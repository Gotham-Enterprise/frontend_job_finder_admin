"use client";

import React from "react";
import { formatDateTime } from "@/services/utils/dateUtils";
import type { NewsletterOverview } from "@/services/types/newsletterSubscriber";

interface NewsletterOverviewStatsProps {
  overview: NewsletterOverview | null;
}

const NewsletterOverviewStats: React.FC<NewsletterOverviewStatsProps> = ({
  overview,
}) => {
  const lastRun = overview?.lastRun;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {overview?.subscriberCount ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Sent</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {lastRun?.sentAt ? formatDateTime(lastRun.sentAt, "—") : "Never"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {lastRun?.sent ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Skipped / Failed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {lastRun ? `${lastRun.skipped} / ${lastRun.failed}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterOverviewStats;
