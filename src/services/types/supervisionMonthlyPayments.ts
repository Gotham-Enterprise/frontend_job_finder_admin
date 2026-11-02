/** In-app monthly billing (Medical Director retainers): one row per hire per month. */

export type MonthlyPeriodStatus = "OPEN" | "IN_REVIEW" | "DISPUTED" | "APPROVED" | "SETTLED" | "CANCELED";
export type MonthlyPaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";

export interface MonthlyPeriodParty {
  id: string;
  fullName: string | null;
  email: string;
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
