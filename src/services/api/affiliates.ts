import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from "./apiUtils";

// Type definitions for affiliate partners
export interface AffiliatePartner {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  status: "active" | "inactive" | "suspended";
  contactPerson?: string;
  phone?: string;
  website?: string;
  feedUrl?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
  lastSyncBatchId?: string;
  consecutiveFailures?: number;
  isRunning?: boolean; // Real-time sync status from getSyncStatus
  activeBatch?: AffiliateBatch; // Current processing batch
  logoUrl?: string;
  outboundFeedEnabled?: boolean;
  outboundFeedSlug?: string;
  outboundFeedFilename?: string;
  outboundFeedCronExpression?: string;
  outboundFeedTimezone?: string;
  outboundFeedUrl?: string | null;
  outboundFeedLastBuiltAt?: string;
  outboundFeedLastBuildStatus?: "success" | "failed" | "in_progress";
  outboundFeedLastBuildError?: string;
  outboundFeedJobCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliatePartnerFeedRule {
  id: string;
  affiliatePartnerId: string;
  ruleGroupLabel?: string | null;
  occupationName: string;
  specialtyName?: string | null;
  states: string[];
  cpc?: number | null;
  cpa?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateFaq {
  question: string;
  answer: string;
}

export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  type?: string;
  format?: string;
  targetAudience?: string;
  contentLevel?: string;
  overview?: string;
  whoShouldEnroll?: string;
  whatYoullLearn?: string[];
  careerOutlook?: string;
  faqs?: AffiliateFaq[];
  ceHours?: number;
  ceCredits?: number;
  occupations?: string[];
  courseThumbnail?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  affiliateId: string;
  affiliate?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface AffiliateBatch {
  id: string;
  affiliateId: string;
  fileName: string;
  s3Key: string;
  parserVersion: string;
  status: "pending" | "processing" | "completed" | "failed" | "partial" | "cancelled";
  totalJobs: number;
  processedJobs: number;
  duplicateJobs: number;
  failedJobs: number;
  errorLog?: string;
  retryCount: number;
  uploadedBy?: string; // Admin user ID - null for auto-synced batches
  uploadedAt: string;
  updatedAt: string;
  affiliate: {
    id: string;
    name: string;
  };
}

export interface AffiliateBatchJob {
  id: string;
  title: string;
  externalJobPostCompanyName: string;
  locationCity: string;
  locationState: string;
  isPublished: boolean;
  datePosted: string;
  occupation: {
    id: string;
    name: string;
  };
}

export interface BatchStatus {
  id: string;
  status: string;
  totalJobs: number;
  processedJobs: number;
  duplicateJobs: number;
  failedJobs: number;
  errorLog?: string;
  progress: number; // 0-100
}

export interface AffiliateAnalytics {
  totalAffiliateJobs: number;
  publishedAffiliateJobs: number;
  totalClicks: number;
  authenticatedClicks: number;
  guestClicks: number;
  autoRedirectClicks: number;
  manualClicks: number;
  partnerFeedClicks?: number;
  cpcSpend?: number;
  estimatedSpend?: number;
  partnerFeedConversions?: number;
  partnerFeedConversionRate?: number;
  costPerConversion?: number | null;
  totalCpaSpend?: number;
  avgCpaPerConversion?: number | null;
  clicksBySource?: {
    manual: number;
    autoRedirect: number;
    partnerFeed: number;
  };
  uniqueCandidates: number;
  uniqueIpAddresses: number;
  topJobs: Array<{
    jobId: string;
    id: string;
    title: string;
    externalJobPostCompanyName: string;
    locationCity: string;
    locationState: string;
    clicks: number;
    uniqueIpAddresses: number;
    affiliate: {
      id: string;
      name: string;
    } | null;
  }>;
  clicksOverTime: Array<{
    date: string;
    clicks: number;
    uniqueIpAddresses: number;
    authenticatedClicks: number;
    guestClicks: number;
    estimatedSpend?: number;
  }>;
  redirectsByJobTitle: Array<{
    jobTitle: string;
    count: number;
  }>;
  // Conversion metrics
  totalConversions: number;
  conversionRate: number; // percentage: conversions/clicks * 100
  totalPayout: number;
  conversions: Array<{
    id: string;
    jobPostId: string;
    jobTitle: string;
    candidateId: string | null;
    applicationId: string | null;
    partner: string;
    payout: number | null;
    partnerConversionId: string | null;
    ipAddress: string | null;
    convertedAt: string;
  }>;
}

export interface CreatePartnerData {
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  feedUrl?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  logo?: File;
  outboundFeedEnabled?: boolean;
  outboundFeedCronExpression?: string;
  outboundFeedTimezone?: string;
  outboundFeedFilename?: string;
}

export interface UpdatePartnerData {
  name?: string;
  email?: string;
  status?: "active" | "inactive" | "suspended";
  contactPerson?: string;
  phone?: string;
  website?: string;
  feedUrl?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  logo?: File;
  outboundFeedEnabled?: boolean;
  outboundFeedCronExpression?: string;
  outboundFeedTimezone?: string;
  outboundFeedFilename?: string;
}

export interface CreateFeedRuleData {
  ruleGroupLabel?: string;
  occupationName: string;
  specialtyName?: string | null;
  states?: string[];
  cpc?: number | null;
  cpa?: number | null;
  isActive?: boolean;
}

export interface UpdateFeedRuleData {
  ruleGroupLabel?: string | null;
  occupationName?: string;
  specialtyName?: string | null;
  states?: string[];
  cpc?: number | null;
  cpa?: number | null;
  isActive?: boolean;
}

export interface CreateLinkData {
  name: string;
  url: string;
  type?: string;
  format?: string;
  courseThumbnail?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  targetAudience?: string;
  contentLevel?: string;
  overview?: string;
  whoShouldEnroll?: string;
  whatYoullLearn?: string[];
  careerOutlook?: string;
  faqs?: AffiliateFaq[];
  ceHours?: number;
  ceCredits?: number;
  occupations?: string[];
  affiliateId: string;
}

export interface UpdateLinkData {
  name?: string;
  url?: string;
  type?: string;
  format?: string;
  courseThumbnail?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  targetAudience?: string;
  contentLevel?: string;
  overview?: string;
  whoShouldEnroll?: string;
  whatYoullLearn?: string[];
  careerOutlook?: string;
  faqs?: AffiliateFaq[];
  ceHours?: number;
  ceCredits?: number;
  occupations?: string[];
  affiliateId?: string;
}

// Partner Management APIs
export const getAffiliatePartners = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: AffiliatePartner[]; total: number; page: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  const queryString = queryParams.toString();
  return apiGet(`/api/admin/affiliates/partners${queryString ? `?${queryString}` : ""}`);
};

export const getAffiliatePartner = async (id: string): Promise<AffiliatePartner> => {
  return apiGet(`/api/admin/affiliates/partners/${id}`);
};

export const createAffiliatePartner = async (data: CreatePartnerData): Promise<AffiliatePartner> => {
  if (data.logo) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    const res = await apiRequest<{ data: AffiliatePartner }>("/api/admin/affiliates/partners", {
      method: "POST",
      body: formData,
    });
    return res.data;
  }
  const res = await apiPost<{ data: AffiliatePartner }>("/api/admin/affiliates/partners", data);
  return res.data;
};

