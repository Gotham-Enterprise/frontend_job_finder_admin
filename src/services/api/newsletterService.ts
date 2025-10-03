import { NewsletterData } from "@/store/slices/newsletterSlice";

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
  useTemplate?: any; // Unlayer design JSON for template
}

export const createNewsletter = async (data: NewsletterData): Promise<any> => {
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
    useTemplate: data.design, // Map design to useTemplate for API
  };

  try {
    const response = await fetch("/api/admin/newsletter/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create newsletter");
    }

    return await response.json();
  } catch (error) {
    console.error("Newsletter API Error:", error);
    throw error;
  }
};

export const updateNewsletter = async (id: string, data: Partial<NewsletterData>): Promise<any> => {
  try {
    const response = await fetch(`/api/admin/newsletter/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update newsletter");
    }

    return await response.json();
  } catch (error) {
    console.error("Newsletter Update API Error:", error);
    throw error;
  }
};
