import { apiGet, apiPost, apiPut, apiDelete } from "./apiUtils";

export interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  targetAudience: "all" | "job-seeker" | "employer";
  filters: { country?: string; state?: string } | null;
  builderBlocks: import("@/components/admin/newsletter/builder/utils/blockTypes").EmailBlock[] | null;
  listIds: string[] | null;
  showHeader: boolean;
  showFooter: boolean;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number | null;
  createdBy: string;
  creator: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSendLog {
  id: string;
  newsletterId: string;
  recipientEmail: string;
  recipientId: string | null;
  status: "sent" | "failed";
  errorMessage: string | null;
  sentAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NewslettersResponse {
  success: boolean;
  data: Newsletter[];
  metaData: PaginationMeta;
}

export interface NewsletterResponse {
  success: boolean;
  data: Newsletter;
}

export interface NewsletterLogsResponse {
  success: boolean;
  data: NewsletterSendLog[];
  metaData: PaginationMeta;
}

export interface RecipientCountResponse {
  success: boolean;
  data: { count: number };
}

export interface CreateNewsletterRequest {
  title: string;
  subject: string;
  content: string;
  targetAudience?: "all" | "job-seeker" | "employer";
  filters?: { country?: string; state?: string };
  builderBlocks?: import("@/components/admin/newsletter/builder/utils/blockTypes").EmailBlock[];
  listIds?: string[];
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface UpdateNewsletterRequest {
  title?: string;
  subject?: string;
  content?: string;
  targetAudience?: "all" | "job-seeker" | "employer";
  filters?: { country?: string; state?: string };
  builderBlocks?: import("@/components/admin/newsletter/builder/utils/blockTypes").EmailBlock[];
  listIds?: string[];
  showHeader?: boolean;
  showFooter?: boolean;
}

const BASE = "/api/admin/newsletters";

export const newsletterApi = {
  getNewsletters: (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    return apiGet<NewslettersResponse>(`${BASE}?${params.toString()}`);
  },

  getNewsletter: (id: string) => apiGet<NewsletterResponse>(`${BASE}/${id}`),

  createNewsletter: (data: CreateNewsletterRequest) => apiPost<NewsletterResponse>(BASE, data),

  updateNewsletter: (id: string, data: UpdateNewsletterRequest) => apiPut<NewsletterResponse>(`${BASE}/${id}`, data),

  deleteNewsletter: (id: string) => apiDelete<{ success: boolean; message: string }>(`${BASE}/${id}`),

  sendNow: (id: string) => apiPost<{ success: boolean; message: string }>(`${BASE}/${id}/send`),

  scheduleNewsletter: (id: string, scheduledAt: string) =>
    apiPost<NewsletterResponse>(`${BASE}/${id}/schedule`, { scheduledAt }),

  cancelSchedule: (id: string) => apiDelete<NewsletterResponse>(`${BASE}/${id}/schedule`),

  getRecipientCount: (
    targetAudience: "all" | "job-seeker" | "employer",
    filters?: { country?: string; state?: string },
    listIds?: string[]
  ) => {
    const params = new URLSearchParams({ targetAudience });
    if (filters?.country) params.set("country", filters.country);
    if (filters?.state) params.set("state", filters.state);
    if (listIds && listIds.length > 0) params.set("listIds", listIds.join(","));
    return apiGet<RecipientCountResponse>(`${BASE}/recipient-count?${params.toString()}`);
  },

  getLogs: (id: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiGet<NewsletterLogsResponse>(`${BASE}/${id}/logs?${params.toString()}`);
  },

  duplicateNewsletter: (id: string) => apiPut<NewsletterResponse>(`${BASE}/${id}/duplicate`),
};
