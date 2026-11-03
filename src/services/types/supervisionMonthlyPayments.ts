/** In-app monthly billing (Medical Director retainers): one row per hire per month. */

export type MonthlyPeriodStatus = "OPEN" | "IN_REVIEW" | "DISPUTED" | "APPROVED" | "SETTLED" | "CANCELED";
export type MonthlyPaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";
export type MonthlyDisputeCategory =
  | "UNREACHABLE"
  | "MISSED_MEETINGS"
  | "NO_CHART_REVIEW"
  | "PROTOCOLS_NOT_SIGNED"
  | "UNPROFESSIONAL"
  | "OTHER";

/** One submission on a disputed month: the client's report, more from the client, or the Medical Director's side. */
export interface MonthlyDisputeEvidence {
  id: string;
  authorRole: "SUPERVISEE" | "SUPERVISOR";
  note: string | null;
  createdAt: string;
  /** Presigned URLs, valid for 24 hours. */
  files: { id: string; url: string; fileName: string; contentType: string; sizeBytes: number }[];
}

/** What the Medical Director logged during the month (their activity log). */
export interface MonthlyActivityEntry {
  id: string;
  /** "YYYY-MM-DD", US Eastern */
  activityDate: string;
  type: "MEETING" | "CHART_REVIEW" | "PROTOCOL_REVIEW" | "CONSULTATION" | "OTHER";
  durationMinutes: number | null;
  chartCount: number | null;
  notes: string | null;
  /** "YYYY-MM-DD" the entry was written, US Eastern */
  loggedOn: string;
  createdAt: string;
  edited: boolean;
  addedAfterDispute: boolean;
}

export interface MonthlyPeriodParty {
  id: string;
  fullName: string | null;
  email: string;
}

/** A disputed month's hire chat in numbers (no message text). */
export interface MonthlyChatSummary {
  /** A client message counts as unanswered after this many hours without a reply. */
  replyWindowHours: number;
  clientMessages: number;
  mdMessages: number;
  /** Runs of client messages with no Medical Director message in between. */
  clientRequests: number;
  unansweredRequests: number;
  medianReplyHours: number | null;
  lastMdMessageAt: string | null;
  clientMessagesNeverOpened: number;
}

export interface MonthlyChatAccess {
  adminName: string;
  createdAt: string;
}

export interface MonthlyChatMessage {
  id: string;
  from: "SUPERVISEE" | "SUPERVISOR";
  type: "TEXT" | "SYSTEM" | "FILE";
  body: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface MonthlyPeriodMessagesResponse {
  success: boolean;
  data: { from: string; to: string; messages: MonthlyChatMessage[]; accessLog: MonthlyChatAccess[] };
}

export interface MonthlyPeriod {
  id: string;
  hireId: string;
  periodIndex: number;
  /** "Nov 15 – Dec 14, 2026" */
  label: string;
  periodStart: string;
  periodEnd: string;
  reviewEndsAt: string;
  status: MonthlyPeriodStatus;
  paymentStatus: MonthlyPaymentStatus;
  amountCents: number;
  serviceFeeCents: number;
  totalCents: number;
  platformFeeBps: number;
  paidAt: string | null;
  failedAt: string | null;
  failureMessage: string | null;
  graceEndsAt: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  /** null on months disputed before categories existed. */
  disputeCategory: MonthlyDisputeCategory | null;
  approvedAmountCents: number | null;
  approvedAt: string | null;
  approvedBy: "SUPERVISEE" | "AUTO" | "SUPPORT" | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  supervisorAmountCents: number | null;
  platformFeeCents: number | null;
  refundCents: number | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeTransferId: string | null;
  stripeRefundId: string | null;
  settledAt: string | null;
  /** Detail view only: the dispute's evidence from both sides, oldest first. */
  evidence?: MonthlyDisputeEvidence[];
  /** Detail view only: the Medical Director's activity log entries for this month. */
  activity?: MonthlyActivityEntry[];
  /** Detail view only, disputed months: the hire chat in numbers; null when there's no chat room. */
  chatSummary?: MonthlyChatSummary | null;
  /** Detail view only, disputed months: who opened the messages, newest first. */
  chatAccessLog?: MonthlyChatAccess[];
  hire?: {
    id: string;
    status: string;
    scheduledEndAt: string | null;
    scheduledEndBy: string | null;
    supervisor: MonthlyPeriodParty;
    supervisee: MonthlyPeriodParty;
  };
}

export interface MonthlyPeriodFilters {
  page?: number;
  limit?: number;
  status?: MonthlyPeriodStatus;
  keyword?: string;
  needsAttention?: boolean;
}

export interface MonthlyPeriodsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    needsAttentionCount: number;
    periods: MonthlyPeriod[];
  };
}

export interface MonthlyPeriodResponse {
  success: boolean;
  data: MonthlyPeriod;
}

export interface ResolveMonthlyDisputeInput {
  /** How much of the monthly amount to release to the Medical Director (0 = refund it all). */
  approvedAmountCents: number;
  note: string;
}