export const updateAffiliatePartner = async (id: string, data: UpdatePartnerData): Promise<AffiliatePartner> => {
  if (data.logo) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    const res = await apiRequest<{ data: AffiliatePartner }>(`/api/admin/affiliates/partners/${id}`, {
      method: "PUT",
      body: formData,
    });
    return res.data;
  }
  const res = await apiPut<{ data: AffiliatePartner }>(`/api/admin/affiliates/partners/${id}`, data);
  return res.data;
};

export const deleteAffiliatePartner = async (id: string): Promise<void> => {
  return apiDelete(`/api/admin/affiliates/partners/${id}`);
};

// Affiliate Link Management APIs
export const getAffiliateLinks = async (params?: {
  page?: number;
  limit?: number;
  affiliateId?: string;
}): Promise<{ data: AffiliateLink[]; total: number; page: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.affiliateId) queryParams.append("affiliateId", params.affiliateId);
  const queryString = queryParams.toString();
  const res = await apiGet<{ data: AffiliateLink[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/admin/affiliates/links${queryString ? `?${queryString}` : ""}`);
  return {
    data: res.data,
    ...res.pagination
  };
};

export const createAffiliateLink = async (data: CreateLinkData): Promise<AffiliateLink> => {
  const res = await apiPost<{ data: AffiliateLink }>("/api/admin/affiliates/links", data);
  return res.data;
};

export const updateAffiliateLink = async (id: string, data: UpdateLinkData): Promise<AffiliateLink> => {
  const res = await apiPut<{ data: AffiliateLink }>(`/api/admin/affiliates/links/${id}`, data);
  return res.data;
};

export const deleteAffiliateLink = async (id: string): Promise<void> => {
  return apiDelete(`/api/admin/affiliates/links/${id}`);
};

export interface AffiliateLinkType {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Link Type Configuration APIs
export const getAffiliateLinkTypes = async (): Promise<AffiliateLinkType[]> => {
  const res = await apiGet<{ success: boolean; data: AffiliateLinkType[] }>("/api/admin/affiliates/link-types");
  return res.data || [];
};

export const createAffiliateLinkType = async (data: { name: string }): Promise<AffiliateLinkType> => {
  const res = await apiPost<{ success: boolean; data: AffiliateLinkType }>("/api/admin/affiliates/link-types", data);
  return res.data;
};

export const updateAffiliateLinkType = async (
  id: string,
  data: { name?: string; isActive?: boolean; sortOrder?: number },
): Promise<AffiliateLinkType> => {
  const res = await apiPut<{ success: boolean; data: AffiliateLinkType }>(`/api/admin/affiliates/link-types/${id}`, data);
  return res.data;
};

export const deleteAffiliateLinkType = async (id: string): Promise<void> => {
  await apiDelete(`/api/admin/affiliates/link-types/${id}`);
};

export const reorderAffiliateLinkTypes = async (ids: string[]): Promise<AffiliateLinkType[]> => {
  const res = await apiPut<{ success: boolean; data: AffiliateLinkType[] }>("/api/admin/affiliates/link-types/reorder", { ids });
  return res.data || [];
};

// Upload & Batch Management APIs
export const uploadAffiliateXML = async (
  file: File,
  partnerId: string
): Promise<{ batchId: string; message: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("partnerId", partnerId);

  return apiRequest("/api/admin/affiliates/upload", {
    method: "POST",
    body: formData,
    // Don't set Content-Type, let browser set it with boundary
  });
};

export const getAffiliateBatches = async (params?: {
  page?: number;
  limit?: number;
  affiliateId?: string;
  status?: string;
}): Promise<{ data: AffiliateBatch[]; total: number; page: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.affiliateId) queryParams.append("affiliateId", params.affiliateId);
  if (params?.status) queryParams.append("status", params.status);
  const queryString = queryParams.toString();
  return apiGet(`/api/admin/affiliates/batches${queryString ? `?${queryString}` : ""}`);
};

export const getAffiliateBatchStatus = async (batchId: string): Promise<BatchStatus> => {
  return apiGet(`/api/admin/affiliates/batches/${batchId}/status`);
};

export const getAffiliateBatchJobs = async (
  batchId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<{ data: AffiliateBatchJob[]; total: number; page: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  const queryString = queryParams.toString();
  const response = await apiGet<{
    data: AffiliateBatchJob[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/admin/affiliates/batches/${batchId}/jobs${queryString ? `?${queryString}` : ""}`);

  // Transform response to match expected format
  return {
    data: response.data,
    total: response.pagination.total,
    page: response.pagination.page,
    totalPages: response.pagination.totalPages,
  };
};

