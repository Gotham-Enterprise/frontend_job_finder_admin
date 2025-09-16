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