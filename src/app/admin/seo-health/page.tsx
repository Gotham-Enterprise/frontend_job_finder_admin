"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSeoHealth, useSchemaQuality } from "@/services/hooks/useSeoHealth";
import HealthMetricsCards from "@/components/admin/seo-health/HealthMetricsCards";
import QualityIssuesTable from "@/components/admin/seo-health/QualityIssuesTable";
import SchemaQualityPanel from "@/components/admin/seo-health/SchemaQualityPanel";
import type { QualityIssueRow } from "@/types/seo-health";

export default function SeoHealthPage() {
  const queryClient = useQueryClient();
  const { data: health, isLoading: healthLoading, error: healthError } = useSeoHealth();
  const { data: schema, isLoading: schemaLoading } = useSchemaQuality();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["seoHealth"] });
    queryClient.invalidateQueries({ queryKey: ["seoSchemaQuality"] });
  };

  if (healthLoading) {
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

  if (healthError || !health?.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Failed to load SEO health data. Please try again.
        </div>
      </div>
    );
  }

  const d = health.data;
  const qualityIssuesTotal =
    d.qualityIssues.noDescription +
    d.qualityIssues.noCompanyName +
    d.qualityIssues.noLocation +
    d.qualityIssues.noSalary;

  const totalActive = d.activeJobs;

  const qualityRows: QualityIssueRow[] = [
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
      severity:
        d.qualityIssues.noCompanyName > 1000 ? "warning" : "info",
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
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SEO Health Monitor
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track index quality, content health, and schema issues
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Row 1: Metric Cards */}
      <div className="mb-6">
        <HealthMetricsCards
          activeJobs={d.activeJobs}
          expired7d={d.expiredJobs.last7Days}
          qualityIssuesTotal={qualityIssuesTotal}
          seoPagesTotal={d.seoPages.total}
          seoPagesWithZeroJobs={d.seoPages.withZeroJobs}
        />
      </div>

      {/* Row 2: Quality Issues Table */}
      <div className="mb-6">
        <QualityIssuesTable issues={qualityRows} />
      </div>

      {/* Row 3: Schema Quality */}
      <div>
        <SchemaQualityPanel
          missingHiringOrg={schema?.data.missingHiringOrg ?? 0}
          missingEmploymentType={schema?.data.missingEmploymentType ?? 0}
          missingLocation={schema?.data.missingLocation ?? 0}
          remoteMissingSchema={schema?.data.remoteMissingSchema ?? 0}
          expiredButActive={schema?.data.expiredButActive ?? 0}
          totalActive={schema?.data.totalActive ?? totalActive}
        />
      </div>
    </div>
  );
}
