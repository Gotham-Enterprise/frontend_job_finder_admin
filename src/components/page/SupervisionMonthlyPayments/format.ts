import { MonthlyPaymentStatus, MonthlyPeriod, MonthlyPeriodStatus } from "@/services/types/supervisionMonthlyPayments";

export const MONTH_STATUS_LABEL: Record<MonthlyPeriodStatus, string> = {
  OPEN: "Running",
  IN_REVIEW: "Dispute window",
  DISPUTED: "Disputed",
  APPROVED: "Released",
  SETTLED: "Settled",
  CANCELED: "Canceled",
};

export const MONTH_STATUS_CLASS: Record<MonthlyPeriodStatus, string> = {
  OPEN: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DISPUTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  APPROVED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  SETTLED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export const PAYMENT_STATUS_LABEL: Record<MonthlyPaymentStatus, string> = {
  PENDING: "Not charged yet",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELED: "Canceled",
};

export const PAYMENT_STATUS_CLASS: Record<MonthlyPaymentStatus, string> = {
  PENDING: "text-gray-500 dark:text-gray-400",
  PAID: "text-green-700 dark:text-green-400",
  FAILED: "text-red-700 dark:text-red-400",
  CANCELED: "text-gray-500 dark:text-gray-400",
};

/** What needs a support action on this month, if anything. */
export function monthAttention(period: MonthlyPeriod): string | null {
  if (period.status === "DISPUTED") return "Dispute to resolve";
  if (period.status === "OPEN" && period.paymentStatus === "FAILED") return "Payment failed";
  if (period.status === "APPROVED") return "Released, not settled yet";
  return null;
}
