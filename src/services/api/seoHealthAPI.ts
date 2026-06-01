import { apiGet } from "./apiUtils";
import type {
  SeoHealthResponse,
  SchemaQualityResponse,
  HealthDetailResponse,
  SeoHealthMetric,
} from "@/types/seo-health";

class SeoHealthAPI {
  async getHealth(): Promise<SeoHealthResponse> {
    return apiGet<SeoHealthResponse>("/api/admin/seo/health");
  }

  async getSchemaQuality(): Promise<SchemaQualityResponse> {
    return apiGet<SchemaQualityResponse>("/api/admin/seo/schema-quality");
  }

  async getHealthDetail(
    metric: SeoHealthMetric,
    params: { page?: number; limit?: number; issue?: string; filter?: string; days?: number } = {}
  ): Promise<HealthDetailResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.issue) query.set("issue", params.issue);
    if (params.filter) query.set("filter", params.filter);
    if (params.days) query.set("days", String(params.days));
    const qs = query.toString();
    return apiGet<HealthDetailResponse>(
      `/api/admin/seo/health/${metric}${qs ? `?${qs}` : ""}`
    );
  }
}

export const seoHealthAPI = new SeoHealthAPI();
