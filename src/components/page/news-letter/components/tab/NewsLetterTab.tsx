"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import {
  getNewsletters,
  deleteNewsletters,
  Newsletter,
  bulkPublishNewsletters,
  bulkScheduleNewsletters,
} from "@/services/api/newsLetter";
import Pagination from "../../../../tables/Pagination";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import Checkbox from "@/components/form/input/Checkbox";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/ToastContext";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

interface NewsLetterTabProps {
  selectedNewsletters?: string[];
  setSelectedNewsletters?: React.Dispatch<React.SetStateAction<string[]>>;
  setBulkActionHandlers?: React.Dispatch<
    React.SetStateAction<{
      onBulkPublish?: () => void;
      onBulkDelete?: () => void;
      onBulkSchedule?: () => void;
      isBulkActionLoading?: boolean;
    }>
  >;
  setSelectedNewslettersData?: React.Dispatch<React.SetStateAction<any[]>>;
}

const NewsLetterTab: React.FC<NewsLetterTabProps> = ({
  selectedNewsletters: externalSelectedNewsletters,
  setSelectedNewsletters: externalSetSelectedNewsletters,
  setBulkActionHandlers,
  setSelectedNewslettersData,
}) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Use external state if provided, otherwise use internal state
  const [internalSelectedNewsletters, setInternalSelectedNewsletters] = useState<string[]>([]);
  const selectedNewsletters = externalSelectedNewsletters ?? internalSelectedNewsletters;
  const setSelectedNewsletters = externalSetSelectedNewsletters ?? setInternalSelectedNewsletters;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    newsletterId: "",
    isDeleting: false,
  });

  // Publish confirmation dialog state
  const [publishDialog, setPublishDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    isPublishing: false,
  });

  // Bulk action loading state
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Bulk delete confirmation dialog state
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    isOpen: false,
    isDeleting: false,
  });

  // Schedule dialog for bulk action
  const [scheduleDialog, setScheduleDialog] = useState({
    isOpen: false,
    scheduledAt: "",
    scheduledTimezone: "America/New_York",
    isScheduling: false,
  });

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNewsletters(undefined, currentPage, itemsPerPage);

        // Log content details
        response.data.forEach((n, index) => {
          console.log(`Newsletter ${index + 1} - ${n.subject}:`, {
            hasContent: !!n.content,
            contentLength: n.content?.length || 0,
            contentPreview: n.content?.substring(0, 100) || "No content",
            isTemplate: n.isTemplate,
          });
        });

        setNewsletters(response.data);
        setTotalPages(response.metaData.totalPages);
      } catch (err) {
        console.error("❌ Failed to fetch newsletters:", err);
        setError("Failed to load newsletters");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [currentPage]);

  // Computed values for checkbox state
  const allSelected = newsletters.length > 0 && selectedNewsletters.length === newsletters.length;
  const someSelected = selectedNewsletters.length > 0 && !allSelected;

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNewsletters(newsletters.map((n) => n.id));
    } else {
      setSelectedNewsletters([]);
    }
  };

  const handleSelectNewsletter = (newsletterId: string, checked: boolean) => {
    if (checked) {
      setSelectedNewsletters([...selectedNewsletters, newsletterId]);
    } else {
      setSelectedNewsletters(selectedNewsletters.filter((id) => id !== newsletterId));
    }
  };

  // Pass bulk action handlers to parent
  useEffect(() => {
    if (setBulkActionHandlers) {
      setBulkActionHandlers({
        onBulkPublish: handleBulkPublish,
        onBulkDelete: handleBulkDelete,
        onBulkSchedule: () => setScheduleDialog({ ...scheduleDialog, isOpen: true }),
        isBulkActionLoading,
      });
    }

    // Pass selected newsletters data to parent
    if (setSelectedNewslettersData) {
      const selectedData = newsletters.filter((n) => selectedNewsletters.includes(n.id));
      setSelectedNewslettersData(selectedData);
    }
  }, [
    setBulkActionHandlers,
    setSelectedNewslettersData,
    isBulkActionLoading,
    selectedNewsletters,
    newsletters,
    scheduleDialog,
  ]);

  // Bulk action handlers
  const handleBulkAction = async (action: string) => {
    if (selectedNewsletters.length === 0) return;

    switch (action) {
      case "publish":
        await handleBulkPublish();
        break;
      case "schedule":
        setScheduleDialog({ ...scheduleDialog, isOpen: true });
        break;
      case "delete":
        await handleBulkDelete();
        break;
      default:
        break;
    }
  };

  const handleBulkPublish = async () => {
    try {
      setIsBulkActionLoading(true);
      await bulkPublishNewsletters(selectedNewsletters);
      addToast({
        variant: "success",
        title: "Success",
        message: `Successfully published ${selectedNewsletters.length} newsletter(s)`,
      });
      setSelectedNewsletters([]);
      // Refresh the list
      const response = await getNewsletters(undefined, currentPage, itemsPerPage);
      setNewsletters(response.data);
    } catch (error: any) {
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to publish newsletters",
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkSchedule = async () => {
    if (!scheduleDialog.scheduledAt) {
      addToast({
        variant: "error",
        title: "Error",
        message: "Please select a date and time",
      });
      return;
    }

    try {
      setScheduleDialog({ ...scheduleDialog, isScheduling: true });
      await bulkScheduleNewsletters(selectedNewsletters, scheduleDialog.scheduledAt, scheduleDialog.scheduledTimezone);
      addToast({
        variant: "success",
        title: "Success",
        message: `Successfully scheduled ${selectedNewsletters.length} newsletter(s)`,
      });
      setSelectedNewsletters([]);
      setScheduleDialog({ isOpen: false, scheduledAt: "", scheduledTimezone: "America/New_York", isScheduling: false });
      // Refresh the list
      const response = await getNewsletters(undefined, currentPage, itemsPerPage);
      setNewsletters(response.data);
    } catch (error: any) {
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to schedule newsletters",
      });
    } finally {
      setScheduleDialog({ ...scheduleDialog, isScheduling: false });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNewsletters.length === 0) {
      addToast({
        variant: "error",
        title: "No Selection",
        message: "Please select at least one newsletter to delete.",
      });
      return;
    }

    // Open confirmation dialog
    setBulkDeleteDialog({
      isOpen: true,
      isDeleting: false,
    });
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    setIsBulkActionLoading(true);

    try {
      await deleteNewsletters(selectedNewsletters);
      addToast({
        variant: "success",
        title: "Success",
        message: `Successfully deleted ${selectedNewsletters.length} newsletter(s)`,
      });
      setSelectedNewsletters([]);
      // Refresh the list
      const response = await getNewsletters(undefined, currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Close dialog
      setBulkDeleteDialog({
        isOpen: false,
        isDeleting: false,
      });
    } catch (error: any) {
      addToast({
        variant: "error",
        title: "Error",
        message: error.message || "Failed to delete newsletters",
      });
      setBulkDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteDialog({
      isOpen: false,
      isDeleting: false,
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handlePreview = (newsletter: Newsletter) => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Preview</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f3f4f6;
          }
        </style>
      </head>
      <body>
        ${newsletter.content || "<p>No content available</p>"}
      </body>
      </html>
    `;

    // Create a Blob and open it in a new window
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const previewWindow = window.open(url, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");

    // Clean up the URL after a short delay
    if (previewWindow) {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    setOpenDropdownId(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/news-letter/edit/${id}`);
    setOpenDropdownId(null);
  };

  const handleArchive = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      newsletterId: id,
      isDeleting: false,
    });
    setOpenDropdownId(null);
  };

  const confirmArchive = async () => {
    setConfirmDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteNewsletters([confirmDialog.newsletterId]);
      console.log("✅ Newsletter archived successfully:", confirmDialog.newsletterId);

      // Refresh the list
      const response = await getNewsletters(undefined, currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Show success message
      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter archived successfully",
      });

      // Close dialog
      setConfirmDialog({ isOpen: false, newsletterId: "", isDeleting: false });
    } catch (err) {
      console.error("❌ Failed to archive newsletter:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to archive newsletter. Please try again.",
      });
      setConfirmDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelArchive = () => {
    setConfirmDialog({ isOpen: false, newsletterId: "", isDeleting: false });
  };

  const handlePublish = (id: string) => {
    const newsletter = newsletters.find((n) => n.id === id);
    if (!newsletter) return;

    // Show confirmation dialog for scheduled newsletters
    if (newsletter.status === "SCHEDULED") {
      setPublishDialog({
        isOpen: true,
        newsletter: newsletter,
        isPublishing: false,
      });
    } else {
      // For DRAFT newsletters, publish immediately
      confirmPublish(newsletter);
    }
    setOpenDropdownId(null);
  };

  const confirmPublish = async (newsletter: Newsletter) => {
    setPublishDialog((prev) => ({ ...prev, isPublishing: true }));

    try {
      // Import updateNewsletter from API
      const { updateNewsletter } = await import("@/services/api/newsLetter");

      // Update newsletter status to SENT
      await updateNewsletter(newsletter.id, {
        ...newsletter,
        status: "SENT",
      });

      console.log("✅ Newsletter published successfully:", newsletter.id);

      // Refresh the list
      const response = await getNewsletters(undefined, currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Show success message
      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter published successfully!",
      });

      // Close dialog
      setPublishDialog({ isOpen: false, newsletter: null, isPublishing: false });
    } catch (err) {
      console.error("❌ Failed to publish newsletter:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to publish newsletter. Please try again.",
      });
      setPublishDialog((prev) => ({ ...prev, isPublishing: false }));
    }
  };

  const cancelPublish = () => {
    setPublishDialog({ isOpen: false, newsletter: null, isPublishing: false });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <FullScreenSpinner isVisible={loading} message="Loading newsletters..." />

      {error ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12">
          <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No email templates found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first email template to get started</p>
        </div>
      ) : (
        <div className="max-w-full">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  <Checkbox checked={allSelected} onChange={(checked) => handleSelectAll(checked)} />
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  Email Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  From Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  Last Updated
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  Created Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {newsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <Checkbox
                      checked={selectedNewsletters.includes(newsletter.id)}
                      onChange={(checked) => handleSelectNewsletter(newsletter.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-900 text-sm dark:text-white/90">{newsletter.subject}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        newsletter.status === "SENT"
                          ? "bg-green-100 text-green-800"
                          : newsletter.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {newsletter.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.fromName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {formatDate(newsletter.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {formatDate(newsletter.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => toggleDropdown(newsletter.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === newsletter.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                          <div className="py-1" role="menu">
                            {/* Only show Edit button for DRAFT newsletters */}
                            {newsletter.status === "DRAFT" && (
                              <button
                                onClick={() => handleEdit(newsletter.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit Template
                              </button>
                            )}

                            <button
                              onClick={() => handlePreview(newsletter)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              Preview
                            </button>

                            {/* Only show Publish button for non-SENT newsletters */}
                            {newsletter.status !== "SENT" && (
                              <button
                                onClick={() => handlePublish(newsletter.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                  />
                                </svg>
                                Publish
                              </button>
                            )}

                            <button
                              onClick={() => handleArchive(newsletter.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                              Archive
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-end pr-3">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={confirmDialog.isOpen}
            onClose={cancelArchive}
            onConfirm={confirmArchive}
            onCancel={cancelArchive}
            title="Archive Newsletter"
            message="Are you sure you want to archive (delete) this newsletter? This action cannot be undone."
            confirmText="Archive"
            cancelText="Cancel"
            isLoading={confirmDialog.isDeleting}
          />

          {/* Publish Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={publishDialog.isOpen}
            onClose={cancelPublish}
            onConfirm={() => publishDialog.newsletter && confirmPublish(publishDialog.newsletter)}
            onCancel={cancelPublish}
            title="Publish Newsletter Now?"
            message={
              publishDialog.newsletter?.status === "SCHEDULED"
                ? `This newsletter is scheduled to be sent on ${
                    publishDialog.newsletter?.scheduledAt
                      ? new Date(publishDialog.newsletter.scheduledAt).toLocaleString()
                      : "a scheduled date"
                  }. Do you want to send it immediately instead?`
                : "Are you sure you want to publish this newsletter now?"
            }
            confirmText="Send Now"
            cancelText="Cancel"
            isLoading={publishDialog.isPublishing}
          />

          {/* Bulk Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={bulkDeleteDialog.isOpen}
            onClose={cancelBulkDelete}
            onConfirm={confirmBulkDelete}
            onCancel={cancelBulkDelete}
            title="Delete Multiple Newsletters?"
            message={`Are you sure you want to delete ${selectedNewsletters.length} newsletter${selectedNewsletters.length > 1 ? "s" : ""}? This action cannot be undone.`}
            confirmText={`Delete ${selectedNewsletters.length} Newsletter${selectedNewsletters.length > 1 ? "s" : ""}`}
            cancelText="Cancel"
            isLoading={bulkDeleteDialog.isDeleting}
          />

          {/* Schedule Dialog for Bulk Action */}
          <Modal
            isOpen={scheduleDialog.isOpen}
            onClose={() =>
              setScheduleDialog({
                isOpen: false,
                scheduledAt: "",
                scheduledTimezone: "America/New_York",
                isScheduling: false,
              })
            }
            isFullscreen={false}
            showCloseButton={true}
            className="max-w-lg rounded-lg shadow-xl"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule Newsletters</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      scheduleDialog.scheduledAt ? new Date(scheduleDialog.scheduledAt).toISOString().slice(0, 16) : ""
                    }
                    onChange={(e) => {
                      const localDate = new Date(e.target.value);
                      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
                      setScheduleDialog({ ...scheduleDialog, scheduledAt: utcDate.toISOString() });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setScheduleDialog({
                      isOpen: false,
                      scheduledAt: "",
                      scheduledTimezone: "America/New_York",
                      isScheduling: false,
                    })
                  }
                  disabled={scheduleDialog.isScheduling}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkSchedule}
                  disabled={scheduleDialog.isScheduling || !scheduleDialog.scheduledAt}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleDialog.isScheduling ? "Scheduling..." : "Schedule Newsletter"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default NewsLetterTab;
