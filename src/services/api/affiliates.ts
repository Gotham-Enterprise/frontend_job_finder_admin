import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from "./apiUtils";

// Type definitions for affiliate partners
export interface AffiliatePartner {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  status: "active" | "inactive" | "suspended";
  contactPerson?: string;
  contactPhone?: string;
  websiteUrl?: string;
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
  commissionRate?: number;
  notes?: string;
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
    jobTitle: string;
    partner: string;
    payout: number | null;
    partnerConversionId: string | null;
    convertedAt: string;
  }>;
}

export interface CreatePartnerData {
  name: string;
  email: string;
  contactPerson?: string;
  contactPhone?: string;
  websiteUrl?: string;
  feedUrl?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  commissionRate?: number;
  notes?: string;
}

export interface UpdatePartnerData {
  name?: string;
  email?: string;
  status?: "active" | "inactive" | "suspended";
  contactPerson?: string;
  contactPhone?: string;
  websiteUrl?: string;
  feedUrl?: string;
  syncEnabled?: boolean;
  syncIntervalHours?: number;
  commissionRate?: number;
  notes?: string;
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
  return apiPost("/api/admin/affiliates/partners", data);
};

export const updateAffiliatePartner = async (id: string, data: UpdatePartnerData): Promise<AffiliatePartner> => {
  return apiPut(`/api/admin/affiliates/partners/${id}`, data);
};

export const deleteAffiliatePartner = async (id: string): Promise<void> => {
  return apiDelete(`/api/admin/affiliates/partners/${id}`);
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
}): Promise<AffiliateAnalytics> => {
  const queryParams = new URLSearchParams();
  if (params?.affiliateId) queryParams.append("affiliateId", params.affiliateId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  const queryString = queryParams.toString();
  const response = await apiGet<{ success: boolean; data: AffiliateAnalytics }>(
    `/api/admin/affiliates/analytics${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

// ===== Co-Registration APIs (multi-partner) =====

export interface CoRegRecord {
  id: string;
  partner: string;
  email: string;
  occupation: string | null;
  location: string | null;
  status: "success" | "failed";
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
