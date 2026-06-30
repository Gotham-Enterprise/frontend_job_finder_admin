"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSeoHealth, useSchemaQuality } from "@/services/hooks/useSeoHealth";
import { useSeoReports, useDuplicateJobs } from "@/services/hooks/useSeoReports";
import HealthMetricsCards from "@/components/admin/seo-health/HealthMetricsCards";
import QualityIssuesTable from "@/components/admin/seo-health/QualityIssuesTable";
import SchemaQualityPanel from "@/components/admin/seo-health/SchemaQualityPanel";
import type { QualityIssueRow } from "@/types/seo-health";

export default function SeoHealthPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"health" | "coverage" | "duplicates">("health");
  const [coverageSubTab, setCoverageSubTab] = useState<"category" | "location">("category");

  // Health Data
  const { data: health, isLoading: healthLoading, error: healthError } = useSeoHealth();
  const { data: schema, isLoading: schemaLoading } = useSchemaQuality();

  // Reports / Coverage Data
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useSeoReports();
  
  // Duplicates Data
  const { data: duplicatesData, isLoading: duplicatesLoading, error: duplicatesError } = useDuplicateJobs();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["seoHealth"] });
    queryClient.invalidateQueries({ queryKey: ["seoSchemaQuality"] });
    queryClient.invalidateQueries({ queryKey: ["seoReports"] });
    queryClient.invalidateQueries({ queryKey: ["seoDuplicateJobs"] });
  };

  const isLoading = healthLoading || reportsLoading || duplicatesLoading;
  const hasError = healthError || reportsError || duplicatesError;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Failed to load SEO dashboard data. Please try again.
        </div>
      </div>
    );
  }

  // Parse Health Data
  const d = health?.data;
  const qualityIssuesTotal = d ? (
    d.qualityIssues.noDescription +
    d.qualityIssues.noCompanyName +
    d.qualityIssues.noLocation +
    d.qualityIssues.noSalary
  ) : 0;
  const totalActive = d?.activeJobs || 0;
  const qualityRows: QualityIssueRow[] = d ? [
    {
      issue: "No description",
      count: d.qualityIssues.noDescription,
      total: totalActive,
      severity: d.qualityIssues.noDescription > 0 ? "critical" : "info",
    },
    {
      issue: "No company name",
      count: d.qualityIssues.noCompanyName,
      total: totalActive,
      severity: d.qualityIssues.noCompanyName > 1000 ? "warning" : "info",
    },
    {
      issue: "No location data",
      count: d.qualityIssues.noLocation,
      total: totalActive,
      severity: d.qualityIssues.noLocation > 0 ? "warning" : "info",
    },
    {
      issue: "No salary data",
      count: d.qualityIssues.noSalary,
      total: totalActive,
      severity: "info",
    },
  ] : [];

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
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Refresh Data
          </button>
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
            {duplicatesData?.data && duplicatesData.data.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                {duplicatesData.data.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content: Health */}
      {activeTab === "health" && d && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <HealthMetricsCards
            activeJobs={d.activeJobs}
            expiredJobs={schema?.data?.expiredButActive ?? 0}
            qualityIssuesTotal={qualityIssuesTotal}
            seoPagesTotal={d.seoPages.total}
            seoPagesWithZeroJobs={d.seoPages.withZeroJobs}
            seoPagesPruned={d.seoPages.pruned}
            seoPagesIndexableWithZeroJobs={d.seoPages.indexableWithZeroJobs}
            lastCronRun={d.seoPages.lastCronRun}
          />
          <QualityIssuesTable issues={qualityRows} />
          <SchemaQualityPanel
            missingHiringOrg={schema?.data?.missingHiringOrg ?? 0}
            missingEmploymentType={schema?.data?.missingEmploymentType ?? 0}
            missingLocation={schema?.data?.missingLocation ?? 0}
            remoteMissingSchema={schema?.data?.remoteMissingSchema ?? 0}
            expiredButActive={schema?.data?.expiredButActive ?? 0}
            totalActive={schema?.data?.totalActive ?? totalActive}
          />
        </div>
      )}

      {/* Tab Content: Coverage */}
      {activeTab === "coverage" && reportsData?.data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {reportsData.data.isComputing ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              Coverage data is currently being computed by the background worker. Please check back later.
            </div>
          ) : (
            <>
              {/* Metrics Row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Jobs</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                    {reportsData.data.totalJobs.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Total number of published, non-archived, and non-expired jobs
                  </p>
                </div>
                
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Active Jobs</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                    {reportsData.data.uniqueJobs.toLocaleString()}
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
                        {reportsData.data.jobsByCategorySpecialty?.map((row, idx) => (
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
                        {reportsData.data.jobsByStateCity?.map((row, idx) => (
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
            </>
          )}
        </div>
      )}

      {/* Tab Content: Duplicates */}
      {activeTab === "duplicates" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {!duplicatesData?.data || duplicatesData.data.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {reportsData?.data?.isComputing 
                ? "Duplicate data is currently being computed by the background worker. Please check back later." 
                : "No duplicate jobs found! Your job index is perfectly clean."}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Exact Duplicates Overview</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Showing job postings that share the exact same Title, Company, and Location.
                </p>
              </div>
              <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 z-10 shadow-sm">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title & Company</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Count</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Manage Jobs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                    {duplicatesData.data.map((group, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{group.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{group.companyName}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm text-gray-900 dark:text-white">{group.locationCity}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{group.locationState}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center align-top">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            {group.duplicateCount} duplicates
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            {group.jobIds.map((id, index) => {
                              const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://gothamenterprisesltd.com";
                              const titleSlug = (group.title || "").toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
                              const publicUrl = `${FRONTEND_URL}/find-jobs/all-jobs/${id}/${titleSlug}`;
                              return (
                                <a
                                  key={id}
                                  href={publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                                >
                                  View #{index + 1}
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
