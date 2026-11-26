import { apiGet, apiPatch, apiPost } from "./apiUtils";

export const ENQUIRY_STATUSES = ["NEW", "IN_REVIEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type EnquiryCampaignType = "text" | "email" | "email-text";

// One enquiry from the public "Start hiring with Gotham" form.
/** The call the person booked after sending the enquiry (null when nobody has booked one). */
export interface EnquiryCall {
  startAt: string;
  endAt: string;
  timezone: string;
  status: "SCHEDULED" | "RESCHEDULED" | "CANCELLED_BY_USER" | "CANCELLED_BY_ADMIN" | "COMPLETED" | "NO_SHOW";
  zoomLink: string | null;
  referenceNumber: string;
  host: { name: string; title: string } | null;
}

export interface CampaignEnquiry {
  id: string;
  referenceCode: string;
  campaignType: EnquiryCampaignType | null;
  organizationType: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  companySize: string | null;
  // Older enquiries (before the form was simplified) may still carry these.
  website: string | null;
  howDidYouHear: string | null;
  primaryGoal: string | null;
  estimatedAudienceSize: string | null;
  notes: string | null;
  status: EnquiryStatus;
  assignedTo: string | null;
  internalNotes: string | null;
  reviewedAt: string | null;
  teamNotifiedAt: string | null;
  acknowledgedAt: string | null;
  notifyError: string | null;
  /** WEBSITE: the quote form. IN_APP: an existing customer asking from inside their account. */
  source?: "WEBSITE" | "IN_APP";
  /** The customer's company, for IN_APP requests. */
  companyId?: string | null;
  /** The booked call, with when and with whom. */
  call?: EnquiryCall | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignEnquiryList {
  enquiries: CampaignEnquiry[];
  total: number;
  page: number;
  pages: number;
}

export interface CampaignEnquiryStats {
  total: number;
  byStatus: Record<EnquiryStatus, number>;
  lastSevenDays: number;
}

export interface CampaignEnquiryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnquiryStatus;
  campaignType?: EnquiryCampaignType;
}

const BASE = "/api/campaign-enquiries";

export const getCampaignEnquiries = async (filters: CampaignEnquiryFilters = {}): Promise<CampaignEnquiryList> => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiGet<{ data: CampaignEnquiryList }>(`${BASE}${query.size ? `?${query}` : ""}`);
  return res.data;
};

export const getCampaignEnquiryStats = async (): Promise<CampaignEnquiryStats> => {
  const res = await apiGet<{ data: CampaignEnquiryStats }>(`${BASE}/stats`);
  return res.data;
};

export const updateCampaignEnquiry = async (
  id: string,
  changes: { status?: EnquiryStatus; assignedTo?: string | null; internalNotes?: string | null },
): Promise<CampaignEnquiry> => {
  const res = await apiPatch<{ data: { enquiry: CampaignEnquiry } }>(`${BASE}/${id}`, changes);
  return res.data.enquiry;
};

/** Add one-off credits to the customer's account from their request (once per request; closes it and emails them). */
export const grantEnquiryCredits = async (
  id: string,
  input: { emailCredits: number; smsCredits: number; note?: string },
): Promise<CampaignEnquiry> => {
  const res = await apiPost<{ data: { enquiry: CampaignEnquiry } }>(`${BASE}/${id}/grant-credits`, input);
  return res.data.enquiry;
};

/** A one-off credit top-up sold with a one-time Stripe payment link. */
export interface CreditTopup {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  emailCredits: number;
  smsCredits: number;
  priceInCents: number;
  note: string | null;
  paymentUrl: string | null;
  sentAt: string | null;
  paidAt: string | null;
  /** True only outside production against Stripe test mode. */
  canSimulate: boolean;
}

export const getCreditTopup = async (id: string): Promise<CreditTopup | null> =>
  (await apiGet<{ data: { topup: CreditTopup | null } }>(`${BASE}/${id}/credit-topup`)).data.topup;

export const sendCreditTopup = async (
  id: string,
  input: { emailCredits: number; smsCredits: number; priceInDollars: number; note?: string },
): Promise<CreditTopup> => (await apiPost<{ data: { topup: CreditTopup } }>(`${BASE}/${id}/credit-topup`, input)).data.topup;

export const resendCreditTopup = async (id: string): Promise<CreditTopup> =>
  (await apiPost<{ data: { topup: CreditTopup } }>(`${BASE}/${id}/credit-topup/resend`)).data.topup;

export const cancelCreditTopup = async (id: string): Promise<void> => {
  await apiPost(`${BASE}/${id}/credit-topup/cancel`);
};

export const simulateCreditTopupPaid = async (id: string): Promise<CreditTopup> =>
  (await apiPost<{ data: { topup: CreditTopup } }>(`${BASE}/${id}/credit-topup/simulate-paid`)).data.topup;
