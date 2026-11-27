import { apiGet, apiPost } from "./apiUtils";

// Campaign messages the AI content review flagged. Nothing is sent while a message is flagged.

export type FlagStatus = "FLAGGED" | "APPROVED" | "UPHELD";

export interface ContentFlag {
  id: string;
  companyName: string;
  campaignName: string | null;
  /** BRIEF: the customer's brief. PREPARE: content staff prepared. LAUNCH: about to be sent. */
  stage: "BRIEF" | "PREPARE" | "LAUNCH";
  excerpt: string;
  reasons: string[];
  confidence: number;
  explanation: string;
  status: FlagStatus;
  customerNotified: boolean;
  reviewedBy: string | null;
  /** When the customer asked Gotham to review it, and what they said. Only requested reviews are listed here. */
  reviewRequestedAt: string | null;
  reviewRequestNote: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ContentFlagList {
  flags: ContentFlag[];
  total: number;
  page: number;
  pages: number;
  counts: Record<FlagStatus, number>;
}

const BASE = "/api/admin/campaign-moderation";

export const getContentFlags = async (params: { status: FlagStatus; page: number; limit: number }): Promise<ContentFlagList> =>
  (await apiGet<{ data: ContentFlagList }>(`${BASE}?status=${params.status}&page=${params.page}&limit=${params.limit}`)).data;

export const reviewContentFlag = async (id: string, input: { decision: "APPROVE" | "UPHOLD"; note?: string }): Promise<ContentFlag> =>
  (await apiPost<{ data: { flag: ContentFlag } }>(`${BASE}/${id}/review`, input)).data.flag;
