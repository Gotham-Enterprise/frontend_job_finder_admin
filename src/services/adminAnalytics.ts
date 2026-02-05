import { apiGet } from "./api/apiUtils";
import type {
  OverviewMetricsResponse,
  ApplicationTrendsResponse,
  CategoryDistributionResponse,
  JobseekerTrendsResponse,
  Period,
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
  async getApplicationTrends(period: Period = "7d"): Promise<ApplicationTrendsResponse> {
    const timezone = this.getTimezone();
    return apiGet<ApplicationTrendsResponse>(
      `/api/admin/analytics/application-trends?period=${period}&timezone=${encodeURIComponent(timezone)}`
    );
  }

  /**
   * Get jobs by category (occupation) for specified period
   * @param period - Time period: "24h", "7d", "28d", "3m"
   */
  async getJobsByCategory(period: Period = "7d"): Promise<CategoryDistributionResponse> {
    const timezone = this.getTimezone();
    return apiGet<CategoryDistributionResponse>(
      `/api/admin/analytics/jobs-by-category?period=${period}&timezone=${encodeURIComponent(timezone)}`
    );
  }

  /**
   * Get new jobseeker registration trends for specified period
   * @param period - Time period: "24h", "7d", "28d", "3m"
   */
  async getJobseekerTrends(period: Period = "7d"): Promise<JobseekerTrendsResponse> {
    const timezone = this.getTimezone();
    return apiGet<JobseekerTrendsResponse>(
      `/api/admin/analytics/jobseeker-trends?period=${period}&timezone=${encodeURIComponent(timezone)}`
    );
  }
}

// Export singleton instance
export const adminAnalyticsService = new AdminAnalyticsService();