export const reprocessAffiliateBatch = async (batchId: string): Promise<{ message: string; batchId: string }> => {
  return apiPost(`/api/admin/affiliates/batches/${batchId}/reprocess`, {});
};

export const cancelAffiliateBatch = async (
  batchId: string
): Promise<{ message: string; batchId: string }> => {
  return apiPost(`/api/admin/affiliates/batches/${batchId}/cancel`, {});
};

// Sync Management APIs
export const triggerAffiliateSync = async (partnerId: string): Promise<{ batchId: string; message: string }> => {
  return apiPost(`/api/admin/affiliates/partners/${partnerId}/sync`, {});
};

export const getAffiliateSyncStatus = async (): Promise<any[]> => {
  const response = await apiGet<{ success: boolean; data: any[] }>("/api/admin/affiliates/sync-status");
  return response.data || [];
};

// Analytics APIs
export const getAffiliateAnalytics = async (params?: {
  affiliateId?: string;
  startDate?: string;
  endDate?: string;
  source?: "manual" | "auto-redirect" | "partner-feed";
  partnerType?: "selling" | "buying";
  deduplicate?: boolean;
  requireApplication?: boolean;
}): Promise<AffiliateAnalytics> => {
  const queryParams = new URLSearchParams();
  if (params?.affiliateId) queryParams.append("affiliateId", params.affiliateId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.source) queryParams.append("source", params.source);
  if (params?.partnerType) queryParams.append("partnerType", params.partnerType);
  if (params?.deduplicate !== undefined) queryParams.append("deduplicate", String(params.deduplicate));
  if (params?.requireApplication !== undefined) queryParams.append("requireApplication", String(params.requireApplication));
  const queryString = queryParams.toString();
  const response = await apiGet<{ success: boolean; data: AffiliateAnalytics }>(
    `/api/admin/affiliates/analytics${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

// Outbound Feed APIs
export const rebuildOutboundFeed = async (
  partnerId: string
): Promise<{ jobCount: number; s3Key: string; outboundFeedLastBuiltAt: string }> => {
  const response = await apiPost<{
    success: boolean;
    data: { jobCount: number; s3Key: string; outboundFeedLastBuiltAt: string };
  }>(`/api/admin/affiliates/partners/${partnerId}/rebuild-feed`, {});
  return response.data;
};

export const getPartnerFeedRules = async (
  partnerId: string
): Promise<AffiliatePartnerFeedRule[]> => {
  const response = await apiGet<{ success: boolean; data: AffiliatePartnerFeedRule[] }>(
    `/api/admin/affiliates/partners/${partnerId}/feed-rules`
  );
  return response.data;
};

export const createPartnerFeedRule = async (
  partnerId: string,
  data: CreateFeedRuleData
): Promise<AffiliatePartnerFeedRule> => {
  const response = await apiPost<{ success: boolean; data: AffiliatePartnerFeedRule }>(
    `/api/admin/affiliates/partners/${partnerId}/feed-rules`,
    data
  );
  return response.data;
};

export const updatePartnerFeedRule = async (
  ruleId: string,
  data: UpdateFeedRuleData
): Promise<AffiliatePartnerFeedRule> => {
  const response = await apiPut<{ success: boolean; data: AffiliatePartnerFeedRule }>(
    `/api/admin/affiliates/feed-rules/${ruleId}`,
    data
  );
  return response.data;
};

export const deletePartnerFeedRule = async (ruleId: string): Promise<void> => {
  return apiDelete(`/api/admin/affiliates/feed-rules/${ruleId}`);
};

// ===== Co-Registration APIs (multi-partner) =====

export interface CoRegRecord {
  id: string;
  partner: string;
  email: string;
  occupation: string | null;
  location: string | null;
  status: "success" | "failed" | "duplicate";
  responseCode: number | null;
  attempts: number;
  errorMessage: string | null;
  sentAt: string;
  updatedAt: string;
}

export interface CoRegListResponse {
  success: boolean;
  records: CoRegRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    successCount: number;
    failedCount: number;
    duplicateCount: number;
  };
}

export const getCoRegs = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  partner?: string;
}): Promise<CoRegListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status && params.status !== "all") queryParams.append("status", params.status);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.partner) queryParams.append("partner", params.partner);
  const queryString = queryParams.toString();
  return apiGet<CoRegListResponse>(`/api/admin/affiliates/coreg${queryString ? `?${queryString}` : ""}`);
};

// ===== Report Recipients APIs =====

export interface AffiliateReportRecipient {
  id: string;
  affiliatePartnerId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const getReportRecipients = async (partnerId: string): Promise<AffiliateReportRecipient[]> => {
  const res = await apiGet<{ success: boolean; data: AffiliateReportRecipient[] }>(
    `/api/admin/affiliates/partners/${partnerId}/report-recipients`
  );
  return res.data;
};

export const addReportRecipient = async (partnerId: string, email: string): Promise<AffiliateReportRecipient> => {
  const res = await apiPost<{ success: boolean; data: AffiliateReportRecipient }>(
    `/api/admin/affiliates/partners/${partnerId}/report-recipients`,
    { email }
  );
  return res.data;
};

export const removeReportRecipient = async (partnerId: string, recipientId: string): Promise<void> => {
  return apiDelete(`/api/admin/affiliates/partners/${partnerId}/report-recipients/${recipientId}`);
};
