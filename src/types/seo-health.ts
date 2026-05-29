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
}
