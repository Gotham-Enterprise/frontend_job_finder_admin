"use client";

import React, { useState } from "react";
import { formatDateTime } from "@/services/utils/dateUtils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import TableHeading from "@/components/tables/tableHeader";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import type { NewsletterSubscriber } from "@/services/types/newsletterSubscriber";

interface NewsletterSubscribersTableProps {
  subscribers: NewsletterSubscriber[];
  isLoading: boolean;
  error: Error | null;
  isUnsubscribing: boolean;
  onUnsubscribe: (id: string) => void;
}

const columns = [
  { key: "email", label: "Email" },
  { key: "occupation", label: "Occupation" },
  { key: "location", label: "Location" },
  { key: "subscribedAt", label: "Subscribed" },
  { key: "lastEmailSentAt", label: "Last Email" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const NewsletterSubscribersTable: React.FC<NewsletterSubscribersTableProps> = ({
  subscribers,
  isLoading,
  error,
  isUnsubscribing,
  onUnsubscribe,
}) => {
  const [confirmTarget, setConfirmTarget] = useState<NewsletterSubscriber | null>(
    null
  );

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
        Error loading subscribers: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeading columns={columns} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={7}>
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500" />
                      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-10" colSpan={7}>
                    <p className="text-gray-500 dark:text-gray-400">
                      No subscribers found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {sub.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {sub.occupation || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {[sub.city, sub.state].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                      {formatDateTime(sub.subscribedAt, "—")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                      {sub.lastEmailSentAt ? formatDateTime(sub.lastEmailSentAt, "—") : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        color={sub.isActive ? "success" : "error"}
                        variant="light"
                        size="sm"
                      >
                        {sub.isActive ? "Active" : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {sub.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirmTarget(sub)}
                        >
                          Unsubscribe
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (confirmTarget) onUnsubscribe(confirmTarget.id);
          setConfirmTarget(null);
        }}
        onCancel={() => setConfirmTarget(null)}
        title="Unsubscribe"
        message={
          confirmTarget
            ? `Unsubscribe ${confirmTarget.email} from the weekly job seeker newsletter?`
            : ""
        }
        confirmText="Unsubscribe"
        cancelText="Cancel"
        isLoading={isUnsubscribing}
      />
    </>
  );
};

export default NewsletterSubscribersTable;
