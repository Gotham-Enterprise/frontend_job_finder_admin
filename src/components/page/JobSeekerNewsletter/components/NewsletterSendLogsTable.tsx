"use client";

import React from "react";
import { formatDateTime } from "@/services/utils/dateUtils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import TableHeading from "@/components/tables/tableHeader";
import type { NewsletterSendLog } from "@/services/types/newsletterSubscriber";

interface NewsletterSendLogsTableProps {
  logs: NewsletterSendLog[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const logColumns = [
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "error", label: "Details" },
  { key: "sentAt", label: "Sent At" },
];

const statusBadgeColor = (
  status: NewsletterSendLog["status"]
): "success" | "error" | "warning" | "primary" => {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "error";
    default:
      return "warning";
  }
};

const NewsletterSendLogsTable: React.FC<NewsletterSendLogsTableProps> = ({
  logs,
  total,
  page,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Send Logs{" "}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({total} total)
            </span>
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeading columns={logColumns} />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-10" colSpan={4}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-10" colSpan={4}>
                  <p className="text-gray-500 dark:text-gray-400">
                    No sends recorded yet
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {log.email}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge color={statusBadgeColor(log.status)} variant="light" size="sm">
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    {log.error || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                    {formatDateTime(log.sentAt, "—")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSendLogsTable;
