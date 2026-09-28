// Sponsored content ("spotlight") admin types. The backend lives at
// /api/admin/spotlight; names avoid "ads" because ad blockers block those URLs.

export type ReviewDecision = "approved" | "changes_requested" | "rejected";

export type AdvertiserStatus = "pending_verification" | "changes_requested" | "approved" | "rejected" | "suspended";

export type CampaignStatus =
  | "draft"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "paused"
  | "archived";

export type CreativeStatus = "draft" | "submitted" | "changes_requested" | "approved" | "rejected";

export type SpotlightStatus = AdvertiserStatus | CampaignStatus | CreativeStatus;

export type PageType = "medical_library" | "cpt_library" | "licensing_guide";

export interface Paginated<T> {
  success: boolean;
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiData<T> {
  success: boolean;
  data: T;
}

export interface ListFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Advertisers ────────────────────────────────────────────────────────────

export interface Advertiser {
  id: string;
  companyName: string;
  businessEmail: string;
  contactPerson: string;
  contactNumber: string;
  website: string;
  businessAddress: string;
  country: string | null;
  businessRegistrationNumber: string | null;
  status: AdvertiserStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  activeFrom: string | null;
  activeUntil: string | null;
  createdAt: string;
  hoursWaiting: number | null;
}

export interface AdvertiserListItem extends Advertiser {
  _count: { campaigns: number };
}

export interface AdvertiserDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  /** Short-lived signed link; never store it. */
  url: string;
}

export interface AdvertiserDetail extends Advertiser {
  members: {
    memberRole: string;
    user: { id: string; firstName: string; lastName: string; email: string; emailVerifiedAt: string | null; status: string };
  }[];
  documents: AdvertiserDocument[];
  campaigns: Pick<Campaign, "id" | "name" | "status" | "startDate" | "endDate" | "submittedAt">[];
}

// ─── Campaigns & creatives ──────────────────────────────────────────────────

export interface Placement {
  id: string;
  key: string;
  name: string;
  description: string | null;
  pageType: PageType;
  sizes: string[];
  isActive: boolean;
  _count?: { campaigns: number };
}

export interface TargetingRule {
  pageType: PageType;
  key: string;
  value: string;
}

export interface Creative {
  id: string;
  campaignId: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  altText: string;
  headline: string | null;
  body: string | null;
  ctaText: string | null;
  destinationUrl: string;
  reviewStatus: CreativeStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string | null;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CampaignListItem extends Campaign {
  advertiser: { id: string; companyName: string; status: AdvertiserStatus };
  _count: { creatives: number };
}

export interface CampaignDetail extends Campaign {
  advertiser: {
    id: string;
    companyName: string;
    status: AdvertiserStatus;
    activeFrom: string | null;
    activeUntil: string | null;
  };
  placements: Pick<Placement, "key" | "name" | "pageType" | "sizes">[];
  targetingRules: TargetingRule[];
  creatives: Creative[];
  hoursWaiting: number | null;
}

// ─── Review queue ───────────────────────────────────────────────────────────

export interface ReviewQueue {
  advertisers: { id: string; companyName: string; website: string; submittedAt: string; hoursWaiting: number }[];
  campaigns: {
    id: string;
    name: string;
    submittedAt: string;
    hoursWaiting: number;
    advertiser: { id: string; companyName: string };
  }[];
  creatives: {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    submittedAt: string;
    hoursWaiting: number;
    campaign: { id: string; name: string; advertiser: { id: string; companyName: string } };
  }[];
}

export interface ReviewPayload {
  decision: ReviewDecision;
  note?: string;
}

export interface CampaignReviewPayload extends ReviewPayload {
  /** Per-creative overrides; creatives not listed follow the campaign decision. */
  creativeDecisions?: Record<string, ReviewPayload>;
}

// ─── Reports ────────────────────────────────────────────────────────────────

export interface ReportFilters {
  from?: string;
  to?: string;
  advertiserId?: string;
  campaignId?: string;
  placementId?: string;
}

export interface Metrics {
  impressions: number;
  clicks: number;
  /** Percent, e.g. 1.25 means 1.25% */
  ctr: number;
}

export interface Report {
  from: string;
  to: string;
  totals: Metrics;
  daily: (Metrics & { date: string })[];
  byCampaign: (Metrics & { campaignId: string; campaignName: string; advertiserId: string; advertiserName: string })[];
  byCreative: (Metrics & { creativeId: string; creativeName: string; size: string; campaignId: string })[];
  byPlacement: (Metrics & { placementId: string; placementKey: string; placementName: string })[];
}

export interface PlacementInput {
  key?: string;
  name?: string;
  description?: string | null;
  pageType?: PageType;
  sizes?: string[];
  isActive?: boolean;
}
