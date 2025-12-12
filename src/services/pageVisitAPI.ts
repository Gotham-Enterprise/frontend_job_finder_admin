import {
  PageVisitThreshold,
  PageVisitAlert,
  PageVisitStatistics,
  TopPage,
  SystemHealthMetrics,
  MemoryRecommendation,
  PageVisitEmailRecipient,
} from "@/types/page-visit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/" || "http://localhost:5000/";

class PageVisitAPI {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Thresholds
  async getThresholds(): Promise<{ success: boolean; data: PageVisitThreshold[] }> {
    return this.fetchWithAuth("api/admin/page-visits/thresholds");
  }

  async getThreshold(id: string): Promise<{ success: boolean; data: PageVisitThreshold }> {
    return this.fetchWithAuth(`api/admin/page-visits/thresholds/${id}`);
  }

  async createThreshold(data: {
    pageUrl: string;
    expectedVisits: number;
    timeWindowHours: number;
    enabled?: boolean;
  }): Promise<{ success: boolean; data: PageVisitThreshold }> {
    return this.fetchWithAuth("api/admin/page-visits/thresholds", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateThreshold(
    id: string,
    data: {
      pageUrl?: string;
      expectedVisits?: number;
      timeWindowHours?: number;
      enabled?: boolean;
    }
  ): Promise<{ success: boolean; data: PageVisitThreshold }> {
    return this.fetchWithAuth(`api/admin/page-visits/thresholds/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteThreshold(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`api/admin/page-visits/thresholds/${id}`, {
      method: "DELETE",
    });
  }

  // Statistics
  async getStatistics(pageUrl: string, hours: number = 24): Promise<{ success: boolean; data: PageVisitStatistics }> {
    return this.fetchWithAuth(`api/admin/page-visits/statistics?pageUrl=${encodeURIComponent(pageUrl)}&hours=${hours}`);
  }

  async getRealtimeCount(
    pageUrl: string,
    hours: number = 24
  ): Promise<{ success: boolean; data: { count: number; pageUrl: string; hours: number } }> {
    return this.fetchWithAuth(
      `api/admin/page-visits/realtime-count?pageUrl=${encodeURIComponent(pageUrl)}&hours=${hours}`
    );
  }

  async getTopPages(limit: number = 10, hours?: number): Promise<{ success: boolean; data: TopPage[] }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (hours) params.append("hours", hours.toString());
    return this.fetchWithAuth(`api/admin/page-visits/top-pages?${params}`);
  }

  // Alerts
  async getAlertHistory(filters?: {
    pageUrl?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: PageVisitAlert[] }> {
    const params = new URLSearchParams();
    if (filters?.pageUrl) params.append("pageUrl", filters.pageUrl);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const query = params.toString();
    return this.fetchWithAuth(`api/admin/page-visits/alerts${query ? `?${query}` : ""}`);
  }

  // System Health
  async getSystemHealth(): Promise<{ success: boolean; data: SystemHealthMetrics }> {
    return this.fetchWithAuth("api/admin/page-visits/health");
  }

  async getMemoryStats(): Promise<{
    success: boolean;
    data: {
      memoryStatus: any;
      trackingStats: any;
      recommendations: MemoryRecommendation[];
    };
  }> {
    return this.fetchWithAuth("api/admin/page-visits/memory");
  }

  async updateRetentionPeriod(days: number): Promise<{ success: boolean; data: any }> {
    return this.fetchWithAuth("api/admin/page-visits/retention", {
      method: "POST",
      body: JSON.stringify({ days }),
    });
  }

  async forceCleanup(): Promise<{ success: boolean; data: any }> {
    return this.fetchWithAuth("api/admin/page-visits/cleanup", {
      method: "POST",
    });
  }

  async getCircuitStatus(): Promise<{ success: boolean; data: any }> {
    return this.fetchWithAuth("api/admin/page-visits/circuit");
  }

  async resetCircuit(): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth("api/admin/page-visits/circuit/reset", {
      method: "POST",
    });
  }

  // Email Recipients
  async getEmailRecipients(): Promise<{ success: boolean; data: PageVisitEmailRecipient[] }> {
    return this.fetchWithAuth("api/admin/page-visits/email-recipients");
  }

  async getEmailRecipient(id: string): Promise<{ success: boolean; data: PageVisitEmailRecipient }> {
    return this.fetchWithAuth(`api/admin/page-visits/email-recipients/${id}`);
  }

  async createEmailRecipient(data: {
    name: string;
    email: string;
    enabled?: boolean;
  }): Promise<{ success: boolean; data: PageVisitEmailRecipient; message: string }> {
    return this.fetchWithAuth("api/admin/page-visits/email-recipients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEmailRecipient(
    id: string,
    data: {
      name?: string;
      email?: string;
      enabled?: boolean;
    }
  ): Promise<{ success: boolean; data: PageVisitEmailRecipient; message: string }> {
    return this.fetchWithAuth(`api/admin/page-visits/email-recipients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEmailRecipient(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(`api/admin/page-visits/email-recipients/${id}`, {
      method: "DELETE",
    });
  }
}

export const pageVisitAPI = new PageVisitAPI();
