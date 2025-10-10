import { NewsletterData } from "@/store/slices/newsletterSlice";
import { apiPost, apiPatch } from "./apiUtils";

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
  design?: any; // Unlayer design JSON for template
}

interface NewsletterResponse {
  success: boolean;
  message: string;
  data: any;
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
    design: payload.design ? "{ design object }" : "NO DESIGN",
  });

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
