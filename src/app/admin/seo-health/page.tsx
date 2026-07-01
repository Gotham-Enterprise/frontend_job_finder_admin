"use client";

import { useState } from "react";
import { useDuplicateJobs } from "@/services/hooks/useSeoReports";
import HealthTabContent from "@/components/admin/seo-health/HealthTabContent";
import CoverageTabContent from "@/components/admin/seo-health/CoverageTabContent";
import DuplicatesTabContent from "@/components/admin/seo-health/DuplicatesTabContent";
import BotLogsTabContent from "@/components/admin/seo-health/BotLogsTabContent";
import AffiliatesTabContent from "@/components/admin/seo-health/AffiliatesTabContent";

export default function SeoHealthPage() {
  const [activeTab, setActiveTab] = useState<"health" | "coverage" | "duplicates" | "bot-logs" | "affiliates">("health");
  const { data: duplicatesData, isPending: duplicatesPending } = useDuplicateJobs();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track index quality, landing page coverage, and duplicate jobs
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("health")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "health"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Health & Schema
          </button>
          <button
            onClick={() => setActiveTab("coverage")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "coverage"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Coverage Reports
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "duplicates"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Duplicate Jobs
            {duplicatesPending ? (
              <span className="ml-2 inline-flex items-center">
                <svg className="h-3.5 w-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            ) : duplicatesData?.data && duplicatesData.data.length > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                {duplicatesData.data.length}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab("bot-logs")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "bot-logs"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Bot Traffic Logs
          </button>
          <button
            onClick={() => setActiveTab("affiliates")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "affiliates"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Affiliate Jobs
          </button>
        </nav>
      </div>

      {/* Tab Content: Health */}
      <div className={`animate-in fade-in slide-in-from-bottom-2 ${activeTab === "health" ? "block" : "hidden"}`}>
        <HealthTabContent />
      </div>

      {/* Tab Content: Coverage */}
      <div className={`animate-in fade-in slide-in-from-bottom-2 ${activeTab === "coverage" ? "block" : "hidden"}`}>
        <CoverageTabContent />
      </div>

      {/* Tab Content: Duplicates */}
      <div className={`animate-in fade-in slide-in-from-bottom-2 ${activeTab === "duplicates" ? "block" : "hidden"}`}>
        <DuplicatesTabContent />
      </div>

      {/* Tab Content: Bot Logs */}
      <div className={`animate-in fade-in slide-in-from-bottom-2 ${activeTab === "bot-logs" ? "block" : "hidden"}`}>
        <BotLogsTabContent />
      </div>

      {/* Tab Content: Affiliate Jobs */}
      <div className={`animate-in fade-in slide-in-from-bottom-2 ${activeTab === "affiliates" ? "block" : "hidden"}`}>
        <AffiliatesTabContent />
      </div>
    </div>
  );
}
