"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdCampaignConversions, getAdCampaignSummary } from "@/services/api/adCampaigns";

const PLATFORMS = [
  { value: "all", label: "All platforms" },
  { value: "google", label: "Google Ads" },
  { value: "meta", label: "Meta Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "other", label: "Other" },
];

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  tiktok: "TikTok Ads",
  other: "Other",
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function roleLabel(role: string | null) {
  if (role === "job_seeker") return "Job seeker";
  if (role === "employer") return "Employer";
  return role || "—";
}

function landingHref(path: string): string | null {
  if (!path) return null;
  const base = (process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  if (path.startsWith("/") && !path.startsWith("//")) return `${base}${path}`;
  try {
    const url = new URL(path);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function LandingPathLink({ path }: { path: string }) {
  const href = landingHref(path);
  if (!href) return <span className="text-gray-400">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline dark:text-blue-400"
    >
      {path}
    </a>
  );
}

export default function AdCampaignsPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return isoDate(start);
  });
  const [to, setTo] = useState(() => isoDate(today));
  const [platform, setPlatform] = useState("all");
  const [page, setPage] = useState(1);

  const filters = { from, to, platform };

  const summaryQuery = useQuery({
    queryKey: ["ad-campaign-summary", filters],
    queryFn: () => getAdCampaignSummary(filters),
  });

  const conversionsQuery = useQuery({
    queryKey: ["ad-campaign-conversions", filters, page],
    queryFn: () => getAdCampaignConversions({ ...filters, page, limit: 20 }),
  });

  const summary = summaryQuery.data?.data;
  const conversions = conversionsQuery.data?.data ?? [];
  const meta = conversionsQuery.data?.metaData;

  const cards = [
    { label: "Clicks", value: summary?.clicks ?? 0 },
    { label: "Unique visitors", value: summary?.uniqueVisitors ?? 0 },
    { label: "Job seeker registrations", value: summary?.jobSeekerRegistrations ?? 0 },
    { label: "Employer registrations", value: summary?.employerRegistrations ?? 0 },
    { label: "Conversion rate", value: `${summary?.conversionRate ?? 0}%` },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ad Campaigns</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Clicks and registrations from paid campaigns. Google, Meta, and TikTok all use the same UTM and click-id tracking.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-gray-700 dark:text-gray-300">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Platform
          <select
            value={platform}
            onChange={(event) => {
              setPlatform(event.target.value);
              setPage(1);
            }}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {PLATFORMS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {summaryQuery.isError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          Campaign summary could not be loaded.
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {summaryQuery.isLoading ? "…" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Medium</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Uniques</th>
              <th className="px-4 py-3 font-medium">Job seekers</th>
              <th className="px-4 py-3 font-medium">Employers</th>
              <th className="px-4 py-3 font-medium">CVR</th>
              <th className="px-4 py-3 font-medium">Landing path</th>
            </tr>
          </thead>
          <tbody>
            {summaryQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={10}>
                  Loading campaigns…
                </td>
              </tr>
            ) : !summary?.campaigns.length ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={10}>
                  No ad clicks in this date range.
                </td>
              </tr>
            ) : (
              summary.campaigns.map((row) => (
                <tr
                  key={`${row.platform}-${row.campaign}-${row.source}-${row.medium}`}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {PLATFORM_LABELS[row.platform] || row.platform}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.campaign || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.source || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.medium || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.clicks}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.uniques}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.jobSeekerConversions}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.employerConversions}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.conversionRate}%</td>
                  <td className="px-4 py-3">
                    <LandingPathLink path={row.landingPath} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Recent conversions</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Converted</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Medium</th>
              <th className="px-4 py-3 font-medium">Landing path</th>
            </tr>
          </thead>
          <tbody>
            {conversionsQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={6}>
                  Loading conversions…
                </td>
              </tr>
            ) : conversionsQuery.isError ? (
              <tr>
                <td className="px-4 py-6 text-red-600" colSpan={6}>
                  Conversions could not be loaded.
                </td>
              </tr>
            ) : conversions.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={6}>
                  No registrations attributed to an ad click in this date range.
                </td>
              </tr>
            ) : (
              conversions.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{formatWhen(row.convertedAt)}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{roleLabel(row.role)}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.campaign || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.source || row.label || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{row.medium || "—"}</td>
                  <td className="px-4 py-3">
                    <LandingPathLink path={row.landingPath} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40 dark:border-gray-600"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-300">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40 dark:border-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
