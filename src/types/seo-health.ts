export interface SeoHealthResponse {
  success: boolean;
  data: {
    activeJobs: number;
    expiredJobs: {
      last7Days: number;
      last30Days: number;
      last90Days: number;
    };
    qualityIssues: {
      noDescription: number;
      noCompanyName: number;
      noLocation: number;
      noSalary: number;
    };
    seoPages: {
      total: number;
      withZeroJobs: number;
    };
  };
}

export interface SchemaQualityResponse {
  success: boolean;
  data: {
    missingHiringOrg: number;
    missingEmploymentType: number;
    missingLocation: number;
    remoteMissingSchema: number;
    expiredButActive: number;
    totalActive: number;
  };
}

export interface QualityIssueRow {
  issue: string;
  count: number;
  total: number;
  severity: "critical" | "warning" | "info";
}

export interface MetricCard {
  title: string;
  value: string;
  subtitle?: string;
  color: "green" | "yellow" | "red" | "blue";
  icon: string;
  link?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HealthDetailJob {
  id: string;
  title: string;
  companyName: string | null;
  occupation: { name: string } | null;
  locationCity: string | null;
  locationState: string | null;
  datePosted?: string;
  expiresAt?: string | null;
  salaryRangeStart?: number;
  jobDescription?: string | null;
}

export interface HealthDetailSeoPage {
  id: string;
  slug: string;
  title: string;
  jobCount: number;
  indexable: boolean;
  occupation: { name: string } | null;
  state: { name: string; abbreviation: string } | null;
}

export interface HealthDetailResponse {
  success: boolean;
  data: HealthDetailJob[] | HealthDetailSeoPage[];
  pagination: Pagination;
}

export type SeoHealthMetric =
  | "active-jobs"
  | "expired-7d"
  | "quality-issues"
  | "seo-pages";
