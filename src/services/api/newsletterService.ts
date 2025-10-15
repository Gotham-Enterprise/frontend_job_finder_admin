import { NewsletterData } from "@/store/slices/newsletterSlice";
import { apiPost, apiPatch, apiGet } from "./apiUtils";

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
  design: string; // Backend expects JSON string (required, non-empty)
}

interface Newsletter {
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

interface NewsletterResponse {
  success: boolean;
  message: string;
  data: any;
}

interface PaginationMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface NewslettersListResponse {
  success: boolean;
  data: Newsletter[];
  metaData: PaginationMetaData;
}

export const createNewsletter = async (data: NewsletterData): Promise<NewsletterResponse> => {
  console.log("📥 [CREATE] Received data:");
  console.log("  - status:", data.status, "(type:", typeof data.status + ")");
  console.log("  - design type:", typeof data.design);

  // Backend requires design as a non-empty JSON string
  let designString: string;
  if (data.design && typeof data.design === "object") {
    try {
      designString = JSON.stringify(data.design);
      console.log("✅ [CREATE] Design stringified, length:", designString.length);
    } catch (error) {
      console.error("❌ [CREATE] Failed to stringify design:", error);
      designString = "{}"; // Fallback to empty object JSON
    }
  } else if (typeof data.design === "string" && data.design.trim().length > 0) {
    designString = data.design; // Already a string
  } else {
    console.warn("⚠️ [CREATE] No design provided, using empty object");
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

  console.log("🚀 [CREATE] Sending payload:");
  console.log("  - status:", payload.status, "(type:", typeof payload.status + ")");
  console.log("  - design length:", payload.design.length);
  console.log("  - Full status value:", JSON.stringify(payload.status));

  try {
    const response = await apiPost<NewsletterResponse>("/api/admin/newsletter/", payload);
    console.log("✅ [CREATE] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [CREATE] API Error:", error);
    throw error;
  }
};

export const updateNewsletter = async (id: string, data: Partial<NewsletterData>): Promise<NewsletterResponse> => {
  console.log("📥 [UPDATE] Received data for newsletter:", id);

  // Convert design to JSON string if it's an object
  let cleanedData = { ...data };
  if (data.design && typeof data.design === "object") {
    try {
      cleanedData.design = JSON.stringify(data.design);
      console.log("✅ [UPDATE] Design stringified, length:", cleanedData.design.length);
    } catch (error) {
      console.error("❌ [UPDATE] Failed to stringify design:", error);
      cleanedData.design = "{}";
    }
  }

  try {
    const response = await apiPatch<NewsletterResponse>(`/api/admin/newsletter/${id}`, cleanedData);
    console.log("✅ [UPDATE] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [UPDATE] API Error:", error);
    throw error;
  }
};

export const getNewsletterById = async (id: string): Promise<NewsletterResponse> => {
  try {
    const response = await apiGet<NewsletterResponse>(`/api/admin/newsletter/${id}`);
    console.log("📥 [GET BY ID] Received newsletter:", id);

    // Backend stores design as JSON string, parse it back to object
    if (response.data?.design && typeof response.data.design === "string") {
      try {
        response.data.design = JSON.parse(response.data.design);
        console.log(`✅ Parsed design for newsletter: ${id}`);
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

    console.log("📥 [GET ALL] Received newsletters:", response.data.length);
    console.log("📊 [PAGINATION] Metadata:", response.metaData);

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
