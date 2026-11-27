import type { ManagedStatus } from "@/services/api/campaignManaged";

export const STATUS_LABELS: Record<ManagedStatus, string> = {
  AWAITING_DETAILS: "Awaiting Employer Details",
  PENDING_WITH_GOTHAM: "To Prepare",
  READY_FOR_APPROVAL: "Awaiting Employer Approval",
  SCHEDULED: "Scheduled",
  ACTIVE: "Sending",
  COMPLETED: "Completed",
};

export const STATUS_STYLES: Record<ManagedStatus, string> = {
  AWAITING_DETAILS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_WITH_GOTHAM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  READY_FOR_APPROVAL: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  COMPLETED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const CHANNEL_LABELS = { EMAIL: "Email", SMS: "Text" } as const;

export const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "–";
