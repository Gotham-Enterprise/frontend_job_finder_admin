import { apiRequest } from "./apiUtils";
import type {
  ApiRequestLog,
  ApiRequestOverview,
  TopEndpoint,
  StatusCodeBreakdown,
  EndpointTrend,
  PaginatedMeta,
} from "@/types/api-request-log";

class ApiRequestLogAPI {
  private baseURL = "/api/admin/api-request-logs";

  async getLogs(params: {
    page?: number;
    limit?: number;
    hours?: number;
    method?: string;
    statusCode?: number;
    path?: string;
    routeKey?: string;
  }): Promise<{
    success: boolean;
    data: ApiRequestLog[];
    metaData: PaginatedMeta;
  }> {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.hours) search.set("hours", String(params.hours));
    if (params.method) search.set("method", params.method);
    if (params.statusCode !== undefined)
      search.set("statusCode", String(params.statusCode));
    if (params.path) search.set("path", params.path);
    if (params.routeKey) search.set("routeKey", params.routeKey);
    const qs = search.toString();
    return apiRequest(`${this.baseURL}${qs ? `?${qs}` : ""}`);
  }

  async getOverview(
    hours: number = 24
  ): Promise<{ success: boolean; data: ApiRequestOverview }> {
    return apiRequest(`${this.baseURL}/overview?hours=${hours}`);
  }

  async getTopEndpoints(
    hours: number = 24,
    limit: number = 20
  ): Promise<{ success: boolean; data: TopEndpoint[] }> {
    return apiRequest(
      `${this.baseURL}/endpoints/top?hours=${hours}&limit=${limit}`
    );
  }

  async getStatusCodeBreakdown(
    hours: number = 24
  ): Promise<{ success: boolean; data: StatusCodeBreakdown[] }> {
    return apiRequest(`${this.baseURL}/status-codes?hours=${hours}`);
  }

  async getEndpointTrends(
    routeKey: string,
    method: string,
    hours: number = 24
  ): Promise<{ success: boolean; data: EndpointTrend[] }> {
    return apiRequest(
      `${this.baseURL}/endpoints/trends?routeKey=${encodeURIComponent(routeKey)}&method=${encodeURIComponent(method)}&hours=${hours}`
    );
  }
}

export const apiRequestLogAPI = new ApiRequestLogAPI();
