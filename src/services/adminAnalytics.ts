import { apiGet } from "./api/apiUtils";
import type {
  OverviewMetricsResponse,
  ApplicationTrendsResponse,
  CategoryDistributionResponse,
  JobseekerTrendsResponse,
  Period,
  GroupBy,
} from "@/types/analytics";

class AdminAnalyticsService {
  /**
   * Get user's timezone using browser API
   */
  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.error("Failed to get timezone, defaulting to UTC:", error);
      return "UTC";
    }
  }

  /**
   * Get overview metrics (Total Jobs, Employers, Jobseekers with trends)
   */
  async getOverviewMetrics(): Promise<OverviewMetricsResponse> {
    const timezone = this.getTimezone();
    return apiGet<OverviewMetricsResponse>(`/api/admin/analytics/overview?timezone=${encodeURIComponent(timezone)}`);
  }

  /**
   * Get application trends for specified period
   * @param period - Time period: "24h", "7d", "28d", "3m"
   */
  async getApplicationTrends(period: Period = "3m"): Promise<ApplicationTrendsResponse> {
    const timezone = this.getTimezone();
    return apiGet<ApplicationTrendsResponse>(
      `/api/admin/analytics/application-trends?period=${period}&timezone=${encodeURIComponent(timezone)}`
    );
  }

  /**
   * Get jobs by category (occupation) for specified period
   * @param period - Time period: "24h", "7d", "28d", "3m"
   */
  async getJobsByCategory(period: Period = "3m"): Promise<CategoryDistributionResponse> {
    const timezone = this.getTimezone();
    return apiGet<CategoryDistributionResponse>(
      `/api/admin/analytics/jobs-by-category?period=${period}&timezone=${encodeURIComponent(timezone)}`
    );
  }

  /**
   * Get new jobseeker registration trends for specified period.
   * @param period - Time period: "24h", "7d", "28d", "3m", "6m", "9m", "1y", "custom"
   * @param customDateRange - Optional custom date range for "custom" period
   * @param groupBy - Optional grouping granularity for 3m–1y and custom ranges.
   *                  When omitted the backend uses its own default (daily for named
   *                  periods, auto-detect for custom).
   */
  async getJobseekerTrends(
    period: Period = "3m",
    customDateRange?: { startDate: string | null; endDate: string | null },
    groupBy?: GroupBy
  ): Promise<JobseekerTrendsResponse> {
    const timezone = this.getTimezone();
    let url = `/api/admin/analytics/jobseeker-trends?period=${period}&timezone=${encodeURIComponent(timezone)}`;

    if (period === "custom" && customDateRange?.startDate && customDateRange?.endDate) {
      url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
    }

    if (groupBy) {
      url += `&groupBy=${groupBy}`;
    }

    return apiGet<JobseekerTrendsResponse>(url);
  }
}

// Export singleton instance
export const adminAnalyticsService = new AdminAnalyticsService();
