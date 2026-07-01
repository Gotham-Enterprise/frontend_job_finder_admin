"use client";

import { useSeoHealth, useSchemaQuality } from "@/services/hooks/useSeoHealth";
import HealthMetricsCards from "@/components/admin/seo-health/HealthMetricsCards";
import QualityIssuesTable from "@/components/admin/seo-health/QualityIssuesTable";
import SchemaQualityPanel from "@/components/admin/seo-health/SchemaQualityPanel";
import type { QualityIssueRow } from "@/types/seo-health";

export default function HealthTabContent() {
  const { data: health, isPending: healthPending, error: healthError } = useSeoHealth();
  const { data: schema, isPending: schemaPending } = useSchemaQuality();

  const d = health?.data;
  const qualityIssuesTotal = d ? (
    d.qualityIssues.noDescription +
    d.qualityIssues.noCompanyName +
    d.qualityIssues.noLocation +
    d.qualityIssues.noSalary
  ) : 0;
  const totalActive = d?.activeJobs || 0;
  const qualityRows: QualityIssueRow[] = d ? [
    { issue: "No description", count: d.qualityIssues.noDescription, total: totalActive, severity: d.qualityIssues.noDescription > 0 ? "critical" : "info" },
    { issue: "No company name", count: d.qualityIssues.noCompanyName, total: totalActive, severity: d.qualityIssues.noCompanyName > 1000 ? "warning" : "info" },
    { issue: "No location data", count: d.qualityIssues.noLocation, total: totalActive, severity: d.qualityIssues.noLocation > 0 ? "warning" : "info" },
    { issue: "No salary data", count: d.qualityIssues.noSalary, total: totalActive, severity: "info" },
  ] : [];

  if (healthPending) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (healthError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load health data. Please try again.
      </div>
    );
  }

  if (!d) return null;

  return (
    <div className="space-y-6">
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
  );
}
