"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { getNewsletters, Newsletter, updateNewsletter } from "@/services/api/newsLetter";
import Pagination from "../../../../tables/Pagination";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

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
    scheduledDate: new Date(),
    scheduledTime: "",
    isUpdating: false,
  });

  // Publish confirmation dialog state
  const [publishDialog, setPublishDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    isPublishing: false,
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

      // Extract time in HH:MM format for TimePicker
      const hours = scheduledDate.getHours().toString().padStart(2, "0");
      const minutes = scheduledDate.getMinutes().toString().padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      setEditScheduleDialog({
        isOpen: true,
        newsletter: newsletter,
        scheduledDate: scheduledDate,
        scheduledTime: timeStr,
        isUpdating: false,
      });
    } else {
      setEditScheduleDialog({
        isOpen: true,
        newsletter: newsletter,
        scheduledDate: new Date(),
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
    const [hours, minutes] = editScheduleDialog.scheduledTime.split(":");
    const scheduledDateTime = new Date(editScheduleDialog.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
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
        scheduledDate: new Date(),
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
      scheduledDate: new Date(),
      scheduledTime: "",
      isUpdating: false,
    });
  };

  const handlePublishClick = (newsletter: Newsletter) => {
    setPublishDialog({
      isOpen: true,
      newsletter: newsletter,
      isPublishing: false,
    });
    setOpenDropdownId(null);
  };

  const confirmPublish = async () => {
    if (!publishDialog.newsletter) return;

    setPublishDialog((prev) => ({ ...prev, isPublishing: true }));

    try {
      await updateNewsletter(publishDialog.newsletter.id, {
        ...publishDialog.newsletter,
        status: "SENT",
        scheduledAt: undefined, // Clear scheduled time when publishing immediately
      });

      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter published successfully!",
      });

      // Refresh the list
      const response = await getNewsletters("SCHEDULED", currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Close dialog
      setPublishDialog({
        isOpen: false,
        newsletter: null,
        isPublishing: false,
      });
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
    setPublishDialog({
      isOpen: false,
      newsletter: null,
      isPublishing: false,
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
                          onClick={() => handlePublishClick(newsletter)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Publish Now
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
        <style>
          {`
            /* Time Picker Styling for Edit Schedule Modal */
            .react-time-picker {
              width: 100%;
            }
            .react-time-picker__wrapper {
              border: 1px solid #d1d5db;
              border-radius: 0.5rem;
              padding: 0.625rem 1rem;
              width: 100%;
              display: flex;
              align-items: center;
            }
            .react-time-picker__wrapper:hover {
              border-color: #9ca3af;
            }
            .react-time-picker__wrapper:focus-within {
              outline: 2px solid #3b82f6;
              outline-offset: 2px;
              border-color: #3b82f6;
            }
            .react-time-picker__inputGroup {
              display: flex;
              align-items: center;
              gap: 0.25rem;
            }
            .react-time-picker__inputGroup__input {
              border: none;
              outline: none;
              font-size: 0.875rem;
              padding: 0.125rem;
            }
            .react-time-picker__inputGroup__divider,
            .react-time-picker__inputGroup__leadingZero {
              font-size: 0.875rem;
            }
            .react-time-picker__button {
              border: none;
              background: none;
              padding: 0.25rem;
            }
            .react-time-picker__button svg {
              width: 1.25rem;
              height: 1.25rem;
              stroke: #6b7280;
            }
            
            /* DatePicker Styling */
            .react-datepicker-popper {
              z-index: 9999 !important;
            }
            .react-datepicker__day--disabled {
              color: #d1d5db !important;
              cursor: not-allowed !important;
              pointer-events: none !important;
              opacity: 0.4 !important;
            }
            .react-datepicker__day--disabled:hover {
              background-color: transparent !important;
            }
            .react-datepicker__day--outside-month {
              color: #d1d5db !important;
              opacity: 0.4 !important;
            }
          `}
        </style>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Schedule</h3>
          {editScheduleDialog.newsletter && (
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Update the scheduled date and time for &quot;{editScheduleDialog.newsletter.subject}&quot;
            </p>
          )}

          <div className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <DatePicker
                selected={editScheduleDialog.scheduledDate}
                onChange={(date: Date | null) => {
                  if (date) {
                    setEditScheduleDialog((prev) => ({
                      ...prev,
                      scheduledDate: date,
                    }));
                  }
                }}
                minDate={new Date()}
                dateFormat="MM/dd/yyyy"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer dark:bg-gray-800 dark:text-white"
                calendarClassName="shadow-lg"
                showPopperArrow={false}
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
                disabled={editScheduleDialog.isUpdating}
              />
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <TimePicker
                onChange={(value) => {
                  setEditScheduleDialog((prev) => ({
                    ...prev,
                    scheduledTime: value || "",
                  }));
                }}
                value={editScheduleDialog.scheduledTime}
                disableClock={true}
                clearIcon={null}
                format="h:mm a"
                className="w-full"
                disabled={editScheduleDialog.isUpdating}
                required
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

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={publishDialog.isOpen}
        onClose={cancelPublish}
        onConfirm={confirmPublish}
        onCancel={cancelPublish}
        title="Publish Newsletter Now?"
        message={
          publishDialog.newsletter
            ? `This newsletter is scheduled for ${
                publishDialog.newsletter.scheduledAt
                  ? new Date(publishDialog.newsletter.scheduledAt).toLocaleString()
                  : "later"
              }. Do you want to publish it immediately instead?`
            : "Are you sure you want to publish this newsletter now?"
        }
        confirmText="Publish Now"
        cancelText="Cancel"
        isLoading={publishDialog.isPublishing}
      />
    </div>
  );
};

export default ScheduleTab;
