export interface DashboardDetailsData {
  jobCount: number;
  employerCount: number;
  jobSeekerCount: number;
  jobseekerCountToday: number;
  employerCountToday: number;
  applicationCountToday: number;
}

export interface DashboardDetailsResponse {
  success: boolean;
  data: DashboardDetailsData;
}

export interface DashboardMetricCard {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

// Application Trends Types
export interface DailyTrendData {
  day: number;
  count: number;
}

export interface MonthlyTrendData {
  month: string;
  count: number;
}

export interface QuarterlyTrendData {
  quarter: string;
  count: number;
}

export interface ApplicationTrendResponse<T> {
  success: boolean;
  data: T[];
}

export type TrendType = "daily" | "monthly" | "quarterly";

export interface ApplicationTrendParams {
  type: TrendType;
  year: number;
  month?: number; // Required for daily type
}
