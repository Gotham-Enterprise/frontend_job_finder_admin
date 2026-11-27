import type { InquiryCampaignType, InquiryStatus } from "@/services/api/campaignInquiries";

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In Review",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const STATUS_STYLES: Record<InquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  IN_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  CONTACTED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  CONVERTED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const STATUS_DOTS: Record<InquiryStatus, string> = {
  NEW: "bg-blue-500",
  IN_REVIEW: "bg-amber-500",
  CONTACTED: "bg-indigo-500",
  CONVERTED: "bg-green-500",
  CLOSED: "bg-gray-400",
};

export const CAMPAIGN_TYPE_LABELS: Record<InquiryCampaignType, string> = {
  text: "Text (SMS)",
  email: "Email",
  "email-text": "Text + Email",
};

export const ORGANIZATION_LABELS: Record<string, string> = {
  enterprise: "Enterprise Business",
  smb: "Small-Medium Size Business",
  agency: "Recruitment Advertising Agency",
  staffing: "Staffing Firm",
  partner: "Potential Partner",
  "existing-customer": "Existing Customer (asked from their account)",
};

export const HEARD_ABOUT_LABELS: Record<string, string> = {
  google: "Google Search",
  linkedin: "LinkedIn",
  referral: "Referral / Word of Mouth",
  association: "Healthcare Association",
  email: "Email Outreach / Newsletter",
  social: "Social Media",
  other: "Other",
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const CALL_STATUS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  RESCHEDULED: "Rescheduled",
  CANCELLED_BY_USER: "Cancelled by the Customer",
  CANCELLED_BY_ADMIN: "Cancelled by Gotham",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};
export const callStatusLabel = (status: string) => CALL_STATUS[status] ?? status;
export const callIsLive = (status: string) => status === "SCHEDULED" || status === "RESCHEDULED";

/** "Tue, Nov 24, 10:30 AM EST": the call time as the customer booked it, in the time zone of the booking. */
export const formatCallTime = (iso: string, timeZone: string) => {
  try {
    return new Date(iso).toLocaleString("en-US", { timeZone, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  } catch {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
};
