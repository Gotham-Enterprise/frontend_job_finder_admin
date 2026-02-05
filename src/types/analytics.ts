// Admin Analytics Type Definitions

export interface TrendData {
  value: string; // Percentage string like "11.01%"
  isPositive: boolean;
  difference: number;
}

export interface MetricWithTrend {
  title: string;
  value: string; // Formatted number like "3,782"
  trend: TrendData;
}

export interface OverviewMetricsResponse {
  success: boolean;
  data: {
    metrics: MetricWithTrend[];
  };
  fromCache?: boolean;
}

export interface ApplicationTrendsResponse {
  success: boolean;
  data: {
    period: string; // "24h" | "7d" | "28d" | "3m"
    categories: string[]; // X-axis labels like ["Jan", "Feb", ...]
    data: number[]; // Y-axis values
    total: number; // Total applications in period
  };
  fromCache?: boolean;
}

export interface CategorySeries {
  name: string; // Occupation name
  data: number[]; // Application counts over time
}

export interface CategoryDistributionResponse {
  success: boolean;
  data: {
    period: string;
    categories: string[]; // X-axis time labels
    series: CategorySeries[]; // Multiple series for different occupations
  };
  fromCache?: boolean;
}

export interface JobseekerTrendsResponse {
  success: boolean;
  data: {
    period: string; // "24h" | "7d" | "28d" | "3m"
    categories: string[]; // X-axis labels like ["Jan", "Feb", ...]
    data: number[]; // Y-axis values
    total: number; // Total new jobseekers in period
  };
  fromCache?: boolean;
}

export type Period = "24h" | "7d" | "28d" | "3m";

export interface AnalyticsError {
  success: false;
  message: string;
  error?: string;
}
