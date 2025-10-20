"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../ui/table";
import { newsletterApi, Newsletter, bulkRestoreNewsletters } from "../../../../../services/api/newsLetter";
import Checkbox from "@/components/form/input/Checkbox";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/context/ToastContext";

const ArchivedTab = () => {
  const { addToast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk selection state
  const [selectedNewsletters, setSelectedNewsletters] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Dialog states
  const [restoreDialog, setRestoreDialog] = useState({
    isOpen: false,
    newsletter: null as Newsletter | null,
    isRestoring: false,
  });

  const [bulkRestoreDialog, setBulkRestoreDialog] = useState({
    isOpen: false,
    isRestoring: false,
  });

  useEffect(() => {
    fetchArchivedNewsletters();
  }, [page]);

  const fetchArchivedNewsletters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsletterApi.getArchivedNewsletters({
        page,
        limit: 10,
      });

      if (response.success) {
        setNewsletters(response.data);
        if (response.metaData) {
          setTotalPages(response.metaData.totalPages);
        }
      }
    } catch (err) {
      console.error("Error fetching archived newsletters:", err);
      setError("Failed to load archived newsletters");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNewsletters(newsletters.map((n) => n.id));
    } else {
      setSelectedNewsletters([]);
    }
  };

  const handleSelectNewsletter = (newsletterId: string, checked: boolean) => {
    if (checked) {
      setSelectedNewsletters((prev) => [...prev, newsletterId]);
    } else {
      setSelectedNewsletters((prev) => prev.filter((id) => id !== newsletterId));
    }
  };

  // Single restore handlers
  const handleRestoreClick = (newsletter: Newsletter) => {
    setRestoreDialog({
      isOpen: true,
      newsletter: newsletter,
      isRestoring: false,
    });
  };

  const confirmRestore = async () => {
    if (!restoreDialog.newsletter) return;

    setRestoreDialog((prev) => ({ ...prev, isRestoring: true }));

    try {
      await bulkRestoreNewsletters([restoreDialog.newsletter.id]);

      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter restored successfully!",
      });

      // Refresh the list
      fetchArchivedNewsletters();

      // Close dialog
      setRestoreDialog({
        isOpen: false,
        newsletter: null,
        isRestoring: false,
      });
    } catch (err) {
      console.error("❌ Failed to restore newsletter:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to restore newsletter. Please try again.",
      });
      setRestoreDialog((prev) => ({ ...prev, isRestoring: false }));
    }
  };

  const cancelRestore = () => {
    setRestoreDialog({
      isOpen: false,
      newsletter: null,
      isRestoring: false,
    });
  };

  // Bulk restore handlers
  const handleBulkRestoreClick = () => {
    if (selectedNewsletters.length === 0) {
      addToast({
        variant: "error",
        title: "No Selection",
        message: "Please select at least one newsletter to restore.",
      });
      return;
    }

    setBulkRestoreDialog({
      isOpen: true,
      isRestoring: false,
    });
  };

  const confirmBulkRestore = async () => {
    setBulkRestoreDialog((prev) => ({ ...prev, isRestoring: true }));
    setIsBulkActionLoading(true);

    try {
      console.log("🔄 Starting bulk restore for newsletters:", selectedNewsletters);
      const restoreCount = selectedNewsletters.length;

      await bulkRestoreNewsletters(selectedNewsletters);

      console.log("✅ Bulk restore API call successful");

      // Wait a bit for backend to process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      addToast({
        variant: "success",
        title: "Success",
        message: `${restoreCount} newsletter${restoreCount > 1 ? "s" : ""} restored successfully!`,
      });

      // Refresh the list
      await fetchArchivedNewsletters();

      // Clear selections
      setSelectedNewsletters([]);

      // Close dialog
      setBulkRestoreDialog({
        isOpen: false,
        isRestoring: false,
      });
    } catch (err) {
      console.error("❌ Failed to restore newsletters:", err);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to restore newsletters. Please try again.",
      });
      setBulkRestoreDialog((prev) => ({ ...prev, isRestoring: false }));
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const cancelBulkRestore = () => {
    setBulkRestoreDialog({
      isOpen: false,
      isRestoring: false,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Bulk Action Bar */}
      {selectedNewsletters.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedNewsletters.length} newsletter{selectedNewsletters.length > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleBulkRestoreClick}
            disabled={isBulkActionLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBulkActionLoading ? "Restoring..." : "Restore Selected"}
          </button>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-sm uppercase tracking-wider dark:text-gray-400"
              >
                <Checkbox
                  checked={newsletters.length > 0 && selectedNewsletters.length === newsletters.length}
                  onChange={(checked) => handleSelectAll(checked)}
                  label=""
                />
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
            {newsletters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No archived newsletters found
                </TableCell>
              </TableRow>
            ) : (
              newsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <Checkbox
                      checked={selectedNewsletters.includes(newsletter.id)}
                      onChange={(checked) => handleSelectNewsletter(newsletter.id, checked)}
                      label=""
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-900 text-sm dark:text-white/90">
                      {newsletter.subject || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm">
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-medium uppercase ${
                        newsletter.status === "SENT"
                          ? "bg-green-100 text-green-600 dark:bg-green-600/20 dark:text-green-400"
                          : newsletter.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-600/20 dark:text-gray-400"
                      }`}
                    >
                      {newsletter.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.fromName || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.updatedAt
                      ? formatDate(newsletter.updatedAt)
                      : newsletter.createdAt
                        ? formatDate(newsletter.createdAt)
                        : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {newsletter.createdAt ? formatDate(newsletter.createdAt) : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <button
                      onClick={() => handleRestoreClick(newsletter)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Restore
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Single Restore Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={restoreDialog.isOpen}
        onClose={cancelRestore}
        onConfirm={confirmRestore}
        onCancel={cancelRestore}
        title="Restore Newsletter?"
        message={
          restoreDialog.newsletter
            ? `Are you sure you want to restore "${restoreDialog.newsletter.subject}"? It will be moved back to its previous status.`
            : "Are you sure you want to restore this newsletter?"
        }
        confirmText="Restore"
        cancelText="Cancel"
        isLoading={restoreDialog.isRestoring}
      />

      {/* Bulk Restore Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={bulkRestoreDialog.isOpen}
        onClose={cancelBulkRestore}
        onConfirm={confirmBulkRestore}
        onCancel={cancelBulkRestore}
        title="Restore Multiple Newsletters?"
        message={`Are you sure you want to restore ${selectedNewsletters.length} newsletter${selectedNewsletters.length > 1 ? "s" : ""}? They will be moved back to their previous status.`}
        confirmText={`Restore ${selectedNewsletters.length} Newsletter${selectedNewsletters.length > 1 ? "s" : ""}`}
        cancelText="Cancel"
        isLoading={bulkRestoreDialog.isRestoring}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ArchivedTab;
