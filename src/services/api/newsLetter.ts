import { NewsletterData } from "@/store/slices/newsletterSlice";
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

export interface Newsletter {
  id: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design?: any;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterPayload {
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design: string;
}

export interface NewsletterFilters {
  page?: number;
  limit?: number;
  keywords?: string;
  status?: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface PaginationMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NewslettersListResponse {
  success: boolean;
  data: Newsletter[];
  metaData: PaginationMetaData;
}

export interface ArchivedNewsletterResponse {
  success: boolean;
  data: Newsletter[];
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

export interface DeleteNewsletterRequest {
  newsLetterIds: string[];
}

export interface DeleteNewsletterResponse {
  success: boolean;
  message: string;
  data: any[];
}

export interface BulkPublishRequest {
  newsLetterIds: string[];
}

export interface BulkScheduleRequest {
  newsLetterIds: string[];
  scheduledAt: string;
  scheduledTimezone: string;
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  data: any[];
}

export interface NewsletterEmailUser {
  email: string;
  name: string;
}

export interface NewsletterEmailGroup {
  role: "employer" | "job-seeker";
  users: NewsletterEmailUser[];
  count: number;
}

export interface NewsletterEmailResponse {
  success: boolean;
  data: NewsletterEmailGroup[];
}

export const createNewsletter = async (data: NewsletterData): Promise<NewsletterResponse> => {
  let designString: string;
  if (data.design && typeof data.design === "object") {
    try {
      designString = JSON.stringify(data.design);
    } catch (error) {
      designString = "{}"; // Fallback to empty object JSON
    }
  } else if (typeof data.design === "string" && data.design.trim().length > 0) {
    designString = data.design; // Already a string
  } else {
    designString = "{}"; // Backend requires non-empty string
  }

  const payload: NewsletterPayload = {
    subject: data.subject,
    fromName: data.fromName,
    fromAddress: data.fromAddress,
    sendTo: data.sendTo,
    dontSendTo: data.dontSendTo,
    status: data.status,
    scheduledAt: data.scheduledAt,
    scheduledTimezone: data.scheduledTimezone,
    isTemplate: data.isTemplate,
    content: data.content,
    design: designString, // Send as JSON string (required by backend)
  };

  try {
    const response = await apiPost<NewsletterResponse>("/api/admin/newsletter/", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateNewsletter = async (id: string, data: Partial<NewsletterData>): Promise<NewsletterResponse> => {
  const cleanedData = { ...data };
  if (data.design && typeof data.design === "object") {
    try {
      cleanedData.design = JSON.stringify(data.design);
    } catch (error) {
      console.error("❌ [UPDATE] Failed to stringify design:", error);
      cleanedData.design = "{}";
    }
  }

  try {
    const response = await apiPut<NewsletterResponse>(`/api/admin/newsletter/${id}`, cleanedData);

    return response;
  } catch (error) {
    throw error;
  }
};

export const getNewsletterById = async (id: string): Promise<NewsletterResponse> => {
  try {
    const response = await apiGet<NewsletterResponse>(`/api/admin/newsletter/${id}`);

    if (response.data?.design && typeof response.data.design === "string") {
      try {
        response.data.design = JSON.parse(response.data.design);
      } catch (error) {
        console.error(`❌ Failed to parse design for newsletter: ${id}`);
        response.data.design = {};
      }
    }

    return response;
  } catch (error) {
    console.error("❌ [GET BY ID] API Error:", error);
    throw error;
  }
};

export const getNewsletters = async (
  status?: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED",
  page: number = 1,
  limit: number = 10
): Promise<NewslettersListResponse> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `/api/admin/newsletter/?${params.toString()}`;
    const response = await apiGet<NewslettersListResponse>(url);

    // Backend stores design as JSON string, parse it back to object
    const newsletters = response.data.map((newsletter) => {
      if (newsletter.design && typeof newsletter.design === "string") {
        try {
          newsletter.design = JSON.parse(newsletter.design);
          console.log(`✅ Parsed design for newsletter: ${newsletter.id}`);
        } catch (error) {
          console.error(`❌ Failed to parse design for newsletter: ${newsletter.id}`);
          newsletter.design = {};
        }
      }
      return newsletter;
    });

    return {
      ...response,
      data: newsletters,
    };
  } catch (error) {
    console.error("❌ [GET ALL] API Error:", error);
    throw error;
  }
};

export const deleteNewsletters = async (newsLetterIds: string[]): Promise<DeleteNewsletterResponse> => {
  try {
    console.log("🗑️ [DELETE] Deleting newsletters:", newsLetterIds);
    const response = await apiDelete<DeleteNewsletterResponse>("/api/admin/newsletter", {
      body: { newsLetterIds },
    });
    console.log("✅ [DELETE] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [DELETE] API Error:", error);
    throw error;
  }
};

export const bulkPublishNewsletters = async (newsLetterIds: string[]): Promise<BulkActionResponse> => {
  try {
    console.log("📤 [BULK PUBLISH] Publishing newsletters:", newsLetterIds);
    const response = await apiPut<BulkActionResponse>("/api/admin/newsletter/publish/all", {
      newsLetterIds,
    });
    console.log("✅ [BULK PUBLISH] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [BULK PUBLISH] API Error:", error);
    throw error;
  }
};

export const bulkScheduleNewsletters = async (
  newsLetterIds: string[],
  scheduledAt: string,
  scheduledTimezone: string
): Promise<BulkActionResponse> => {
  try {
    console.log("📅 [BULK SCHEDULE] Scheduling newsletters:", newsLetterIds);
    const response = await apiPut<BulkActionResponse>("/api/admin/newsletter/schedule/all", {
      newsLetterIds,
      scheduledAt,
      scheduledTimezone,
    });
    console.log("✅ [BULK SCHEDULE] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [BULK SCHEDULE] API Error:", error);
    throw error;
  }
};

export const bulkRestoreNewsletters = async (newsLetterIds: string[]): Promise<BulkActionResponse> => {
  try {
    console.log("♻️ [BULK RESTORE] Restoring newsletters:", newsLetterIds);
    const response = await apiPut<BulkActionResponse>("/api/admin/newsletter/restore/all", {
      newsLetterIds,
    });
    console.log("✅ [BULK RESTORE] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [BULK RESTORE] API Error:", error);
    throw error;
  }
};

// API object for organized access
export const newsletterApi = {
  create: createNewsletter,
  update: updateNewsletter,
  getById: getNewsletterById,
  getAll: getNewsletters,
  delete: deleteNewsletters,

  async getNewsletterEmails(): Promise<NewsletterEmailResponse> {
    return apiGet<NewsletterEmailResponse>("/api/admin/newsletter/email/list");
  },

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
