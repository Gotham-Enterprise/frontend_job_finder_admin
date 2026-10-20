/** Billing week of an hourly hire (Mon–Sun, US Eastern). Amounts are integer cents. */
export type BillingWeekStatus = "OPEN" | "IN_REVIEW" | "DISPUTED" | "APPROVED" | "SETTLED";
export type PrepayStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";
export type LateEntryApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LateEntryRequestStatus = "REQUESTED" | "ADDED" | "DISMISSED";

/** An image the supervisee attached as evidence when disputing the week. */
export interface DisputeAttachment {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

/** A supervisor's request to add a session to a closed week; support adds or dismisses it. */
export interface LateEntryRequest {
  id: string;
  /** YYYY-MM-DD (Eastern calendar date) */
  sessionDate: string;
  durationMinutes: number;
  notes: string;
  status: LateEntryRequestStatus;
  /** The late entry created from it, once added */
  sessionLogId: string | null;
  /** Why it was dismissed (shown to the supervisor) */
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface PaymentParty {
  id: string;
  fullName: string | null;
  email: string;
}

export interface BillingWeekSession {
  id: string;
  /** YYYY-MM-DD (Eastern calendar date) */
  sessionDate: string;
  durationMinutes: number;
  notes: string | null;
  /** SUPPORT = late entry added by Gotham support */
  source: "SUPERVISOR" | "SUPPORT";
  createdAt: string;
  approvalStatus: LateEntryApprovalStatus | null;
  respondedAt: string | null;
  supportNote: string | null;
  /** Late entries on a settled week are charged on their own. */
  chargeStatus: PrepayStatus | null;
  totalCents: number | null;
  supervisorAmountCents: number | null;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  failureMessage: string | null;
}

export interface BillingWeek {
  id: string;
  startDate: string;
  endDate: string;
  status: BillingWeekStatus;
  prepayStatus: PrepayStatus;
  hire: {
    id: string;
    status: string;
    supervisor: PaymentParty;
    supervisee: PaymentParty;
    agreement: {
      startDate: string;
      hourlyRateCents: number | null;
      weeklyCapMinutes: number | null;
      totalHours: number | null;
    } | null;
  };
  terms: { hourlyRateCents: number; weeklyCapMinutes: number; platformFeeBps: number };
  loggedMinutes: number;
  sessionCount: number;
  pendingLateEntries: number;
  failedLateCharges: number;
  /** Late entries the supervisor asked support to add, not yet handled */
  pendingLateEntryRequests: number;
  prepayAmountCents: number;
  serviceFeeCents: number;
  totalCents: number;
  paidAt: string | null;
  failedAt: string | null;
  failureMessage: string | null;
  stripePaymentIntentId: string | null;
  logDeadlineAt: string;
  reviewEndsAt: string;
  approvedMinutes: number | null;
  approvedAt: string | null;
  approvedBy: "SUPERVISEE" | "AUTO" | "SUPPORT" | null;
  disputedAt: string | null;
  disputeReason: string | null;
  disputeAttachments: DisputeAttachment[];
  resolvedAt: string | null;
  resolutionNote: string | null;
  supervisorAmountCents: number | null;
  platformFeeCents: number | null;
  refundCents: number | null;
  stripeTransferId: string | null;
  stripeRefundId: string | null;
  settledAt: string | null;
  /** YYYY-MM-DD: late entries can be added until this day (inclusive) */
  lateEntryDeadline: string;
  sessions: BillingWeekSession[];
  lateEntryRequests: LateEntryRequest[];
}

export interface BillingWeekFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: BillingWeekStatus;
  prepayStatus?: PrepayStatus;
  /** Disputed weeks, unpaid weeks and failed late-session charges */
  needsAttention?: boolean;
}

export interface BillingWeeksResponse {
  success: boolean;
  data: BillingWeek[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BillingWeekResponse {
  success: boolean;
  message?: string;
  data: BillingWeek;
}

export interface ResolveDisputeInput {
  /** Minutes the supervisor is paid for (0 = refund the whole prepay) */
  approvedMinutes: number;
  note: string;
}

export interface LateEntryInput {
  sessionDate: string;
  durationMinutes: number;
  notes: string;
  reason?: string;
  /** The supervisor's request this entry fulfils */
  requestId?: string;
}

export interface SupervisorInAppPayments {
  payoutAccountCreated: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** GET /api/supervision/admin/billing-weeks/summary — platform revenue at a glance. */
export interface PaymentsSummary {
  monthStart: string;
  platformFees: {
    thisMonthCents: number;
    allTimeCents: number;
    /** Fee the logged hours of prepaid, unsettled weeks would earn. */
    inProgressEstimateCents: number;
  };
  settledWeeks: { thisMonth: number; allTime: number };
  chargedVolume: { thisMonthCents: number; allTimeCents: number };
  inProgressWeeks: number;
}

export interface PaymentsSummaryResponse {
  success: boolean;
  data: PaymentsSummary;
}
