import {
  AdvertiserDetail,
  AdvertiserListItem,
  ApiData,
  Campaign,
  CampaignDetail,
  CampaignListItem,
  CampaignReviewPayload,
  Creative,
  ListFilters,
  Paginated,
  Placement,
  PlacementInput,
  Report,
  ReportFilters,
  ReviewPayload,
  ReviewQueue,
  Advertiser,
} from "../types/spotlight";
import { apiGet, apiPost, apiPut } from "./apiUtils";

// "spotlight", not "ads": ad blockers block requests to URLs containing /ads/.
const BASE = "/api/admin/spotlight";

const toQuery = (params: object) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.append(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
};

export const spotlightApi = {
  getReviewQueue: () => apiGet<ApiData<ReviewQueue>>(`${BASE}/review-queue`),

  // Advertisers
  getAdvertisers: (filters: ListFilters) =>
    apiGet<Paginated<AdvertiserListItem>>(`${BASE}/advertisers${toQuery(filters)}`),
  getAdvertiser: (id: string) => apiGet<ApiData<AdvertiserDetail>>(`${BASE}/advertisers/${id}`),
  reviewAdvertiser: (id: string, payload: ReviewPayload) =>
    apiPost<ApiData<Advertiser>>(`${BASE}/advertisers/${id}/review`, payload),
  suspendAdvertiser: (id: string, note: string) =>
    apiPost<ApiData<Advertiser>>(`${BASE}/advertisers/${id}/suspend`, { note }),
  reinstateAdvertiser: (id: string) => apiPost<ApiData<Advertiser>>(`${BASE}/advertisers/${id}/reinstate`),
  setActivePeriod: (id: string, period: { activeFrom: string | null; activeUntil: string | null }) =>
    apiPut<ApiData<Advertiser>>(`${BASE}/advertisers/${id}/active-period`, period),

  // Campaigns & creatives
  getCampaigns: (filters: ListFilters & { advertiserId?: string }) =>
    apiGet<Paginated<CampaignListItem>>(`${BASE}/campaigns${toQuery(filters)}`),
  getCampaign: (id: string) => apiGet<ApiData<CampaignDetail>>(`${BASE}/campaigns/${id}`),
  reviewCampaign: (id: string, payload: CampaignReviewPayload) =>
    apiPost<ApiData<CampaignDetail>>(`${BASE}/campaigns/${id}/review`, payload),
  pauseCampaign: (id: string) => apiPost<ApiData<Campaign>>(`${BASE}/campaigns/${id}/pause`),
  resumeCampaign: (id: string) => apiPost<ApiData<Campaign>>(`${BASE}/campaigns/${id}/resume`),
  reviewCreative: (id: string, payload: ReviewPayload) =>
    apiPost<ApiData<Creative>>(`${BASE}/creatives/${id}/review`, payload),

  // Placements
  getPlacements: () => apiGet<ApiData<Placement[]>>(`${BASE}/placements`),
  createPlacement: (input: PlacementInput) => apiPost<ApiData<Placement>>(`${BASE}/placements`, input),
  updatePlacement: (id: string, input: PlacementInput) =>
    apiPut<ApiData<Placement>>(`${BASE}/placements/${id}`, input),

  // Reports
  getReport: (filters: ReportFilters) => apiGet<ApiData<Report>>(`${BASE}/reports${toQuery(filters)}`),
};
