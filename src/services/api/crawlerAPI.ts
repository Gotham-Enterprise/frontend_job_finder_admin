import { apiGet } from "./apiUtils";
import type { CrawlerDashboardData, BotCrawlerRequest, CrawlerAlert, CrawlerHealthPoint } from "@/types/crawler";

class CrawlerAPI {
  getDashboard(params: { period?: string; crawlerType?: string; seoPageType?: string; httpStatus?: string } = {}): Promise<{ success: boolean; data: CrawlerDashboardData }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    if (params.crawlerType) query.set("crawlerType", params.crawlerType);
    if (params.seoPageType) query.set("seoPageType", params.seoPageType);
    if (params.httpStatus) query.set("httpStatus", params.httpStatus);
    return apiGet(`/api/admin/crawler/dashboard?${query.toString()}`);
  }

  getRequests(params: { period?: string; crawlerType?: string; seoPageType?: string; httpStatus?: string; url?: string; limit?: string; offset?: string } = {}): Promise<{ success: boolean; data: BotCrawlerRequest[]; pagination: { total: number; limit: number; offset: number } }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    if (params.crawlerType) query.set("crawlerType", params.crawlerType);
    if (params.seoPageType) query.set("seoPageType", params.seoPageType);
    if (params.httpStatus) query.set("httpStatus", params.httpStatus);
    if (params.url) query.set("url", params.url);
    if (params.limit) query.set("limit", params.limit);
    if (params.offset) query.set("offset", params.offset);
    return apiGet(`/api/admin/crawler/requests?${query.toString()}`);
  }

  getAlerts(params: { period?: string } = {}): Promise<{ success: boolean; data: CrawlerAlert[] }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    return apiGet(`/api/admin/crawler/alerts?${query.toString()}`);
  }

  getCrawlerHealth(params: { period?: string } = {}): Promise<{ success: boolean; data: CrawlerHealthPoint[] }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    return apiGet(`/api/admin/crawler/health?${query.toString()}`);
  }

  // CloudWatch WAF-powered endpoints
  getCwDashboard(params: { period?: string } = {}): Promise<{ success: boolean; data: any; source: string }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    return apiGet(`/api/admin/crawler/cw/dashboard?${query.toString()}`);
  }

  getCwRequests(params: { period?: string; limit?: string } = {}): Promise<{ success: boolean; data: any[]; source: string }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    if (params.limit) query.set("limit", params.limit);
    return apiGet(`/api/admin/crawler/cw/requests?${query.toString()}`);
  }

  getCwAlerts(params: { period?: string } = {}): Promise<{ success: boolean; data: any[]; source: string }> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    return apiGet(`/api/admin/crawler/cw/alerts?${query.toString()}`);
  }
}

export const crawlerAPI = new CrawlerAPI();
