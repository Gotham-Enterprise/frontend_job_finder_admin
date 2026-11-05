import React from "react";
import { TableCell } from "@/components/ui/table";
import type { EngagementListMetrics } from "@/services/types/supervisionEngagement";

const CELL = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";

/**
 * "Messages" and "Active Hires" cells for the admin Supervisor / Supervisee
 * tables. Pair with ENGAGEMENT_TABLE_COLUMNS so headers and cells stay in sync.
 */
export function EngagementListCells({ engagement }: { engagement?: EngagementListMetrics }) {
  if (!engagement) {
    return (
      <>
        <TableCell className={CELL}>
          <span className="text-gray-400 italic">—</span>
        </TableCell>
        <TableCell className={CELL}>
          <span className="text-gray-400 italic">—</span>
        </TableCell>
      </>
    );
  }
  return (
    <>
      <TableCell className={CELL}>
        <div className="font-medium tabular-nums text-gray-900 dark:text-white">
          {engagement.totalMessages}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {engagement.messagesSent} sent · {engagement.messagesReceived} received
        </div>
      </TableCell>
      <TableCell className={CELL}>
        <div className="font-medium tabular-nums text-gray-900 dark:text-white">
          {engagement.currentHires}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {engagement.totalHires} total
        </div>
      </TableCell>
    </>
  );
}

/** Header columns matching EngagementListCells; sortKeys map to backend sortBy values. */
export const ENGAGEMENT_TABLE_COLUMNS = [
  { key: "messages", label: "Messages", sortKey: "totalMessages" },
  { key: "activeHires", label: "Active Hires", sortKey: "currentHires" },
];

/** Count columns read best busiest-first, so their first click sorts descending. */
export const DESC_FIRST_SORT_KEYS: ReadonlySet<string> = new Set(
  ENGAGEMENT_TABLE_COLUMNS.map((column) => column.sortKey)
);
