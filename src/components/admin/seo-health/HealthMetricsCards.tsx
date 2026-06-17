"use client";

import Link from "next/link";
import type { MetricCard } from "@/types/seo-health";

interface HealthMetricsCardsProps {
  activeJobs: number;
  expiredJobs: number;
  qualityIssuesTotal: number;
  seoPagesTotal: number;
  seoPagesWithZeroJobs: number;
  seoPagesPruned?: number;
  seoPagesIndexableWithZeroJobs?: number;
  lastCronRun?: string | null;
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  green: {
    bg: "bg-green-50 dark:bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-500/20",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-400",
    iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-500/20",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
  },
};

const icons: Record<string, string> = {
  green: "💼",
  yellow: "⏰",
  red: "⚠️",
  blue: "📄",
};

export default function HealthMetricsCards({
  activeJobs,
  expiredJobs,
  qualityIssuesTotal,
  seoPagesTotal,
  seoPagesWithZeroJobs,
  seoPagesPruned = 0,
  seoPagesIndexableWithZeroJobs = 0,
  lastCronRun,
}: HealthMetricsCardsProps) {
  const seoPagesColor = seoPagesIndexableWithZeroJobs > 0 ? "red" : "blue";
  const seoPagesSubtitle = seoPagesIndexableWithZeroJobs > 0
    ? `${seoPagesIndexableWithZeroJobs.toLocaleString()} still indexable / ${seoPagesPruned.toLocaleString()} pruned`
    : `${seoPagesPruned.toLocaleString()} pruned / ${seoPagesTotal.toLocaleString()} total`;

  const cards: MetricCard[] = [
    {
      title: "Active Jobs",
      value: activeJobs.toLocaleString(),
      subtitle: "Published & not expired",
      color: "green",
      icon: icons.green,
      link: "/admin/seo-health/active-jobs",
    },
    {
      title: "Expired Jobs",
      value: expiredJobs.toLocaleString(),
      subtitle: "Jobs that are already expired",
      color: "red",
      icon: icons.red,
      link: "/admin/seo-health/expired-jobs",
    },
    {
      title: "Quality Issues",
      value: qualityIssuesTotal.toLocaleString(),
      subtitle: "Jobs missing critical fields",
      color: "red",
      icon: icons.red,
      link: "/admin/seo-health/quality-issues",
    },
    {
      title: "SEO Pages",
      value: `${seoPagesWithZeroJobs.toLocaleString()} / ${seoPagesTotal.toLocaleString()}`,
      subtitle: seoPagesSubtitle,
      color: seoPagesColor,
      icon: icons.blue,
      link: "/admin/seo-health/seo-pages?filter=no-active-jobs",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const c = colorMap[card.color];
        const content = (
          <div
            className={`rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-md dark:border-gray-700 ${c.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className={`mt-2 text-3xl font-bold ${c.text}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl ${c.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        );

        if (card.link) {
          return (
            <Link key={card.title} href={card.link}>
              {content}
            </Link>
          );
        }

        return <div key={card.title}>{content}</div>;
      })}
    </div>
  );
}
