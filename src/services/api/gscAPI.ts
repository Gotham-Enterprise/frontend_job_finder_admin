import { apiGet, apiPost, apiPut } from "./apiUtils";
import type {
  GscStatusResponse,
  GscSettingResponse,
  GscProperty,
  GscAnalyticsSummary,
  GscSitemap,
  GscSyncLogEntry,
} from "@/types/gsc";

class GscAPI {
  getStatus(): Promise<GscStatusResponse> {
    return apiGet<GscStatusResponse>("/api/admin/gsc/status");
  }

  updateSettings(key: string, value: string): Promise<GscSettingResponse> {
    return apiPut<GscSettingResponse>("/api/admin/gsc/settings", { key, value });
  }

  listProperties(): Promise<{ success: boolean; data: GscProperty[]; disabled?: boolean }> {
    return apiGet("/api/admin/gsc/properties");
  }

  getAnalyticsSummary(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: GscAnalyticsSummary | null; disabled?: boolean }> {
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    return apiGet(`/api/admin/gsc/analytics/summary?${query.toString()}`);
  }

  getAnalytics(params: {
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    dimensions?: string;
    aggregate?: string;
    query?: string;
    page?: string;
    limit?: string;
    offset?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params.propertyId) query.set("propertyId", params.propertyId);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.dimensions) query.set("dimensions", params.dimensions);
    if (params.aggregate) query.set("aggregate", params.aggregate);
    if (params.query) query.set("query", params.query);
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.offset) query.set("offset", params.offset);
    return apiGet(`/api/admin/gsc/analytics?${query.toString()}`);
  }

  getSitemaps(params: { propertyId?: string }): Promise<{ success: boolean; data: GscSitemap[]; disabled?: boolean }> {
    const query = new URLSearchParams();
    if (params.propertyId) query.set("propertyId", params.propertyId);
    return apiGet(`/api/admin/gsc/sitemaps?${query.toString()}`);
  }

  submitSitemap(siteUrl: string, feedPath: string): Promise<{ success: boolean }> {
    return apiPost("/api/admin/gsc/sitemaps", { siteUrl, feedPath });
  }

  deleteSitemap(siteUrl: string, path: string): Promise<{ success: boolean }> {
    return apiPost("/api/admin/gsc/sitemaps/delete", { siteUrl, path });
  }

  inspectUrl(siteUrl: string, inspectionUrl: string, languageCode?: string): Promise<any> {
    return apiPost("/api/admin/gsc/url-inspection", { siteUrl, inspectionUrl, languageCode });
  }

  triggerSync(propertyId?: string): Promise<{ success: boolean; data: any }> {
    return apiPost("/api/admin/gsc/sync", propertyId ? { propertyId } : {});
  }

  getSyncHistory(propertyId?: string): Promise<{ success: boolean; data: GscSyncLogEntry[] }> {
    const query = propertyId ? `?propertyId=${propertyId}` : "";
    return apiGet(`/api/admin/gsc/sync/history${query}`);
  }
}

export const gscAPI = new GscAPI();
