import { apiGet, apiPost, apiPut } from "./apiUtils";

// Gotham-managed campaigns: employers buy a package and send a brief; Gotham staff prepare the campaign here,
// then the employer approves it and it is sent.

export type ManagedStatus =
  | "AWAITING_DETAILS"
  | "PENDING_WITH_GOTHAM"
  | "READY_FOR_APPROVAL"
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED";
export type ManagedTab = "ALL" | "TO_PREPARE" | "AWAITING_APPROVAL" | "AWAITING_DETAILS" | "LIVE";
export type ManagedChannel = "EMAIL" | "SMS";

export interface ManagedCampaignSummary {
  id: string;
  name: string;
  status: ManagedStatus;
  channels: ManagedChannel[];
  companyId: string;
  companyName: string;
  requestedBy: { name: string; email: string } | null;
  jobTitle: string | null;
  cityState: string | null;
  matchedCount: number | null;
  scheduledFor: string | null;
  preparedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedCampaignList {
  campaigns: ManagedCampaignSummary[];
  total: number;
  page: number;
  pages: number;
  tabCounts: Record<ManagedTab, number>;
}

export interface ManagedBrief {
  jobLink: string;
  jobTitle: string;
  cityState: string;
  audienceRole: string;
  forwardResults: boolean;
  forwardEmail?: string;
}

// The campaign as Gotham prepares it: the same fields as the employer's own campaign builder.
export interface ManagedForm {
  specialties: string[];
  location: string;
  radius: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  sendType: "ASAP" | "LATER";
  sendDate: string;
  sendTime: string;
  timezone: string;
  deliveryWindow: "BUSINESS_HOURS" | "ANYTIME";
  avoidWeekends: boolean;
  avoidHolidays: boolean;
  respectQuietHours: boolean;
  subjectLine: string;
  emailBody: string;
  ctaButtonText: string;
  ctaTargetUrl: string;
  payRate: string;
  /** Fills {{facility_name}}; starts as the employer's company name. */
  facilityName: string;
  /** Optional role for {{specialty}}; empty means each candidate's own specialty. */
  specialtyName: string;
  /** Fills {{location}}: where the job is. Starts as the employer's requested location. */
  locationText: string;
  smsBody: string;
  preventFatigue: boolean;
  excludeOptOuts: boolean;
}

export interface ManagedPrepared {
  messagePreview: string;
  matchedCount: number;
  targetCriteria: string;
  jobUrl: string;
  messagesToSend: { email: number; sms: number };
  preparedBy: string;
  preparedAt: string;
}

export interface ManagedCampaignDetail extends ManagedCampaignSummary {
  brief: ManagedBrief | null;
  prepared: ManagedPrepared | null;
  form: Partial<ManagedForm> | null;
  creditsHeld: number;
  /** The employer's credits in each channel (email and text are separate balances). */
  creditsAvailable: { EMAIL: number; SMS: number } | null;
  editable: boolean;
}

export interface AudienceOccupation {
  id: string;
  name: string;
  count: number;
}

export interface AudienceEstimate {
  count: number;
  byChannel: { email: number; sms: number };
  deliverable: { email: number; sms: number };
}

export interface ZipSuggestion {
  zipCode: string;
  city: string;
  state: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
}

const BASE = "/api/admin/campaigns";

export const getManagedCampaigns = async (filters: { tab?: ManagedTab; search?: string; page?: number; limit?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiGet<{ data: ManagedCampaignList }>(`${BASE}${query.size ? `?${query}` : ""}`);
  return res.data;
};

export const getManagedCampaign = async (id: string): Promise<ManagedCampaignDetail> =>
  (await apiGet<{ data: { campaign: ManagedCampaignDetail } }>(`${BASE}/${id}`)).data.campaign;

export const saveManagedPreparation = async (id: string, form: Partial<ManagedForm>): Promise<ManagedCampaignDetail> =>
  (await apiPut<{ data: { campaign: ManagedCampaignDetail } }>(`${BASE}/${id}/preparation`, { form })).data.campaign;

export const submitManagedCampaign = async (id: string): Promise<ManagedCampaignDetail> =>
  (await apiPost<{ data: { campaign: ManagedCampaignDetail } }>(`${BASE}/${id}/submit`)).data.campaign;

export const getAudienceOccupations = async (): Promise<AudienceOccupation[]> =>
  (await apiGet<{ data: { occupations: AudienceOccupation[] } }>(`${BASE}/audience/occupations`)).data.occupations;

/** What one text of this wording costs, with the tracked link and the opt-out line the system adds (the most any recipient's text can use). */
export type SmsCost = { characters: number; segments: number; encoding: "GSM-7" | "UCS-2"; tooLong: boolean };
export const estimateSmsCost = async (smsBody: string, extras: { ctaTargetUrl?: string; location?: string; payRate?: string; facilityName?: string; specialtyName?: string; locationText?: string } = {}): Promise<SmsCost> =>
  (await apiPost<{ data: SmsCost }>(`${BASE}/sms-cost`, { smsBody, ...extras })).data;

export const estimateManagedAudience = async (body: {
  occupationIds: string[];
  location?: { latitude: number; longitude: number; radiusMiles: number };
}): Promise<AudienceEstimate> => (await apiPost<{ data: AudienceEstimate }>(`${BASE}/audience/estimate`, body)).data;

// Public endpoint the employer app uses too: places for a ZIP code or city name, with their map position.
export const searchPlaces = async (q: string): Promise<ZipSuggestion[]> =>
  (await apiGet<{ data: ZipSuggestion[] }>(`/api/locations/zip-suggestions?q=${encodeURIComponent(q)}`)).data;
