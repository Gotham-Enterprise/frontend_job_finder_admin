import { apiGet } from "./apiUtils";
import type { SeoHealthResponse, SchemaQualityResponse } from "@/types/seo-health";

class SeoHealthAPI {
  async getHealth(): Promise<SeoHealthResponse> {
    return apiGet<SeoHealthResponse>("/api/admin/seo/health");
  }

  async getSchemaQuality(): Promise<SchemaQualityResponse> {
    return apiGet<SchemaQualityResponse>("/api/admin/seo/schema-quality");
  }
}

export const seoHealthAPI = new SeoHealthAPI();
