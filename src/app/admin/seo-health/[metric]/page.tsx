import { notFound } from "next/navigation";
import HealthDetailList from "@/components/admin/seo-health/HealthDetailList";
import type { SeoHealthMetric } from "@/types/seo-health";

const metricConfig: Record<
  SeoHealthMetric,
  { title: string; description: string }
> = {
  "active-jobs": {
    title: "Active Jobs",
    description: "Published jobs that are not expired",
  },
  "expired-7d": {
    title: "Expired Jobs (Last 7 Days)",
    description: "Jobs that expired in the last 7 days",
  },
  "quality-issues": {
    title: "Quality Issues",
    description: "Jobs with missing or incomplete fields",
  },
  "seo-pages": {
    title: "SEO Pages",
    description: "All generated SEO landing pages",
  },
};

export default async function SeoHealthMetricPage({
  params,
  searchParams,
}: {
  params: Promise<{ metric: string }>;
  searchParams: Promise<{ issue?: string; filter?: string }>;
}) {
  const { metric } = await params;
  const { issue, filter } = await searchParams;

  const validMetrics: SeoHealthMetric[] = [
    "active-jobs",
    "expired-7d",
    "quality-issues",
    "seo-pages",
  ];

  if (!validMetrics.includes(metric as SeoHealthMetric)) {
    notFound();
  }

  const config = metricConfig[metric as SeoHealthMetric];

  return (
    <HealthDetailList
      metric={metric as SeoHealthMetric}
      title={config.title}
      description={config.description}
      issue={issue}
      filter={filter}
    />
  );
}
