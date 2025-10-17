import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./apiUtils";

export interface ArchivedNewsletter {
  id: string;
  emailName: string;
  delivered: number;
  clickRate: string;
  lastUpdated: string;
  publishedDate: string;
  status: string;
}

export interface NewsletterFilters {
  page?: number;
  limit?: number;
  keywords?: string;
  status?: string;
}

export interface ArchivedNewsletterResponse {
  success: boolean;
  data: ArchivedNewsletter[];
  metaData?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export const newsletterApi = {
  // GET /api/admin/newsletter/archived/list - Get archived newsletters with pagination
  async getArchivedNewsletters(filters: NewsletterFilters = {}): Promise<ArchivedNewsletterResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.keywords) queryParams.append("keywords", filters.keywords);
    if (filters.status) queryParams.append("status", filters.status);

    const endpoint = `/api/admin/newsletter/archived/list?${queryParams.toString()}`;

    return apiGet<ArchivedNewsletterResponse>(endpoint);
  },
};
