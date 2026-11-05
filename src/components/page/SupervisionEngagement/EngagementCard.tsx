"use client";
import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { useSupervisionEngagement } from "@/services/hooks/useSupervisionEngagement";
import { formatDateTime } from "@/services/utils/dateUtils";
import ConversationTimelineModal from "./ConversationTimelineModal";
import {
  CounterpartCell,
  EmptyRow,
  HIRE_KIND_LABELS,
  HireStatusBadge,
  SubHeading,
  TD,
  TH,
  humanizeStatus,
  type BadgeColor,
} from "./shared";
import type {
  EngagementConnectionRequest,
  EngagementHire,
  EngagementRole,
} from "@/services/types/supervisionEngagement";

interface EngagementCardProps {
  /** Which admin page this card is on — picks the backend endpoint. */
  role: EngagementRole;
  userId: string;
}

const CONNECTION_STATUS_COLORS: Record<string, BadgeColor> = {
  APPROVED: "success",
  PENDING: "warning",
  DECLINED: "light",
  CANCELED: "light",
};

/** Registered account when there is one, else the public visitor's typed name/email. */
function ConnectionRequesterCell({ request }: { request: EngagementConnectionRequest }) {
  if (request.counterpart || !request.guest) return <CounterpartCell counterpart={request.counterpart} />;
  return (
    <div className="min-w-0">
      <span className="font-medium text-gray-900 dark:text-white">{request.guest.name || request.guest.email}</span>
      <div className="text-xs text-gray-500 dark:text-gray-400">Public visitor · {request.guest.email}</div>
    </div>
  );
}

/** The date the request was answered, when it was. */
function connectionAnsweredAt(request: EngagementConnectionRequest): string | null {
  return request.approvedAt ?? request.declinedAt ?? null;
}

/** The date the hire left the active states, when it did. */
function hireEndedAt(hire: EngagementHire): string | null {
  return hire.completedAt ?? hire.canceledAt ?? hire.rejectedAt ?? null;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

/**
 * Admin Engagement Analytics: messaging, hiring and connection-request
 * activity for one supervisor or supervisee, with a per-conversation message
 * timeline. Counts and timestamps only — message content is never fetched.
 */
export default function EngagementCard({ role, userId }: EngagementCardProps) {
  const { data, isLoading, error, refetch, isFetching } = useSupervisionEngagement(role, userId);
  const engagement = data?.success ? data.data : null;
  const [timelineFor, setTimelineFor] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Engagement
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Messages, hires, and connection requests. Message content is not shown, and automatic system messages are not counted.
        </p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading engagement…</p>
        ) : error || !engagement ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-error-600 dark:text-error-400">Couldn&apos;t load engagement data.</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-sm font-medium text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              <Stat label="Messages Sent" value={engagement.messages.sent} />
              <Stat label="Messages Received" value={engagement.messages.received} />
              <Stat label="Conversations" value={engagement.messages.conversations} />
              <Stat label="Current Hires" value={engagement.hires.current} />
              <Stat label="Total Hires" value={engagement.hires.total} />
              <Stat
                label="Last Message"
                value={
                  <span className="text-sm font-medium">
                    {formatDateTime(engagement.messages.lastMessageAt, "None yet")}
                  </span>
                }
              />
            </div>

            <section>
              <SubHeading>
                Hires ({engagement.hires.total})
              </SubHeading>
              {engagement.hires.items.length === 0 ? (
                <EmptyRow>No hires yet.</EmptyRow>
              ) : (
                <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className={TH}>{role === "SUPERVISOR" ? "Supervisee" : "Supervisor"}</th>
                        <th className={TH}>Type</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>Requested</th>
                        <th className={TH}>Accepted</th>
                        <th className={TH}>Ended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {engagement.hires.items.map((hire) => (
                        <tr key={hire.id}>
                          <td className={TD}>
                            <CounterpartCell counterpart={hire.counterpart} />
                          </td>
                          <td className={TD}>{HIRE_KIND_LABELS[hire.kind]}</td>
                          <td className={TD}>
                            <HireStatusBadge status={hire.status} />
                          </td>
                          <td className={TD}>{formatDateTime(hire.createdAt, "—")}</td>
                          <td className={TD}>{formatDateTime(hire.acceptedAt, "—")}</td>
                          <td className={TD}>{formatDateTime(hireEndedAt(hire), "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <SubHeading>Conversations ({engagement.messages.conversations})</SubHeading>
              {engagement.conversations.length === 0 ? (
                <EmptyRow>No conversations yet.</EmptyRow>
              ) : (
                <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className={TH}>With</th>
                        <th className={`${TH} text-right`}>Sent</th>
                        <th className={`${TH} text-right`}>Received</th>
                        <th className={TH}>First Message</th>
                        <th className={TH}>Last Message</th>
                        <th className={TH}>Hire</th>
                        <th className={TH}>
                          <span className="sr-only">Timeline</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {engagement.conversations.map((conversation) => (
                        <tr key={conversation.id}>
                          <td className={TD}>
                            <CounterpartCell counterpart={conversation.counterpart} />
                          </td>
                          <td className={`${TD} text-right tabular-nums`}>{conversation.messagesSent}</td>
                          <td className={`${TD} text-right tabular-nums`}>{conversation.messagesReceived}</td>
                          <td className={TD}>{formatDateTime(conversation.firstMessageAt, "—")}</td>
                          <td className={TD}>{formatDateTime(conversation.lastMessageAt, "—")}</td>
                          <td className={TD}>
                            {conversation.hire ? (
                              <HireStatusBadge status={conversation.hire.status} />
                            ) : (
                              <span className="text-gray-400">No hire</span>
                            )}
                          </td>
                          <td className={`${TD} text-right`}>
                            <button
                              type="button"
                              disabled={conversation.totalMessages === 0}
                              onClick={() =>
                                setTimelineFor({
                                  id: conversation.id,
                                  title: `With ${conversation.counterpart?.name || conversation.counterpart?.email || "unknown user"}`,
                                })
                              }
                              className="text-sm font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline dark:text-brand-400"
                            >
                              View timeline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <SubHeading>
                Connection Requests ({engagement.connectionRequests.total}) ·{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  {engagement.connectionRequests.sent} sent, {engagement.connectionRequests.received} received
                </span>
              </SubHeading>
              {engagement.connectionRequests.items.length === 0 ? (
                <EmptyRow>No connection requests.</EmptyRow>
              ) : (
                <div className="relative overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th className={TH}>Direction</th>
                        <th className={TH}>With</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>Sent</th>
                        <th className={TH}>Answered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {engagement.connectionRequests.items.map((request) => (
                        <tr key={request.id}>
                          <td className={TD}>{request.direction === "SENT" ? "Sent" : "Received"}</td>
                          <td className={TD}>
                            <ConnectionRequesterCell request={request} />
                          </td>
                          <td className={TD}>
                            <Badge size="sm" color={CONNECTION_STATUS_COLORS[request.status] ?? "light"}>
                              {humanizeStatus(request.status)}
                            </Badge>
                          </td>
                          <td className={TD}>{formatDateTime(request.createdAt, "—")}</td>
                          <td className={TD}>{formatDateTime(connectionAnsweredAt(request), "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <ConversationTimelineModal
        conversationId={timelineFor?.id ?? null}
        title={timelineFor?.title ?? ""}
        onClose={() => setTimelineFor(null)}
      />
    </div>
  );
}
