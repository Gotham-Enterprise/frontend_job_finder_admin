"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useConversationTimeline } from "@/services/hooks/useSupervisionEngagement";
import { formatDateTime } from "@/services/utils/dateUtils";

interface ConversationTimelineModalProps {
  /** Conversation to show; null keeps the modal closed. */
  conversationId: string | null;
  /** Shown under the heading, e.g. "With Jane Doe". */
  title: string;
  onClose: () => void;
}

const TH = "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap";
const TD = "px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  FILE: "File",
};

/**
 * Admin Engagement Analytics (Phase 2): when each message in one conversation
 * was sent and read, and by whom. Message content is never fetched.
 */
export default function ConversationTimelineModal({
  conversationId,
  title,
  onClose,
}: ConversationTimelineModalProps) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [conversationId]);

  const { data, isLoading, isFetching, error, refetch } = useConversationTimeline(conversationId, page);
  const timeline = data?.success ? data.data : null;
  const totalPages = timeline?.pagination.totalPages ?? 1;

  return (
    <Modal
      isOpen={!!conversationId}
      onClose={onClose}
      isFullscreen={false}
      className="max-w-3xl mx-auto rounded-xl"
    >
      {/* Capped to the viewport: header and pagination stay put, only the rows scroll. */}
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800 md:max-h-[calc(100dvh-3rem)]">
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 pr-14">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Timeline</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{title}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Newest first. Message content is not shown, and automatic system messages are not listed.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading timeline…</p>
          ) : error || !timeline ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-error-600 dark:text-error-400">Couldn&apos;t load the timeline.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Try again
              </button>
            </div>
          ) : timeline.messages.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No messages in this conversation.</p>
          ) : (
            <div
              className={`relative min-h-0 flex-1 overflow-auto rounded-lg border border-gray-100 dark:border-gray-700 ${isFetching ? "opacity-60" : ""}`}
            >
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className={TH}>Sent</th>
                    <th className={TH}>From</th>
                    <th className={TH}>Type</th>
                    <th className={TH}>Read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {timeline.messages.map((message) => (
                    <tr key={message.id}>
                      <td className={TD}>{formatDateTime(message.sentAt, "—")}</td>
                      <td className={TD}>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {message.sender.name || "Unknown user"}
                        </div>
                        {message.sender.roleLabel && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{message.sender.roleLabel}</div>
                        )}
                      </td>
                      <td className={TD}>{MESSAGE_TYPE_LABELS[message.messageType] ?? message.messageType}</td>
                      <td className={TD}>
                        {message.readAt
                          ? formatDateTime(message.readAt, "—")
                          : message.isRead
                            ? "Read"
                            : <span className="text-gray-400">Not yet</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {timeline && timeline.pagination.total > 0 && (
          <div className="shrink-0 px-6 pb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span>
              {timeline.pagination.total} message{timeline.pagination.total === 1 ? "" : "s"} · Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isFetching}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isFetching}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
