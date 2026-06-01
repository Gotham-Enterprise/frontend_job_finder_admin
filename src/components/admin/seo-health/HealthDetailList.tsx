"use client";

import { useState } from "react";
import { useHealthDetail } from "@/services/hooks/useSeoHealth";
import type { SeoHealthMetric, HealthDetailJob, HealthDetailSeoPage } from "@/types/seo-health";

interface HealthDetailListProps {
  metric: SeoHealthMetric;
  title: string;
  description: string;
  issue?: string;
  filter?: string;
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://gothamenterprisesltd.com";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
}

function jobFrontendUrl(job: HealthDetailJob): string {
  const occupationSlug = job.occupation?.name
    ? `${slugify(job.occupation.name)}-jobs`
    : "all-jobs";
  const titleSlug = slugify(job.title || "");
  return `${FRONTEND_URL}/find-jobs/${occupationSlug}/${job.id}/${titleSlug}`;
}

function fmtDate(d: string): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const qualityFilters = [
  { key: "", label: "All" },
  { key: "no-description", label: "No Description" },
  { key: "no-company-name", label: "No Company" },
  { key: "no-location", label: "No Location" },
  { key: "no-salary", label: "No Salary" },
];

const expiredFilters = [
  { days: 0, label: "All" },
  { days: 7, label: "Last 7 Days" },
  { days: 30, label: "Last 30 Days" },
  { days: 60, label: "Last 2 Months" },
];

export default function HealthDetailList({ metric, title, description, issue, filter }: HealthDetailListProps) {
  const [page, setPage] = useState(1);
  const [activeIssue, setActiveIssue] = useState(issue || "");
  const [activeDays, setActiveDays] = useState(0);
  const [customDays, setCustomDays] = useState("");
  const resolvedIssue = metric === "quality-issues" ? (activeIssue || undefined) : issue;
  const resolvedDays = metric === "expired-jobs" ? (activeDays || undefined) : undefined;
  const { data, isLoading, error } = useHealthDetail(metric, { page, issue: resolvedIssue, filter, days: resolvedDays });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Failed to load data. Please try again.
        </div>
      </div>
    );
  }

  const items = data.data;
  const pagination = data.pagination;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description} &mdash; {pagination.total.toLocaleString()} total
        </p>
      </div>

      {metric === "quality-issues" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {qualityFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveIssue(f.key);
                setPage(1);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${activeIssue === f.key
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {metric === "expired-jobs" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {expiredFilters.map((f) => (
            <button
              key={f.days}
              onClick={() => {
                setActiveDays(f.days);
                setCustomDays("");
                setPage(1);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${activeDays === f.days && !customDays
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              {f.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              placeholder="Custom days"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const days = parseInt(customDays);
                  if (days > 0) {
                    setActiveDays(days);
                    setPage(1);
                  }
                }
              }}
              className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
            <button
              onClick={() => {
                const days = parseInt(customDays);
                if (days > 0) {
                  setActiveDays(days);
                  setPage(1);
                }
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {metric === "seo-pages" ? (
        <SeoPageTable items={items as HealthDetailSeoPage[]} />
      ) : (
        <JobTable metric={metric} items={items as HealthDetailJob[]} />
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function JobTable({ metric, items }: { metric: string; items: HealthDetailJob[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Company</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Affiliate</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Occupation</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Location</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No items found
                </td>
              </tr>
            ) : (
              items.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-gray-900 dark:text-white">{job.title}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{job.companyName || "-"}</td>
                  <td className="px-6 py-4">
                    {job.affiliateId ? (
                      <Badge color="yellow">Affiliate</Badge>
                    ) : (
                      <Badge color="gray">Organic</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{job.occupation?.name || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {[job.locationCity, job.locationState].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusCell metric={metric} job={job} />
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={jobFrontendUrl(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={`View on site: ${job.title}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusCell({ metric, job }: { metric: string; job: HealthDetailJob }) {
  if (metric === "active-jobs") {
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return <Badge color="red">Expired</Badge>;
    }
    return <Badge color="green">Active</Badge>;
  }
  if (metric === "expired-jobs") {
    return <Badge color="red">Expired</Badge>;
  }
  if (metric === "expired-but-active") {
    return <Badge color="red">Expired</Badge>;
  }
  if (metric === "expired-but-active") {
    return <Badge color="red">Expired</Badge>;
  }
  if (metric === "quality-issues") {
    const reasons: string[] = [];
    if (!job.jobDescription) reasons.push("No description");
    if (!job.companyName) reasons.push("No company");
    if (!job.locationCity && !job.locationState) reasons.push("No location");
    if (!job.salaryRangeStart) reasons.push("No salary");
    return <Badge color="red">{reasons.join(", ") || "Issue"}</Badge>;
  }
  return null;
}

function SeoPageTable({ items }: { items: HealthDetailSeoPage[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Occupation</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">State</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">City</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Modifier</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Jobs</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Live</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Updated</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No pages found
                </td>
              </tr>
            ) : (
              items.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-gray-900 dark:text-white" title={page.title}>
                    {page.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{page.occupation?.name || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{page.state?.abbreviation || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{page.city?.name || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{page.modifier?.name || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge color={page.jobCount > 0 ? "green" : "red"}>{page.jobCount}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={page.indexable ? "green" : "gray"}>{page.indexable ? "Yes" : "No"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{fmtDate(page.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{fmtDate(page.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`${FRONTEND_URL}/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={`View on site: ${page.title}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
