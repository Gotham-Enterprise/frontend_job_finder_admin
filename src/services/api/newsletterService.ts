import { NewsletterData } from "@/store/slices/newsletterSlice";
import { apiPost, apiPatch, apiGet } from "./apiUtils";

interface NewsletterPayload {
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design?: any;
}

interface Newsletter {
  id: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT";
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

interface NewslettersListResponse {
  success: boolean;
  data: Newsletter[];
}

export const createNewsletter = async (data: NewsletterData): Promise<NewsletterResponse> => {
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
    design: data.design, // Map design to design for API
  };

  console.log("🚀 Sending to API:", {
    ...payload,
    content: payload.content ? `${payload.content.substring(0, 50)}... (${payload.content.length} chars)` : "EMPTY!",
    design: payload.design ? JSON.stringify(payload.design).substring(0, 100) : "NO DESIGN",
  });

  console.log("🔍 Full design object:", payload.design);
  console.log("🔍 Design type:", typeof payload.design);

  try {
    const response = await apiPost<NewsletterResponse>("/api/admin/newsletter/", payload);
    return response;
  } catch (error) {
    console.error("Newsletter API Error:", error);
    throw error;
  }
};

export const updateNewsletter = async (id: string, data: Partial<NewsletterData>): Promise<NewsletterResponse> => {
  try {
    const response = await apiPatch<NewsletterResponse>(`/api/admin/newsletter/${id}`, data);
    return response;
  } catch (error) {
    console.error("Newsletter Update API Error:", error);
    throw error;
  }
};

export const getNewsletters = async (status?: "DRAFT" | "SCHEDULED" | "SENT"): Promise<Newsletter[]> => {
  try {
    const url = status ? `/api/admin/newsletter/?status=${status}` : "/api/admin/newsletter/";
    const response = await apiGet<NewslettersListResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Newsletter Fetch API Error:", error);
    throw error;
  }
};
