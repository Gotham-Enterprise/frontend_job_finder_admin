"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { getNewsletters, deleteNewsletters, Newsletter } from "@/services/api/newsLetter";
import Pagination from "../../../../tables/Pagination";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/context/ToastContext";

const NewsLetterTab = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    newsletterId: "",
    isDeleting: false,
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
    // TODO: Implement publish functionality
    console.log("Publish newsletter:", id);
    setOpenDropdownId(null);
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No email templates found</p>
        <p className="text-gray-400 text-sm mt-1">Create your first email template to get started</p>
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
                            Edit
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
    </div>
  );
};

export default NewsLetterTab;
