"use client";
import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
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
import { useContactLists } from "@/services/hooks/useContacts";
import type { ContactList } from "@/services/api/contacts";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

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

const resolveAudienceLabel = (newsletter: Newsletter, lists: ContactList[]) => {
  if (Array.isArray(newsletter.listIds) && newsletter.listIds.length > 0) {
    const names = newsletter.listIds
      .map((id) => lists.find((l) => l.id === id)?.name)
      .filter(Boolean) as string[];
    return names.length > 0 ? names.join(", ") : `${newsletter.listIds.length} list(s)`;
  }
  return "All Users";
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
  const [activeStatus, setActiveStatus] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const buttonRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);
  const limit = 10;

  const { data, isLoading, refetch } = useNewsletters(
    page,
    limit,
    activeStatus
  );
  const { data: listsData } = useContactLists();
  const deleteMutation = useDeleteNewsletter();
  const sendNowMutation = useSendNewsletterNow();
  const cancelScheduleMutation = useCancelSchedule();
  const duplicateMutation = useDuplicateNewsletter();

  const newsletters = data?.data ?? [];
  const meta = data?.metaData;
  const availableLists: ContactList[] = listsData?.data ?? [];

  const handleTabChange = (status: string | undefined) => {
    setActiveStatus(status);
    setPage(1);
    setOpenDropdown(null);
  };

  const handleDelete = (newsletter: Newsletter) => {
    setConfirmDialog({
      title: "Delete Newsletter",
      message: `Are you sure you want to delete "${newsletter.title}"? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutateAsync(newsletter.id),
    });
  };

  const handleSendNow = (newsletter: Newsletter) => {
    setConfirmDialog({
      title: "Send Newsletter",
      message: `Send "${newsletter.title}" to ${resolveAudienceLabel(newsletter, availableLists)} now?`,
      confirmText: "Send Now",
      onConfirm: () => sendNowMutation.mutateAsync(newsletter.id),
    });
  };

  const handleCancelSchedule = (newsletter: Newsletter) => {
    setConfirmDialog({
      title: "Cancel Schedule",
      message: `Cancel the scheduled send for "${newsletter.title}"?`,
      confirmText: "Cancel Schedule",
      onConfirm: () => cancelScheduleMutation.mutateAsync(newsletter.id),
    });
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
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 w-[160px] max-w-[160px]">
                      <div
                        className="truncate"
                        title={resolveAudienceLabel(newsletter, availableLists)}
                      >
                        {resolveAudienceLabel(newsletter, availableLists)}
                      </div>
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
                      <div
                        className="relative inline-block"
                        ref={(el) => {
                          if (el) buttonRefs.current.set(newsletter.id, el);
                          else buttonRefs.current.delete(newsletter.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="!h-8 !w-8 dropdown-toggle"
                          onClick={() => {
                            if (openDropdown === newsletter.id) {
                              setOpenDropdown(null);
                            } else {
                              setOpenDropdown(newsletter.id);
                            }
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        <Dropdown
                          isOpen={openDropdown === newsletter.id}
                          onClose={() => setOpenDropdown(null)}
                          anchorEl={buttonRefs.current.get(newsletter.id) ?? null}
                          className="min-w-44"
                        >
                          {/* Preview — all statuses */}
                          <DropdownItem
                            tag="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              setPreviewNewsletter(newsletter);
                            }}
                            className="flex items-center gap-2"
                          >
                            Preview
                          </DropdownItem>

                          {/* View — sent, failed, sending, scheduled */}
                          {["sent", "failed", "sending", "scheduled"].includes(
                            newsletter.status
                          ) && (
                            <DropdownItem
                              tag="a"
                              href={`/admin/newsletters/${newsletter.id}`}
                              className="flex items-center gap-2"
                            >
                              View
                            </DropdownItem>
                          )}

                          {/* Edit — draft only */}
                          {newsletter.status === "draft" && (
                            <DropdownItem
                              tag="a"
                              href={`/admin/newsletters/${newsletter.id}/edit`}
                              className="flex items-center gap-2"
                            >
                              Edit
                            </DropdownItem>
                          )}

                          {/* Send Now — draft, failed */}
                          {["draft", "failed"].includes(newsletter.status) && (
                            <DropdownItem
                              tag="button"
                              onClick={() => {
                                setOpenDropdown(null);
                                handleSendNow(newsletter);
                              }}
                              className="flex items-center gap-2"
                            >
                              Send Now
                            </DropdownItem>
                          )}

                          {/* Schedule — draft only */}
                          {newsletter.status === "draft" && (
                            <DropdownItem
                              tag="a"
                              href={`/admin/newsletters/${newsletter.id}/edit?action=schedule`}
                              className="flex items-center gap-2"
                            >
                              Schedule
                            </DropdownItem>
                          )}

                          {/* Duplicate — all statuses */}
                          <DropdownItem
                            tag="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              handleDuplicate(newsletter);
                            }}
                            className="flex items-center gap-2"
                          >
                            Duplicate
                          </DropdownItem>

                          {/* Divider before destructive actions */}
                          {(["draft", "failed"].includes(newsletter.status) ||
                            newsletter.status === "scheduled") && (
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                          )}

                          {/* Cancel Schedule — scheduled only */}
                          {newsletter.status === "scheduled" && (
                            <DropdownItem
                              tag="button"
                              onClick={() => {
                                setOpenDropdown(null);
                                handleCancelSchedule(newsletter);
                              }}
                              className="flex items-center gap-2 text-warning-600"
                            >
                              Cancel Schedule
                            </DropdownItem>
                          )}

                          {/* Delete — draft, failed */}
                          {["draft", "failed"].includes(newsletter.status) && (
                            <DropdownItem
                              tag="button"
                              onClick={() => {
                                setOpenDropdown(null);
                                handleDelete(newsletter);
                              }}
                              className="flex items-center gap-2 text-error-600"
                            >
                              Delete
                            </DropdownItem>
                          )}
                        </Dropdown>
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
                onClick={() => {
                  setOpenDropdown(null);
                  setPage((p) => Math.max(p - 1, 1));
                }}
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
                onClick={() => {
                  setOpenDropdown(null);
                  setPage((p) => p + 1);
                }}
                disabled={!meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog !== null}
        onClose={() => setConfirmDialog(null)}
        onConfirm={async () => {
          if (confirmDialog) await confirmDialog.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
        title={confirmDialog?.title ?? ""}
        message={confirmDialog?.message ?? ""}
        confirmText={confirmDialog?.confirmText ?? "Confirm"}
        cancelText="Cancel"
        isLoading={deleteMutation.isPending || sendNowMutation.isPending || cancelScheduleMutation.isPending}
      />

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
