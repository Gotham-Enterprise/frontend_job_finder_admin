"use client";

import { useState } from "react";
import { useSeoReports } from "@/services/hooks/useSeoReports";

export default function CoverageTabContent() {
  const { data: reportsData, isPending: reportsPending, error: reportsError } = useSeoReports();
  const [coverageSubTab, setCoverageSubTab] = useState<"category" | "location">("category");

  if (reportsPending) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading coverage data...
      </div>
    );
  }

  if (reportsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load coverage data.
      </div>
    );
  }

  if (reportsData?.data?.isComputing) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
        Coverage data is currently being computed by the background worker. Please check back later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Jobs</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {reportsData?.data?.totalJobs?.toLocaleString() ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Total number of published, non-archived, and non-expired jobs
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Active Jobs</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {reportsData?.data?.uniqueJobs?.toLocaleString() ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Deduplicated by title, company, and location
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setCoverageSubTab("category")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              coverageSubTab === "category"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Jobs by Category/Specialty
          </button>
          <button
            onClick={() => setCoverageSubTab("location")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              coverageSubTab === "location"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Jobs by State/City
          </button>
        </nav>
      </div>

      {/* Tables */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          {coverageSubTab === "category" ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Specialty</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {reportsData?.data?.jobsByCategorySpecialty?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{row.category}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.specialty}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">{row.jobCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">State</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">City</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {reportsData?.data?.jobsByStateCity?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{row.state}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.city}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">{row.jobCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
