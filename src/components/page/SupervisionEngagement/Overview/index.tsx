"use client";
import React, { useMemo, useState } from "react";
import { useEngagementOverview } from "@/services/hooks/useSupervisionEngagement";
import { formatDate, formatDateTime } from "@/services/utils/dateUtils";
import type {
  EngagementOverviewFilters,
  EngagementOverviewPeriod,
} from "@/services/types/supervisionEngagement";
import Select from "@/components/form/Select";
import { formatUsStateCodeForDisplay } from "@/services/utils/formatUsStateLicensure";
import ConversationTimelineModal from "../ConversationTimelineModal";
import { CounterpartCell, EmptyRow, HIRE_KIND_LABELS, HireStatusBadge, TD, TH } from "../shared";
import TrendChart from "./TrendChart";
import {
  PREVIOUS_PERIOD_LABELS,
  compareCount,
  compareDuration,
  compareRate,
  formatDuration,
  formatPercent,
  type Delta,
} from "./compare";

const PERIODS: { value: EngagementOverviewPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "28d", label: "Last 28 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

// Each pair clears 4.5:1 text contrast on its card surface (white / gray-800).
const DELTA_TONE_CLASSES: Record<Delta["tone"], string> = {
  good: "text-success-700 dark:text-success-500",
  bad: "text-error-600 dark:text-error-400",
  neutral: "text-gray-500 dark:text-gray-400",
};

function StatTile({
  label,
  value,
  detail,
  delta,
  comparedTo,
}: {
  label: string;
  value: string;
  detail?: string;
  /** Change vs the previous period; arrow + words carry it, color only helps. */
  delta?: Delta | null;
  /** e.g. "previous 28 days". */
  comparedTo?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      {delta && (
        <div className="mt-1 text-xs">
          <span className={`font-medium ${DELTA_TONE_CLASSES[delta.tone]}`}>{delta.text}</span>
          {comparedTo && <span className="text-gray-500 dark:text-gray-400"> vs {comparedTo}</span>}
        </div>
      )}
      {detail && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</div>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

const formatCount = (value: number) => value.toLocaleString();

// The Select component can't pick an empty value, so "all" is a sentinel.
const ALL = "ALL";
const NO_FILTERS: EngagementOverviewFilters = { supervisorType: "", superviseeState: "" };
// Below this many active conversations, percentages swing on one or two chats.
const SMALL_SAMPLE = 5;

/** "2 · oldest Oct 30, 2026", or a dash when there is nothing waiting. */
function FollowUpCount({ count, since }: { count: number; since: string | null }) {
  if (!count) return <span className="text-gray-400">—</span>;
  return (
    <div>
      <span className="font-medium tabular-nums text-gray-900 dark:text-white">{formatCount(count)}</span>
      {since && (
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">oldest {formatDate(since)}</span>
      )}
    </div>
  );
}

/** "2026-11-03" -> "Nov 3" for x-axis ticks; read as a calendar date, not UTC. */
function shortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Admin Engagement Analytics (Phase 3): platform-wide messaging and hiring
 * for a period, in the admin's timezone. Counts only — no message content.
 */
export default function SupervisionEngagementOverview() {
  const [period, setPeriod] = useState<EngagementOverviewPeriod>("28d");
  const [filters, setFilters] = useState<EngagementOverviewFilters>(NO_FILTERS);
  const [timelineFor, setTimelineFor] = useState<{ id: string; title: string } | null>(null);
  const { data, isLoading, isFetching, isPlaceholderData, error, refetch } = useEngagementOverview(
    period,
    filters
  );
  const overview = data?.success ? data.data : null;
  const isRefreshing = isFetching && isPlaceholderData;
  const unitLabel = overview?.granularity === "week" ? "Week" : "Day";

  const messagePoints = useMemo(
    () => overview?.trend.map((b) => ({ label: b.label, axisLabel: shortDate(b.date), value: b.messages })) ?? [],
    [overview]
  );
  const hirePoints = useMemo(
    () => overview?.trend.map((b) => ({ label: b.label, axisLabel: shortDate(b.date), value: b.hiresAccepted })) ?? [],
    [overview]
  );

  const summary = overview?.summary;
  const previous = summary?.previous;
  const comparedTo = PREVIOUS_PERIOD_LABELS[period];
  const responsiveness = overview?.responsiveness;
  const hasFilters = Boolean(filters.supervisorType || filters.superviseeState);

  const supervisorTypeOptions = useMemo(
    () => [
      { value: ALL, label: "All Supervisor Types" },
      ...(overview?.filterOptions.supervisorTypes ?? []).map((type) => ({ value: type, label: type })),
    ],
    [overview?.filterOptions.supervisorTypes]
  );
  const stateOptions = useMemo(
    () => [
      { value: ALL, label: "All Supervisee States" },
      ...(overview?.filterOptions.superviseeStates ?? []).map((code) => ({
        value: code,
        label: formatUsStateCodeForDisplay(code) ?? code,
      })),
    ],
    [overview?.filterOptions.superviseeStates]
  );
  const setFilter = (key: keyof EngagementOverviewFilters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value === ALL ? "" : value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Supervision Engagement</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Messages and hires across Find A Supervisor. Message content is never shown, and automatic system messages
          are not counted.
        </p>
      </div>

      {/* One filter row; it scopes every number below it. */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Period">
        {PERIODS.map((option) => {
          const selected = option.value === period;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setPeriod(option.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          );
        })}
        {overview && (
          <span className="text-xs text-gray-500 dark:text-gray-400 sm:ml-2">
            {formatDate(overview.range.start)} – {formatDate(overview.range.end)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-full sm:w-60"
          options={supervisorTypeOptions}
          value={filters.supervisorType || ALL}
          onChange={setFilter("supervisorType")}
          searchable
          searchPlaceholder="Search types..."
        />
        <Select
          className="w-full sm:w-64"
          options={stateOptions}
          value={filters.superviseeState || ALL}
          onChange={setFilter("superviseeState")}
          searchable
          searchPlaceholder="Search states..."
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(NO_FILTERS)}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Clear filters
          </button>
        )}
      </div>
      {hasFilters && (
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Every number below is filtered. Supervisor type matches the supervisor&apos;s profile; supervisee state
            matches the supervisee&apos;s profile state.
            {filters.superviseeState && " Public visitors without an account have no state, so they are not counted."}
          </p>
          {summary && summary.activeConversations < SMALL_SAMPLE && (
            <p className="text-warning-700 dark:text-warning-400">
              Only {summary.activeConversations} active{" "}
              {summary.activeConversations === 1 ? "conversation matches" : "conversations match"}. Percentages can
              swing a lot on numbers this small.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading engagement…</p>
      ) : error || !overview || !summary ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-error-600 dark:text-error-400">Couldn&apos;t load engagement data.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className={`space-y-5 transition-opacity ${isRefreshing ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatTile
              label="Messages"
              value={formatCount(summary.messages)}
              delta={previous && compareCount(summary.messages, previous.messages)}
              comparedTo={comparedTo}
              detail={`In ${formatCount(summary.activeConversations)} active conversation${summary.activeConversations === 1 ? "" : "s"}`}
            />
            <StatTile
              label="Conversations With A Hire"
              value={formatPercent(summary.conversionRate)}
              delta={previous && compareRate(summary.conversionRate, previous.conversionRate)}
              comparedTo={comparedTo}
              detail={`${formatCount(summary.convertedConversations)} of ${formatCount(summary.activeConversations)} active conversations`}
            />
            <StatTile
              label="Connection Requests"
              value={formatCount(summary.connectionRequestsSent)}
              delta={previous && compareCount(summary.connectionRequestsSent, previous.connectionRequestsSent)}
              comparedTo={comparedTo}
              detail={`${formatCount(summary.connectionRequestsApproved)} approved in this period`}
            />
            <StatTile
              label="Hire Requests"
              value={formatCount(summary.hireRequests)}
              delta={previous && compareCount(summary.hireRequests, previous.hireRequests)}
              comparedTo={comparedTo}
              detail={`${formatCount(summary.hiresAccepted)} hires accepted in this period`}
            />
            <StatTile label="Current Hires" value={formatCount(summary.currentHires)} detail="Accepted or active right now" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TrendChart
              title={`Messages Per ${unitLabel}`}
              subtitle="Messages sent by supervisees, supervisors and Medical Directors"
              valueLabel="Messages"
              kind="area"
              points={messagePoints}
              isRefreshing={isRefreshing}
            />
            <TrendChart
              title={`Hires Accepted Per ${unitLabel}`}
              subtitle="Supervision and Medical Director hires, by the day they were accepted"
              valueLabel="Hires Accepted"
              kind="bar"
              points={hirePoints}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Table twin of both charts, so no value is reachable only by hovering. */}
          <details className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group">
            <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              View chart data as a table
            </summary>
            <div className="relative max-h-96 overflow-auto border-t border-gray-100 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/40 sticky top-0">
                  <tr>
                    <th className={TH}>{unitLabel}</th>
                    <th className={`${TH} text-right`}>Messages</th>
                    <th className={`${TH} text-right`}>Hire Requests</th>
                    <th className={`${TH} text-right`}>Hires Accepted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {overview.trend.map((bucket) => (
                    <tr key={bucket.date}>
                      <td className={TD}>{bucket.label}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(bucket.messages)}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(bucket.hireRequests)}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(bucket.hiresAccepted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {responsiveness && (
            <SectionCard
              title="Responsiveness"
              description="How fast supervisors and Medical Directors answer. A reply is their first message after a supervisee writes; an answer is approving or declining a connection request."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatTile
                  label="Median Reply Time"
                  value={formatDuration(responsiveness.current.medianReplyMinutes)}
                  delta={compareDuration(
                    responsiveness.current.medianReplyMinutes,
                    responsiveness.previous.medianReplyMinutes
                  )}
                  comparedTo={comparedTo}
                  detail={`${formatCount(responsiveness.current.replies)} replies measured`}
                />
                <StatTile
                  label="Replies Within 24 Hours"
                  value={formatPercent(responsiveness.current.replyWithin24hRate)}
                  delta={compareRate(
                    responsiveness.current.replyWithin24hRate,
                    responsiveness.previous.replyWithin24hRate
                  )}
                  comparedTo={comparedTo}
                  detail={`${formatCount(responsiveness.current.unansweredOver24h)} still unanswered after 24 hours`}
                />
                <StatTile
                  label="Connection Requests Answered Within 24 Hours"
                  value={formatPercent(responsiveness.current.connections.answeredWithin24hRate)}
                  delta={compareRate(
                    responsiveness.current.connections.answeredWithin24hRate,
                    responsiveness.previous.connections.answeredWithin24hRate
                  )}
                  comparedTo={comparedTo}
                  detail={`Median answer time ${formatDuration(responsiveness.current.connections.medianAnswerMinutes)}`}
                />
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Supervision vs Medical Director"
            description="Hire requests and accepted hires in this period, and hires running right now."
          >
            <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th className={TH}>Type</th>
                    <th className={`${TH} text-right`}>Hire Requests</th>
                    <th className={`${TH} text-right`}>Hires Accepted</th>
                    <th className={`${TH} text-right`}>Current Hires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {overview.byKind.map((row) => (
                    <tr key={row.kind}>
                      <td className={TD}>{HIRE_KIND_LABELS[row.kind]}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(row.hireRequests)}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(row.hiresAccepted)}</td>
                      <td className={`${TD} text-right tabular-nums`}>{formatCount(row.currentHires)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title={`Needs Follow-Up (${formatCount(overview.needsFollowUp.total)})`}
            description={`Supervisors and Medical Directors with a connection request or a supervisee's message unanswered for ${overview.needsFollowUp.afterDays}+ days. This is a live list, not tied to the period above.`}
          >
            {overview.needsFollowUp.items.length === 0 ? (
              <EmptyRow>Everyone is caught up.</EmptyRow>
            ) : (
              <>
                <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className={TH}>Supervisor</th>
                        <th className={TH}>Pending Requests</th>
                        <th className={TH}>Unanswered Conversations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {overview.needsFollowUp.items.map((row) => (
                        <tr key={row.supervisor.id}>
                          <td className={TD}>
                            <CounterpartCell counterpart={row.supervisor} />
                          </td>
                          <td className={TD}>
                            <FollowUpCount count={row.pendingRequests} since={row.oldestPendingAt} />
                          </td>
                          <td className={TD}>
                            <FollowUpCount count={row.waitingConversations} since={row.oldestWaitingAt} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {overview.needsFollowUp.total > overview.needsFollowUp.items.length && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Showing {overview.needsFollowUp.items.length} of {formatCount(overview.needsFollowUp.total)}.
                  </p>
                )}
              </>
            )}
          </SectionCard>

          <SectionCard
            title={`Talking But No Hire (${formatCount(overview.noHireConversations.total)})`}
            description="Conversations with messages in this period where the two have never had an accepted hire. A long conversation here can mean the arrangement moved off the platform."
          >
            {overview.noHireConversations.items.length === 0 ? (
              <EmptyRow>Every active conversation in this period has an accepted hire.</EmptyRow>
            ) : (
              <>
                <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className={TH}>Supervisee</th>
                        <th className={TH}>Supervisor</th>
                        <th className={`${TH} text-right`}>Messages</th>
                        <th className={TH}>Last Message</th>
                        <th className={TH}>Latest Hire Request</th>
                        <th className={TH}>
                          <span className="sr-only">Timeline</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {overview.noHireConversations.items.map((row) => (
                        <tr key={row.conversationId}>
                          <td className={TD}>
                            <CounterpartCell counterpart={row.supervisee} />
                          </td>
                          <td className={TD}>
                            <CounterpartCell counterpart={row.supervisor} />
                          </td>
                          <td className={`${TD} text-right tabular-nums`}>{formatCount(row.messagesInPeriod)}</td>
                          <td className={TD}>{formatDateTime(row.lastMessageAt, "—")}</td>
                          <td className={TD}>
                            {row.latestHireRequest ? (
                              <div className="flex items-center gap-2">
                                <HireStatusBadge status={row.latestHireRequest.status} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(row.latestHireRequest.createdAt)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className={`${TD} text-right`}>
                            <button
                              type="button"
                              onClick={() =>
                                setTimelineFor({
                                  id: row.conversationId,
                                  title: `${row.supervisee?.name || "Supervisee"} and ${row.supervisor?.name || "supervisor"}`,
                                })
                              }
                              className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                            >
                              View timeline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {overview.noHireConversations.total > overview.noHireConversations.items.length && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Showing the {overview.noHireConversations.items.length} busiest of{" "}
                    {formatCount(overview.noHireConversations.total)}.
                  </p>
                )}
              </>
            )}
          </SectionCard>
        </div>
      )}

      <ConversationTimelineModal
        conversationId={timelineFor?.id ?? null}
        title={timelineFor?.title ?? ""}
        onClose={() => setTimelineFor(null)}
      />
    </div>
  );
}
