"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { getNewsletters, Newsletter, updateNewsletter } from "@/services/api/newsLetter";
import Pagination from "../../../../tables/Pagination";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/ToastContext";

const ScheduleTab = () => {
  const { addToast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Edit schedule dialog state
  const [editScheduleDialog, setEditScheduleDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    scheduledDate: "",
    scheduledTime: "",
    isUpdating: false,
  });

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNewsletters("SCHEDULED", currentPage, itemsPerPage);

        setNewsletters(response.data);
        setTotalPages(response.metaData.totalPages);
      } catch (err) {
        console.error("Failed to fetch newsletters:", err);
        setError("Failed to load newsletters");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [currentPage]);

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

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleEditSchedule = (newsletter: Newsletter) => {
    // Parse the existing scheduled date and time
    if (newsletter.scheduledAt) {
      const scheduledDate = new Date(newsletter.scheduledAt);
      const dateStr = scheduledDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = scheduledDate.toTimeString().slice(0, 5); // HH:MM

      setEditScheduleDialog({
        isOpen: true,
        newsletter: newsletter,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        isUpdating: false,
      });
    } else {
      setEditScheduleDialog({
        isOpen: true,
        newsletter: newsletter,
        scheduledDate: "",
        scheduledTime: "",
        isUpdating: false,
      });
    }
    setOpenDropdownId(null);
  };

  const handleUpdateSchedule = async () => {
    if (!editScheduleDialog.newsletter || !editScheduleDialog.scheduledDate || !editScheduleDialog.scheduledTime) {
      addToast({
        variant: "error",
        title: "Validation Error",
        message: "Please select both date and time",
      });
      return;
    }

    // Combine date and time into ISO string
    const scheduledDateTime = new Date(`${editScheduleDialog.scheduledDate}T${editScheduleDialog.scheduledTime}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      addToast({
        variant: "error",
        title: "Validation Error",
        message: "Scheduled time must be in the future",
      });
      return;
    }

    setEditScheduleDialog((prev) => ({ ...prev, isUpdating: true }));

    try {
      await updateNewsletter(editScheduleDialog.newsletter.id, {
        ...editScheduleDialog.newsletter,
        scheduledAt: scheduledDateTime.toISOString(),
      });

      addToast({
        variant: "success",
        title: "Success",
        message: "Schedule updated successfully!",
      });

      // Refresh the list
      const response = await getNewsletters("SCHEDULED", currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Close dialog
      setEditScheduleDialog({
        isOpen: false,
        newsletter: null,
        scheduledDate: "",
        scheduledTime: "",
        isUpdating: false,
      });
    } catch (err) {
      console.error("❌ Failed to update schedule:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to update schedule. Please try again.",
      });
      setEditScheduleDialog((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  const handleCancelEditSchedule = () => {
    setEditScheduleDialog({
      isOpen: false,
      newsletter: null,
      scheduledDate: "",
      scheduledTime: "",
      isUpdating: false,
    });
  };

  const handlePreview = (newsletter: Newsletter) => {
    const previewWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${newsletter.subject} - Email Preview</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: #f3f4f6;
            }
            .preview-header {
              background: white;
              padding: 16px 20px;
              margin: -20px -20px 20px -20px;
              border-bottom: 1px solid #e5e7eb;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .preview-header h1 {
              margin: 0;
              font-size: 18px;
              color: #111827;
              font-weight: 600;
            }
            .preview-header p {
              margin: 4px 0 0 0;
              font-size: 14px;
              color: #6b7280;
            }
            .email-content {
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h1>${newsletter.subject}</h1>
            <p>Email Preview - Scheduled</p>
          </div>
          <div class="email-content">
            ${newsletter.content || "<p>No content available</p>"}
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
    setOpenDropdownId(null);
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

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (newsletters.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No scheduled newsletters found</p>
        <p className="text-gray-400 text-sm mt-1">Schedule a newsletter to see it here</p>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <Table>
        {/* Table Header */}
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
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
              Scheduled Date
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
                <span className="font-medium text-gray-900 text-sm dark:text-white/90">{newsletter.subject}</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-start text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Scheduled
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {newsletter.fromName || "N/A"}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {formatDate(newsletter.updatedAt)}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {formatDateTime(newsletter.scheduledAt)}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                <div className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown(newsletter.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdownId === newsletter.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1" role="menu">
                        <button
                          onClick={() => handleEditSchedule(newsletter)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Edit Schedule
                        </button>
                        <button
                          onClick={() => handlePreview(newsletter)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
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

      {/* Edit Schedule Modal */}
      <Modal
        isOpen={editScheduleDialog.isOpen}
        onClose={handleCancelEditSchedule}
        isFullscreen={false}
        showCloseButton={true}
        className="max-w-lg rounded-lg shadow-xl"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Schedule</h3>
          {editScheduleDialog.newsletter && (
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Update the scheduled date and time for "{editScheduleDialog.newsletter.subject}"
            </p>
          )}

          <div className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={editScheduleDialog.scheduledDate}
                onChange={(e) =>
                  setEditScheduleDialog((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={editScheduleDialog.isUpdating}
              />
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={editScheduleDialog.scheduledTime}
                onChange={(e) =>
                  setEditScheduleDialog((prev) => ({
                    ...prev,
                    scheduledTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={editScheduleDialog.isUpdating}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEditSchedule}
              disabled={editScheduleDialog.isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateSchedule}
              disabled={editScheduleDialog.isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editScheduleDialog.isUpdating ? "Updating..." : "Update Schedule"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleTab;
