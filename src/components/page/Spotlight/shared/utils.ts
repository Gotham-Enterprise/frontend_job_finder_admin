import { PageType, SpotlightStatus } from "@/services/types/spotlight";

export const STATUS_LABELS: Record<SpotlightStatus, string> = {
  pending_verification: "Pending verification",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  draft: "Draft",
  submitted: "Awaiting review",
  paused: "Paused",
  archived: "Archived",
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  medical_library: "Medical Library",
  cpt_library: "CPT Code Library",
  licensing_guide: "Career Licensing Guide",
};

// Review targets agreed for the MVP (advertiser: 1–2 business days; campaigns and creatives: 24 business hours).
export const REVIEW_TARGET_HOURS = { advertiser: 48, campaign: 24, creative: 24 } as const;

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const formatWaiting = (hours: number | null | undefined) => {
  if (hours === null || hours === undefined) return "—";
  if (hours < 1) return "< 1 hour";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.floor(hours / 24)} days`;
};

/** yyyy-mm-dd for <input type="date">, in local time. */
export const toDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const isAdvertiserActiveNow = (activeFrom: string | null, activeUntil: string | null) => {
  const now = Date.now();
  return Boolean(activeFrom) && new Date(activeFrom!).getTime() <= now && (!activeUntil || new Date(activeUntil).getTime() >= now);
};
