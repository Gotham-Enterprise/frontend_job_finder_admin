"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useNewsletters,
  useDeleteNewsletter,
  useSendNewsletterNow,
  useCancelSchedule,
  useDuplicateNewsletter,
} from "@/services/hooks/useNewsletter";
import { PreviewModal } from "@/components/admin/newsletter/builder/PreviewModal";
import type { EmailBlock } from "@/components/admin/newsletter/builder/utils/blockTypes";
import { Newsletter } from "@/services/api/newsletter";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";

const STATUS_TABS = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
];

const TABLE_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "subject", label: "Subject" },
  { key: "audience", label: "Audience" },
  { key: "status", label: "Status" },
  { key: "schedule", label: "Scheduled / Sent" },
  { key: "recipients", label: "Recipients" },
  { key: "actions", label: "Actions" },
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

export default function NewslettersPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const limit = 10;

  const { data, isLoading, refetch } = useNewsletters(
    page,
    limit,
    activeStatus
  );
  const deleteMutation = useDeleteNewsletter();
  const sendNowMutation = useSendNewsletterNow();
  const cancelScheduleMutation = useCancelSchedule();
  const duplicateMutation = useDuplicateNewsletter();

  const newsletters = data?.data ?? [];
  const meta = data?.metaData;

  const handleTabChange = (status: string | undefined) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handleDelete = async (newsletter: Newsletter) => {
    if (
      !confirm(
        `Are you sure you want to delete "${newsletter.title}"? This cannot be undone.`
      )
    )
      return;
    await deleteMutation.mutateAsync(newsletter.id);
  };

  const handleSendNow = async (newsletter: Newsletter) => {
    if (
      !confirm(
        `Send "${newsletter.title}" to ${audienceLabel(newsletter.targetAudience)} now?`
      )
    )
      return;
    await sendNowMutation.mutateAsync(newsletter.id);
  };

  const handleCancelSchedule = async (newsletter: Newsletter) => {
    if (!confirm(`Cancel the scheduled send for "${newsletter.title}"?`))
      return;
    await cancelScheduleMutation.mutateAsync(newsletter.id);
  };

  const handleDuplicate = async (newsletter: Newsletter) => {
    await duplicateMutation.mutateAsync(newsletter.id);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Newsletters
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and send email newsletters to your users
          </p>
        </div>
        <Link href="/admin/newsletters/create">
          <Button variant="default" size="default">
            + New Newsletter
          </Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab.value
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeading columns={TABLE_COLUMNS} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={7}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Loading...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : newsletters.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={7}>
                    <p className="text-gray-500 dark:text-gray-400">
                      No newsletters found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[180px] truncate">
                      {newsletter.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                      {newsletter.subject}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {audienceLabel(newsletter.targetAudience)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        color={statusBadgeColor(newsletter.status)}
                        variant="light"
                        size="sm"
                      >
                        {newsletter.status.charAt(0).toUpperCase() +
                          newsletter.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                      {newsletter.status === "scheduled"
                        ? formatDate(newsletter.scheduledAt)
                        : newsletter.status === "sent"
                          ? formatDate(newsletter.sentAt)
                          : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 text-center">
                      {newsletter.recipientCount ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Preview is available for all statuses */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewNewsletter(newsletter)}
                        >
                          Preview
                        </Button>

                        {/* View/detail is always available for sent */}
                        {["sent", "failed", "sending"].includes(
                          newsletter.status
                        ) && (
                          <Link href={`/admin/newsletters/${newsletter.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        )}

                        {/* Edit available only for drafts */}
                        {newsletter.status === "draft" && (
                          <Link
                            href={`/admin/newsletters/${newsletter.id}/edit`}
                          >
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}

                        {/* Send Now for drafts and failed */}
                        {["draft", "failed"].includes(newsletter.status) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSendNow(newsletter)}
                            disabled={sendNowMutation.isPending}
                          >
                            Send Now
                          </Button>
                        )}

                        {/* Schedule for drafts */}
                        {newsletter.status === "draft" && (
                          <Link
                            href={`/admin/newsletters/${newsletter.id}/edit?action=schedule`}
                          >
                            <Button variant="secondary" size="sm">
                              Schedule
                            </Button>
                          </Link>
                        )}

                        {/* Cancel schedule for scheduled */}
                        {newsletter.status === "scheduled" && (
                          <>
                            <Link href={`/admin/newsletters/${newsletter.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleCancelSchedule(newsletter)}
                              disabled={cancelScheduleMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {/* Delete for drafts and failed */}
                        {["draft", "failed"].includes(newsletter.status) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(newsletter)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        )}

                        {/* Duplicate all statuses */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(newsletter)}
                          disabled={duplicateMutation.isPending}
                        >
                          Duplicate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {meta.totalCount} total newsletters
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!meta.hasPreviousPage}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <PreviewModal
        isOpen={!!previewNewsletter}
        onClose={() => setPreviewNewsletter(null)}
        blocks={(previewNewsletter?.builderBlocks as EmailBlock[]) ?? []}
        subject={previewNewsletter?.subject ?? ""}
        showHeader={previewNewsletter?.showHeader ?? true}
        showFooter={previewNewsletter?.showFooter ?? true}
      />
    </div>
  );
}
