import type {
  ConversationTimelineResponse,
  EngagementOverviewPeriod,
  EngagementOverviewResponse,
  EngagementRole,
  SupervisionEngagementResponse,
} from "../types/supervisionEngagement";
import { apiGet } from "./apiUtils";

const ROLE_PATH: Record<EngagementRole, string> = {
  SUPERVISOR: "supervisors",
  SUPERVISEE: "supervisees",
};

export const supervisionEngagementApi = {
  /** Messaging + hiring activity for one supervisor or supervisee. */
  async getEngagement(role: EngagementRole, id: string): Promise<SupervisionEngagementResponse> {
    return apiGet<SupervisionEngagementResponse>(
      `/api/supervision/admin/${ROLE_PATH[role]}/${encodeURIComponent(id)}/engagement`
    );
  },

  /** When each message in a conversation was sent and read — never its content. */
  async getConversationTimeline(
    conversationId: string,
    page = 1,
    limit = 20
  ): Promise<ConversationTimelineResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiGet<ConversationTimelineResponse>(
      `/api/supervision/admin/conversations/${encodeURIComponent(conversationId)}/timeline?${params}`
    );
  },

  /** Platform-wide messaging + hiring overview, bucketed in `timezone`. */
  async getOverview(
    period: EngagementOverviewPeriod,
    timezone: string
  ): Promise<EngagementOverviewResponse> {
    const params = new URLSearchParams({ period, timezone });
    return apiGet<EngagementOverviewResponse>(`/api/supervision/admin/engagement/overview?${params}`);
  },
};
