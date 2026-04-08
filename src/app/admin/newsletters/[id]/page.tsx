"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useNewsletter,
  useNewsletterLogs,
  useSendNewsletterNow,
  useCancelSchedule,
  useDuplicateNewsletter,
} from "@/services/hooks/useNewsletter";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";

const LOG_COLUMNS = [
  { key: "email", label: "Recipient Email" },
  { key: "status", label: "Status" },
  { key: "error", label: "Error" },
  { key: "sentAt", label: "Sent At" },
];

const statusBadgeColor = (
  status: string
): "warning" | "info" | "success" | "error" | "primary" => {
  switch (status) {
    case "draft":
      return "warning";
    case "scheduled":
      return "info";
    case "sending":
      return "primary";
    case "sent":
      return "success";
    case "failed":
      return "error";
    default:
      return "primary";
  }
};

const audienceLabel = (audience: string) => {
  switch (audience) {
    case "job-seeker":
      return "Job Seekers";
    case "employer":
      return "Employers";
    default:
      return "All Users";
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NewsletterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [logsPage, setLogsPage] = useState(1);

  const { data: newsletterData, isLoading: newsletterLoading } =
    useNewsletter(id);
  const { data: logsData, isLoading: logsLoading } = useNewsletterLogs(
    id,
    logsPage
  );
  const sendNowMutation = useSendNewsletterNow();
  const cancelScheduleMutation = useCancelSchedule();
  const duplicateMutation = useDuplicateNewsletter();

  const newsletter = newsletterData?.data;
  const logs = logsData?.data ?? [];
  const logsMeta = logsData?.metaData;

  if (newsletterLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Newsletter not found
      </div>
    );
  }

  const canSendNow = ["draft", "failed"].includes(newsletter.status);
  const canCancelSchedule = newsletter.status === "scheduled";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/newsletters"
        className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors"
      >
        ← Back to Newsletters
      </Link>

      {/* Details card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {newsletter.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created by {newsletter.creator?.firstName}{" "}
              {newsletter.creator?.lastName} · {formatDate(newsletter.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              color={statusBadgeColor(newsletter.status)}
              variant="light"
              size="md"
            >
              {newsletter.status.charAt(0).toUpperCase() +
                newsletter.status.slice(1)}
            </Badge>

            {canSendNow && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      `Send "${newsletter.title}" to ${audienceLabel(newsletter.targetAudience)} now?`
                    )
                  ) {
                    sendNowMutation.mutateAsync(id).then(() => {
                      router.refresh();
                    });
                  }
                }}
                disabled={sendNowMutation.isPending}
              >
                {sendNowMutation.isPending ? "Sending..." : "Send Now"}
              </Button>
            )}

            {canCancelSchedule && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      `Cancel the scheduled send for "${newsletter.title}"?`
                    )
                  ) {
                    cancelScheduleMutation.mutateAsync(id).then(() => {
                      router.push("/admin/newsletters");
                    });
                  }
                }}
                disabled={cancelScheduleMutation.isPending}
              >
                Cancel Schedule
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                duplicateMutation.mutateAsync(id).then((res) => {
                  router.push(`/admin/newsletters/${res.data.id}`);
                });
              }}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
            </Button>
          </div>
        </div>

        {/* Meta grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate">
              {newsletter.subject}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Audience</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
              {audienceLabel(newsletter.targetAudience)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recipients Reached
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
              {newsletter.recipientCount !== null
                ? newsletter.recipientCount.toLocaleString()
                : "—"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {newsletter.status === "scheduled"
                ? "Scheduled For"
                : "Sent At"}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
              {newsletter.status === "scheduled"
                ? formatDate(newsletter.scheduledAt)
                : formatDate(newsletter.sentAt)}
            </p>
          </div>
        </div>

        {/* Location filters */}
        {newsletter.filters &&
          ((newsletter.filters as any).country ||
            (newsletter.filters as any).state) && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Filters:
              </span>
              {(newsletter.filters as any).country && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Country: {(newsletter.filters as any).country}
                </span>
              )}
              {(newsletter.filters as any).state && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  State: {(newsletter.filters as any).state}
                </span>
              )}
            </div>
          )}
      </div>

      {/* Send Logs */}
      {["sent", "failed", "sending"].includes(newsletter.status) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Send Logs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Per-recipient delivery results
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeading columns={LOG_COLUMNS} />
              <TableBody>
                {logsLoading ? (
                  <TableRow>
                    <TableCell className="text-center py-8" colSpan={4}>
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Loading logs...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-8" colSpan={4}>
                      <p className="text-gray-500 dark:text-gray-400">
                        No send logs yet
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        {log.recipientEmail}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          color={log.status === "sent" ? "success" : "error"}
                          variant="light"
                          size="sm"
                        >
                          {log.status === "sent" ? "Sent" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm max-w-[200px] truncate">
                        {log.errorMessage ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                        {formatDate(log.sentAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Logs pagination */}
          {logsMeta && logsMeta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {logsMeta.totalCount} total entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogsPage((p) => Math.max(p - 1, 1))}
                  disabled={!logsMeta.hasPreviousPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {logsMeta.page} of {logsMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogsPage((p) => p + 1)}
                  disabled={!logsMeta.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
