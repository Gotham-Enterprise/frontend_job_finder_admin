"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { getNewsletters, Newsletter, updateNewsletter } from "@/services/api/newsLetter";
import Pagination from "../../../../tables/Pagination";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

const DraftsTab = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Publish confirmation dialog state
  const [publishDialog, setPublishDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    isPublishing: false,
  });

  // Archive confirmation dialog state
  const [archiveDialog, setArchiveDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    isArchiving: false,
  });

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNewsletters("DRAFT", currentPage, itemsPerPage);

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

  const handleEdit = (newsletterId: string) => {
    router.push(`/admin/news-letter/edit/${newsletterId}`);
    setOpenDropdownId(null);
  };

  const handlePublish = (id: string) => {
    const newsletter = newsletters.find((n) => n.id === id);
    if (!newsletter) return;

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
      // Update newsletter status to SENT
      await updateNewsletter(publishDialog.newsletter.id, {
        ...publishDialog.newsletter,
        status: "SENT",
      });

      // Refresh the list
      const response = await getNewsletters("DRAFT", currentPage, itemsPerPage);
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

  const handleArchive = (id: string) => {
    const newsletter = newsletters.find((n) => n.id === id);
    if (!newsletter) return;

    setArchiveDialog({
      isOpen: true,
      newsletter: newsletter,
      isArchiving: false,
    });
    setOpenDropdownId(null);
  };

  const confirmArchive = async () => {
    if (!archiveDialog.newsletter) return;

    setArchiveDialog((prev) => ({ ...prev, isArchiving: true }));

    try {
      // Update newsletter status to ARCHIVED
      await updateNewsletter(archiveDialog.newsletter.id, {
        ...archiveDialog.newsletter,
        status: "ARCHIVED",
      });

      console.log("✅ Newsletter archived successfully:", archiveDialog.newsletter.id);

      // Refresh the list
      const response = await getNewsletters("DRAFT", currentPage, itemsPerPage);
      setNewsletters(response.data);
      setTotalPages(response.metaData.totalPages);

      // Show success message
      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter archived successfully!",
      });

      // Close dialog
      setArchiveDialog({ isOpen: false, newsletter: null, isArchiving: false });
    } catch (err) {
      console.error("❌ Failed to archive newsletter:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to archive newsletter. Please try again.",
      });
      setArchiveDialog((prev) => ({ ...prev, isArchiving: false }));
    }
  };

  const cancelArchive = () => {
    setArchiveDialog({ isOpen: false, newsletter: null, isArchiving: false });
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
            <p>Email Preview - Draft</p>
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No draft newsletters found</p>
        <p className="text-gray-400 text-sm mt-1">Create a new newsletter to see it here</p>
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
              Delivered
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
            >
              Click Rate
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
              Published / Send Date
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
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">Draft</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">-</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {formatDate(newsletter.updatedAt)}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                Not Published
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
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1" role="menu">
                        <button
                          onClick={() => handleEdit(newsletter.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
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
                        <button
                          onClick={() => handlePublish(newsletter.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                          Publish
                        </button>
                        <button
                          onClick={() => handleArchive(newsletter.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
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

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={publishDialog.isOpen}
        onClose={cancelPublish}
        title="Publish Newsletter"
        message={`Are you sure you want to publish "${publishDialog.newsletter?.subject}"? This will make it available to your audience.`}
        confirmText={publishDialog.isPublishing ? "Publishing..." : "Publish"}
        cancelText="Cancel"
        onConfirm={confirmPublish}
        onCancel={cancelPublish}
        isLoading={publishDialog.isPublishing}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={archiveDialog.isOpen}
        onClose={cancelArchive}
        title="Archive Newsletter"
        message={`Are you sure you want to archive "${archiveDialog.newsletter?.subject}"? You can restore it later from the Archived tab.`}
        confirmText={archiveDialog.isArchiving ? "Archiving..." : "Archive"}
        cancelText="Cancel"
        onConfirm={confirmArchive}
        onCancel={cancelArchive}
        isLoading={archiveDialog.isArchiving}
      />
    </div>
  );
};

export default DraftsTab;
