"use client";

import React, { useState } from "react";
import { ActivityLogEntry, ActivityLogsFilters } from "@/services/types/activityLog";
import {
  useJobSeekerActivityLogs,
  useEmployerActivityLogs,
} from "@/services/hooks/useActivityLogs";
import Pagination from "@/components/tables/Pagination";
import NotFoundState from "@/components/common/NotFoundState";
import ErrorState from "@/components/common/ErrorState";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTimestamp(ts: string): { date: string; time: string } {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

/** Shorten a user-agent string for display. */
function shortenUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  // Extract browser name + version
  const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)[/ ]([\d.]+)/i);
  if (match) return `${match[1]} ${match[2].split(".")[0]}`;
  if (ua.length > 40) return ua.slice(0, 37) + "…";
  return ua;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource type badge colour map
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_BADGE: Record<string, string> = {
  AUTH: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  APPLICATIONS: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  JOBS: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  COMPANIES: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  TEAM: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  RESUMES: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  PROFILE: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  CANDIDATE: "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  USER: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
};

function resourceBadgeClass(type: string | null) {
  if (!type) return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  return RESOURCE_BADGE[type.toUpperCase()] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

// ─────────────────────────────────────────────────────────────────────────────
// Single log row
// ─────────────────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: ActivityLogEntry }) {
  const { date, time } = formatTimestamp(log.timestamp);
  const isImpersonation = log.isImpersonationEvent;
  const isDuringImpersonation = !!log.impersonatedByAdmin;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
        ${isImpersonation
          ? "bg-blue-50/60 dark:bg-blue-900/10"
          : isDuringImpersonation
            ? "bg-amber-50/60 dark:bg-amber-900/10"
            : "hover:bg-gray-50/60 dark:hover:bg-gray-800/30"
        }`}
    >
      {/* Left: timestamp */}
      <div className="min-w-[130px] shrink-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white">{date}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>

      {/* Middle: icon + label */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* Impersonation event icon */}
          {isImpersonation && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <ShieldIcon />
              Admin Session
            </span>
          )}

          {/* Label */}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {log.label}
          </span>

          {/* Resource type badge */}
          {log.resourceType && (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${resourceBadgeClass(log.resourceType)}`}
            >
              {log.resourceType}
            </span>
          )}
        </div>

        {/* Actor */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {isImpersonation
              ? log.actorName // actor is the admin
              : log.actorName}
          </span>
          {isImpersonation && log.targetUser?.name && (
            <span className="text-gray-400">
              {" "}→ acting as{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {log.targetUser.name}
              </span>
            </span>
          )}
        </p>

        {/* IP + browser */}
        {(log.ipAddress || log.userAgent) && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {log.ipAddress && <span>{log.ipAddress}</span>}
            {log.ipAddress && log.userAgent && <span className="mx-1">·</span>}
            {log.userAgent && <span>{shortenUserAgent(log.userAgent)}</span>}
          </p>
        )}
      </div>

      {/* Right: impersonation badge */}
      {isDuringImpersonation && (
        <div className="shrink-0 self-start sm:self-center">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 whitespace-nowrap">
            <UserIcon />
            Impersonated by {log.impersonatedByAdmin!.name}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny inline SVG icons (no external dep)
// ─────────────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M9.432 2.139a1 1 0 011.136 0l7 4.286A1 1 0 0118 7.286V10c0 4.556-2.942 7.608-7.428 8.898a1 1 0 01-.544 0C5.542 17.608 2 14.556 2 10V7.286a1 1 0 01.432-.861l7-4.286z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ActivityLogsPanelProps {
  type: "jobseeker" | "employer";
  id: string;
}

const ITEMS_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivityLogsPanel({ type, id }: ActivityLogsPanelProps) {
  const [filters, setFilters] = useState<ActivityLogsFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE,
  });

  const jobSeekerQuery = useJobSeekerActivityLogs(
    type === "jobseeker" ? id : "",
    type === "jobseeker" ? filters : {},
  );

  const employerQuery = useEmployerActivityLogs(
    type === "employer" ? id : "",
    type === "employer" ? filters : {},
  );

  const query = type === "jobseeker" ? jobSeekerQuery : employerQuery;
  const { data, isLoading, error } = query;

  const logs = data?.data?.logs ?? [];
  const pagination = data?.data?.pagination;

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="col-span-full rounded-xl bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activity Logs</h3>
          {pagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.total} total{pagination.total === 1 ? " entry" : " entries"}
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-200 dark:bg-blue-800" />
            Admin session
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-200 dark:bg-amber-800" />
            During impersonation
          </span>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading activity logs…</p>
          </div>
        </div>
      ) : error ? (
        <div className="px-6 py-6">
          <ErrorState
            variant="inline"
            message="Could not load activity logs. Please try again."
            showRetryButton={false}
          />
        </div>
      ) : logs.length === 0 ? (
        <NotFoundState
          title="No activity logs found"
          message="No actions have been recorded for this user yet."
        />
      ) : (
        <>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
