import { apiGet, apiPost, apiPut } from "./apiUtils";

// The sales side of a campaign enquiry: quote, agreement and Stripe payment link, then the customer's access.

export type DealStatus =
  | "DRAFT"
  | "QUOTED"
  | "SIGNED"
  | "PAYMENT_LINK_READY"
  | "PAYMENT_LINK_SENT"
  | "PAID"
  | "ACTIVE"
  | "CANCELLED";

export interface CampaignDeal {
  id: string;
  enquiryId: string;
  status: DealStatus;
  contactName: string;
  contactEmail: string;
  companyName: string;
  quote: {
    emailCredits: number;
    smsCredits: number;
    priceInCents: number;
    currency: string;
    notes: string | null;
    sentAt: string | null;
    complete: boolean;
  };
  agreement: {
    required: boolean;
    signedAt: string | null;
    signedBy: string | null;
    /** CLICK_ACCEPT once the customer has ticked the box on the proposal page; MANUAL until then. */
    provider: "MANUAL" | "CLICK_ACCEPT";
    /** The terms version accepted online. */
    termsVersion: string | null;
    proposalViewedAt: string | null;
    proposalAcceptedAt: string | null;
  };
  payment: { linkUrl: string | null; sentAt: string | null; paidAt: string | null; canCreateLink: boolean; blockers: string[] };
  access: { accountFound: boolean; companyName: string | null; activatedAt: string | null };
  /** The plan's monthly cycle: unused credits lock when the paid period ends, and expire 90 days after it. */
  renewal: {
    currentPeriodEnd: string | null;
    locked: boolean;
    creditsExpireAt: string | null;
    creditsExpiredAt: string | null;
    paymentFailedAt: string | null;
  };
  canSimulatePayment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteInput {
  emailCredits: number;
  smsCredits: number;
  priceInDollars: number;
  notes?: string;
}

const BASE = "/api/admin/campaign-deals";
type Wrapped = { data: { deal: CampaignDeal } };

export const getDeal = async (enquiryId: string): Promise<CampaignDeal | null> =>
  (await apiGet<{ data: { deal: CampaignDeal | null } }>(`${BASE}/by-enquiry/${enquiryId}`)).data.deal;
export const saveQuote = async (enquiryId: string, input: QuoteInput) =>
  (await apiPut<Wrapped>(`${BASE}/by-enquiry/${enquiryId}/quote`, input)).data.deal;
export const sendQuote = async (id: string) => (await apiPost<Wrapped>(`${BASE}/${id}/send-quote`)).data.deal;
export const createPaymentLink = async (id: string) => (await apiPost<Wrapped>(`${BASE}/${id}/payment-link`)).data.deal;
export const sendPaymentLink = async (id: string) => (await apiPost<Wrapped>(`${BASE}/${id}/send-payment-link`)).data.deal;
export const simulatePayment = async (id: string) => (await apiPost<Wrapped>(`${BASE}/${id}/simulate-payment`)).data.deal;
