import { apiGet, apiPost } from "./apiUtils";
import { emailCampaignSettingsApi } from "./emailCampaignSettings";
import type {
  NewsletterSubscribersResponse,
  NewsletterSubscriberFilters,
  NewsletterOverview,
  NewsletterSendLogsResponse,
} from "@/services/types/newsletterSubscriber";

export const newsletterSubscriberApi = {
  async getSubscribers(
    filters: NewsletterSubscriberFilters = {}
  ): Promise<NewsletterSubscribersResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.occupationId)
      queryParams.append("occupationId", filters.occupationId.toString());
    if (filters.city) queryParams.append("city", filters.city);
    if (filters.state) queryParams.append("state", filters.state);
    if (filters.status) queryParams.append("status", filters.status);

    const qs = queryParams.toString();
    return apiGet<NewsletterSubscribersResponse>(
      `/api/admin/newsletter-subscribers${qs ? `?${qs}` : ""}`
    );
  },

  async getOverview(): Promise<NewsletterOverview> {
    return apiGet<NewsletterOverview>("/api/admin/newsletter-subscribers/overview");
  },

  async getSendLogs(page = 1, limit = 20): Promise<NewsletterSendLogsResponse> {
    return apiGet<NewsletterSendLogsResponse>(
      `/api/admin/newsletter-subscribers/logs?page=${page}&limit=${limit}`
    );
  },

  async updateCampaignEnabled(isEnabled: boolean) {
    return emailCampaignSettingsApi.updateEmailCampaignSetting(
      "jobSeekerNewsletterEmail",
      { isEnabled }
    );
  },

  async unsubscribeSubscriber(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return apiPost(`/api/admin/newsletter-subscribers/${id}/unsubscribe`, {});
  },
};
