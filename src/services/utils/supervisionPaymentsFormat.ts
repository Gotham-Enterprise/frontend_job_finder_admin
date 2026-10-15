import { BillingWeekStatus, PrepayStatus } from "../types/supervisionPayments";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Integer cents → "$1,234.56"; "—" when missing. */
export const formatCents = (cents: number | null | undefined): string =>
  cents == null ? "—" : usd.format(cents / 100);

/** 45 → "45 min", 60 → "1 h", 90 → "1 h 30 min" */
export const formatMinutes = (minutes: number | null | undefined): string => {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

/** A calendar date "2026-10-12" → "Oct 12, 2026" (no timezone shift). */
export const formatCalendarDate = (isoDate: string | null | undefined): string =>
  isoDate
    ? new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

/** "Oct 12 – Oct 18, 2026" for a billing week. */
export const formatWeekRange = (startDate: string, endDate: string): string => {
  const short = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${short(startDate)} – ${short(endDate)}, ${endDate.slice(0, 4)}`;
};

/** An instant in US Eastern: "Oct 19, 2026, 11:59 PM ET"; "—" when missing. */
export const formatEasternDateTime = (iso: string | null | undefined): string =>
  iso
    ? `${new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      })} ET`
    : "—";

export const WEEK_STATUS_LABEL: Record<BillingWeekStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  DISPUTED: "Disputed",
  APPROVED: "Approved",
  SETTLED: "Settled",
};

export const WEEK_STATUS_CLASS: Record<BillingWeekStatus, string> = {
  OPEN: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DISPUTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  APPROVED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  SETTLED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const PREPAY_STATUS_LABEL: Record<PrepayStatus, string> = {
  PENDING: "Not charged yet",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELED: "Not charged",
};

export const PREPAY_STATUS_CLASS: Record<PrepayStatus, string> = {
  PENDING: "text-gray-500 dark:text-gray-400",
  PAID: "text-green-700 dark:text-green-400",
  FAILED: "text-red-700 dark:text-red-400",
  CANCELED: "text-gray-500 dark:text-gray-400",
};
